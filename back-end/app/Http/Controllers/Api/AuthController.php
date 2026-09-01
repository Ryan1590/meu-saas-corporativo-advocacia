<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('As credenciais fornecidas não conferem com nossos registros.'),
                'errors' => ['email' => [__('E-mail ou senha incorretos.')]],
            ], 422);
        }

        if (($user->status ?? 'active') !== 'active') {
            return response()->json([
                'success' => false,
                'message' => __('Esta conta está inativa ou bloqueada. Contate o administrador.'),
            ], 403);
        }

        $expiresAt = now()->addMinutes($validated['remember'] ?? false ? 43200 : 120);
        $token = $user->createToken('auth-token', ['*'], $expiresAt)->plainTextToken;
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();
        $this->audit($user, 'login', 'Login realizado com sucesso.', $request);

        return response()->json([
            'success' => true,
            'message' => __('Login realizado com sucesso.'),
            'data' => [
                'token' => $token,
                'tokenType' => 'Bearer',
                'expiresIn' => ($validated['remember'] ?? false) ? '30 days' : '2 hours',
                'user' => new UserResource($user->load(['roles.permissions'])),
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        abort_unless(config('app.public_registration_enabled'), 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth-token', ['*'], now()->addHours(2))->plainTextToken;
        $this->audit($user, 'registered', 'Conta criada por cadastro público.', $request);

        return response()->json([
            'success' => true,
            'message' => __('Cadastro realizado com sucesso.'),
            'data' => [
                'token' => $token,
                'tokenType' => 'Bearer',
                'user' => new UserResource($user->load(['roles.permissions'])),
            ],
        ], 201);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink(['email' => $request->email]);

        return response()->json([
            'success' => true,
            'message' => __('Se o e-mail existir, enviaremos as instruções de recuperação.'),
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __('Senha redefinida com sucesso.'),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()->load(['roles.permissions'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => __('Logout realizado com sucesso.'),
        ]);
    }

    public function terminateOtherSessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()?->id;
        $query = $request->user()->tokens();
        if ($currentTokenId) {
            $query->whereKeyNot($currentTokenId);
        }
        $terminated = $query->delete();
        $this->audit($request->user(), 'sessions_terminated', 'Sessões paralelas encerradas.', $request, ['terminated_tokens' => $terminated]);

        return response()->json([
            'success' => true,
            'message' => __('Sessões paralelas encerradas com sucesso.'),
        ]);
    }

    public function switchDemoUser(Request $request): JsonResponse
    {
        abort_unless(config('app.demo_mode_enabled'), 404);
        abort_unless($request->user()->hasPermission('auth.switch_demo'), 403);

        $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::query()->with(['roles.permissions'])->findOrFail($request->integer('userId'));
        $token = $user->createToken('demo-switch', ['*'], now()->addMinutes(30))->plainTextToken;
        $this->audit($request->user(), 'demo_user_switched', 'Usuário de demonstração alternado.', $request, [
            'target_user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('Usuário de demonstração alterado com sucesso.'),
            'data' => [
                'token' => $token,
                'tokenType' => 'Bearer',
                'user' => new UserResource($user),
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'avatar' => ['nullable', 'string', 'max:2097152'],
        ]);

        $user->fill($validated)->save();
        $this->audit($user, 'profile_updated', 'Dados do próprio perfil atualizados.', $request, [
            'fields' => array_keys($validated),
        ]);

        return response()->json([
            'success' => true,
            'message' => __('Perfil atualizado com sucesso.'),
            'data' => new UserResource($user->load(['roles.permissions'])),
        ]);
    }

    private function audit(User $user, string $action, string $description, Request $request, array $details = []): void
    {
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'module' => 'auth',
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => $details,
        ]);
    }
}
