<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use RuntimeException;

class UserService
{
    /**
     * Map frontend sort keys to database columns.
     */
    private const SORTABLE_COLUMNS = [
        'id' => 'id',
        'name' => 'name',
        'email' => 'email',
        'dataNascimento' => 'data_nascimento',
        'status' => 'status',
        'lastLoginAt' => 'last_login_at',
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
        'created_at' => 'created_at',
        'updated_at' => 'updated_at',
        'last_login_at' => 'last_login_at',
    ];

    public function getPaginatedUsers(
        ?string $search = null,
        ?string $status = null,
        ?string $role = null,
        string $sortColumn = 'created_at',
        string $sortDirection = 'desc',
        int $perPage = 5
    ): LengthAwarePaginator {
        $resolvedSortColumn = self::SORTABLE_COLUMNS[$sortColumn] ?? 'created_at';
        $resolvedSortDirection = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        $perPage = max(1, min($perPage, 100));

        return User::query()
            ->with(['roles.permissions'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($role && $role !== 'all', function ($q) use ($role) {
                $q->whereHas('roles', fn ($r) => $r->where('name', $role)->orWhere('id', $role));
            })
            ->orderBy($resolvedSortColumn, $resolvedSortDirection)
            ->paginate($perPage);
    }

    public function createUser(array $data, ?User $creator = null): User
    {
        return DB::transaction(function () use ($data, $creator) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'data_nascimento' => $data['data_nascimento'] ?? null,
                'avatar' => $data['avatar'] ?? null,
                'password' => Hash::make(Str::password(40)),
                'status' => $data['status'] ?? 'active',
            ]);

            if (! empty($data['roles'])) {
                $user->roles()->sync($data['roles']);
            }

            ActivityLog::create([
                'user_id' => $creator?->id,
                'action' => 'created',
                'module' => 'users',
                'description' => "Usuário \"{$user->name}\" ({$user->email}) cadastrado com sucesso",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'details' => ['user_id' => $user->id, 'roles' => $data['roles'] ?? []],
            ]);

            if (! $this->sendPasswordResetLink($user)) {
                throw new RuntimeException('Não foi possível enviar o convite de definição de senha.');
            }

            return $user->load('roles.permissions');
        });
    }

    public function sendPasswordResetLink(User $user): bool
    {
        return Password::sendResetLink(['email' => $user->email]) === Password::RESET_LINK_SENT;
    }

    public function updateUser(User $user, array $data, ?User $updater = null): User
    {
        return DB::transaction(function () use ($user, $data, $updater) {
            $updateFields = [
                'name' => $data['name'] ?? $user->name,
                'email' => $data['email'] ?? $user->email,
                'data_nascimento' => $data['data_nascimento'] ?? $user->data_nascimento,
                'avatar' => array_key_exists('avatar', $data) ? ($data['avatar'] ?: null) : $user->avatar,
                'status' => $data['status'] ?? $user->status,
            ];

            if (! empty($data['password'])) {
                $updateFields['password'] = Hash::make($data['password']);
            }

            $user->update($updateFields);

            if (isset($data['roles'])) {
                $user->roles()->sync($data['roles']);
            }

            ActivityLog::create([
                'user_id' => $updater?->id,
                'action' => 'updated',
                'module' => 'users',
                'description' => "Dados do usuário \"{$user->name}\" atualizados",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $user->fresh(['roles.permissions']);
        });
    }

    public function changeStatus(User $user, string $status, ?User $actor = null): void
    {
        $old = $user->status;
        $user->update(['status' => $status]);

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'status_changed',
            'module' => 'users',
            'description' => "Status do usuário \"{$user->name}\" alterado de {$old} para {$status}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function deleteUser(User $user, ?User $actor = null): void
    {
        DB::transaction(function () use ($user, $actor) {
            ActivityLog::create([
                'user_id' => $actor?->id,
                'action' => 'deleted',
                'module' => 'users',
                'description' => "Usuário \"{$user->name}\" ({$user->email}) foi excluído",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $user->delete();
        });
    }
}
