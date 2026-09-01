<?php

namespace App\Policies;

use App\Models\ProcessoPrazo;
use App\Models\User;

class ProcessoPrazoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('processo-prazos.view');
    }

    public function view(User $user, ProcessoPrazo $prazo): bool
    {
        return $user->escritorio_id === $prazo->escritorio_id && $user->hasPermission('processo-prazos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('processo-prazos.create');
    }

    public function update(User $user, ProcessoPrazo $prazo): bool
    {
        return $user->escritorio_id === $prazo->escritorio_id && $user->hasPermission('processo-prazos.update');
    }

    public function delete(User $user, ProcessoPrazo $prazo): bool
    {
        return $user->escritorio_id === $prazo->escritorio_id && $user->hasPermission('processo-prazos.delete');
    }

    public function restore(User $user, ProcessoPrazo $prazo): bool
    {
        return $user->escritorio_id === $prazo->escritorio_id && $user->hasPermission('processo-prazos.restore');
    }
}
