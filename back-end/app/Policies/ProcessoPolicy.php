<?php

namespace App\Policies;

use App\Models\Processo;
use App\Models\User;

class ProcessoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('processos.view');
    }

    public function view(User $user, Processo $processo): bool
    {
        return $user->escritorio_id === $processo->escritorio_id && $user->hasPermission('processos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('processos.create');
    }

    public function update(User $user, Processo $processo): bool
    {
        return $user->escritorio_id === $processo->escritorio_id && $user->hasPermission('processos.update');
    }

    public function delete(User $user, Processo $processo): bool
    {
        return $user->escritorio_id === $processo->escritorio_id && $user->hasPermission('processos.delete');
    }

    public function restore(User $user, Processo $processo): bool
    {
        return $user->escritorio_id === $processo->escritorio_id && $user->hasPermission('processos.restore');
    }
}
