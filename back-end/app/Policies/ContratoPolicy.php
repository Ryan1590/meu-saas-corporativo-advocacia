<?php

namespace App\Policies;

use App\Models\Contrato;
use App\Models\User;

class ContratoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('contratos.view');
    }

    public function view(User $user, Contrato $contrato): bool
    {
        return $user->escritorio_id === $contrato->escritorio_id && $user->hasPermission('contratos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('contratos.create');
    }

    public function update(User $user, Contrato $contrato): bool
    {
        return $user->escritorio_id === $contrato->escritorio_id && $user->hasPermission('contratos.update');
    }

    public function delete(User $user, Contrato $contrato): bool
    {
        return $user->escritorio_id === $contrato->escritorio_id && $user->hasPermission('contratos.delete');
    }

    public function restore(User $user, Contrato $contrato): bool
    {
        return $user->escritorio_id === $contrato->escritorio_id && $user->hasPermission('contratos.restore');
    }
}
