<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a paginated listing of users with search, role and status filters.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = $this->userService->getPaginatedUsers(
            search: $request->query('search'),
            status: $request->query('status'),
            role: $request->query('role'),
            sortColumn: $request->query('sortColumn', 'created_at'),
            sortDirection: $request->query('sortDirection', 'desc'),
            perPage: (int) $request->query('perPage', 5)
        );

        $usersData = UserResource::collection($users->items())->resolve();

        return response()->json([
            'success' => true,
            'data' => $usersData,
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Store a newly created user in storage with role assignment & audit log.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        try {
            $user = $this->userService->createUser(
                data: $request->validated(),
                creator: $request->user()
            );
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => __('Não foi possível enviar o convite de definição de senha. Tente novamente.'),
            ], 503);
        }

        return (new UserResource($user))
            ->additional([
                'success' => true,
                'message' => __('Usuário criado. Enviamos um link para definição de senha por e-mail.'),
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified user details.
     */
    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        $user->load(['roles.permissions']);
        return new UserResource($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updatedUser = $this->userService->updateUser(
            user: $user,
            data: $request->validated(),
            updater: $request->user()
        );

        return (new UserResource($updatedUser))
            ->additional([
                'success' => true,
                'message' => __('Usuário atualizado com sucesso.'),
            ])
            ->response();
    }

    /**
     * Update user active status.
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $this->authorize('updateStatus', $user);

        $request->validate([
            'status' => ['required', 'string', 'in:active,inactive,suspended'],
        ]);

        $this->userService->changeStatus($user, $request->status, $request->user());

        return response()->json([
            'success' => true,
            'message' => __('Status do usuário atualizado com sucesso.'),
            'data' => new UserResource($user),
        ]);
    }

    /**
    * Send a password reset link to the user.
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        if (!$this->userService->sendPasswordResetLink($user)) {
            return response()->json([
                'success' => false,
                'message' => __('Não foi possível enviar o link de redefinição. Tente novamente.'),
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => __('Link de redefinição de senha enviado com sucesso.'),
            'data' => null,
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->deleteUser($user, $request->user());

        return response()->json([
            'success' => true,
            'message' => __('Usuário excluído com sucesso.'),
            'data' => null,
        ]);
    }
}
