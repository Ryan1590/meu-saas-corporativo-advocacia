<?php

namespace App\Policies;

use App\Models\Parcela;
use App\Models\User;

class ParcelaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('parcelas.view');
    }

    public function view(User $user, Parcela $parcela): bool
    {
        return $user->escritorio_id === $parcela->escritorio_id && $user->hasPermission('parcelas.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('parcelas.create');
    }

    public function update(User $user, Parcela $parcela): bool
    {
        return $user->escritorio_id === $parcela->escritorio_id && $user->hasPermission('parcelas.update');
    }

    public function delete(User $user, Parcela $parcela): bool
    {
        return $user->escritorio_id === $parcela->escritorio_id && $user->hasPermission('parcelas.delete');
    }

    public function restore(User $user, Parcela $parcela): bool
    {
        return $user->escritorio_id === $parcela->escritorio_id && $user->hasPermission('parcelas.restore');
    }
}
