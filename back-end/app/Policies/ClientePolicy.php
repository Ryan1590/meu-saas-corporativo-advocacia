<?php

namespace App\Policies;

use App\Models\Cliente;
use App\Models\User;

class ClientePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('clientes.view');
    }

    public function view(User $user, Cliente $cliente): bool
    {
        return $user->escritorio_id === $cliente->escritorio_id && $user->hasPermission('clientes.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('clientes.create');
    }

    public function update(User $user, Cliente $cliente): bool
    {
        return $user->escritorio_id === $cliente->escritorio_id && $user->hasPermission('clientes.update');
    }

    public function delete(User $user, Cliente $cliente): bool
    {
        return $user->escritorio_id === $cliente->escritorio_id && $user->hasPermission('clientes.delete');
    }

    public function restore(User $user, Cliente $cliente): bool
    {
        return $user->escritorio_id === $cliente->escritorio_id && $user->hasPermission('clientes.restore');
    }
}
