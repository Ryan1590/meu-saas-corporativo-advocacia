<?php

namespace App\Policies;

use App\Models\StatusProcesso;
use App\Models\User;

class StatusProcessoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('status-processos.view');
    }

    public function view(User $user, StatusProcesso $status): bool
    {
        return $user->escritorio_id === $status->escritorio_id && $user->hasPermission('status-processos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('status-processos.create');
    }

    public function update(User $user, StatusProcesso $status): bool
    {
        return $user->escritorio_id === $status->escritorio_id && $user->hasPermission('status-processos.update');
    }

    public function delete(User $user, StatusProcesso $status): bool
    {
        return $user->escritorio_id === $status->escritorio_id && $user->hasPermission('status-processos.delete');
    }
}
