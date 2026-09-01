<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Super-Admin bypass before all checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermission('users.view') || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('users.create');
    }

    public function update(User $user, User $model): bool
    {
        if ($model->hasRole('admin') && !$user->hasRole('admin')) {
            return false;
        }

        return $user->hasPermission('users.edit') || $user->id === $model->id;
    }

    public function updateStatus(User $user, User $model): Response
    {
        if (!$user->hasPermission('users.status')) {
            return Response::deny(__('Você não possui permissão para alterar o status de usuários.'));
        }

        if ($user->id === $model->id) {
            return Response::deny(__('Você não pode desativar seu próprio usuário.'));
        }

        return Response::allow();
    }

    public function delete(User $user, User $model): Response
    {
        if (!$user->hasPermission('users.delete')) {
            return Response::deny(__('Você não possui permissão para excluir usuários.'));
        }

        if ($user->id === $model->id) {
            return Response::deny(__('Você não pode excluir sua própria conta enquanto estiver conectado.'));
        }

        if ($model->hasRole('admin') && !$user->hasRole('admin')) {
            return Response::deny(__('Apenas administradores podem excluir outros administradores.'));
        }

        return Response::allow();
    }
}
