<?php

namespace App\Policies;

use App\Models\Escritorio;
use App\Models\User;

class EscritorioPolicy
{
    public function view(User $user, Escritorio $item): bool
    {
        return $user->hasRole('admin') && $user->escritorio_id === $item->id;
    }

    public function update(User $user, Escritorio $item): bool
    {
        return $user->hasRole('admin') && $user->escritorio_id === $item->id;
    }
}
