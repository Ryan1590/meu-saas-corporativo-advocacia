<?php

namespace App\Policies;

use App\Models\Advogado;
use App\Models\User;

class AdvogadoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('advogados.view');
    }

    public function view(User $user, Advogado $advogado): bool
    {
        return $user->escritorio_id === $advogado->escritorio_id && $user->hasPermission('advogados.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('advogados.create');
    }

    public function update(User $user, Advogado $advogado): bool
    {
        return $user->escritorio_id === $advogado->escritorio_id && $user->hasPermission('advogados.update');
    }

    public function delete(User $user, Advogado $advogado): bool
    {
        return $user->escritorio_id === $advogado->escritorio_id && $user->hasPermission('advogados.delete');
    }

    public function restore(User $user, Advogado $advogado): bool
    {
        return $user->escritorio_id === $advogado->escritorio_id && $user->hasPermission('advogados.restore');
    }
}
