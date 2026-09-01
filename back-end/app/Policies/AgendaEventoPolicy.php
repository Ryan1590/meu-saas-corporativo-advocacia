<?php

namespace App\Policies;

use App\Models\AgendaEvento;
use App\Models\User;

class AgendaEventoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('agenda.view');
    }

    public function view(User $user, AgendaEvento $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('agenda.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('agenda.create');
    }

    public function update(User $user, AgendaEvento $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('agenda.update');
    }

    public function delete(User $user, AgendaEvento $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('agenda.delete');
    }

    public function restore(User $user, AgendaEvento $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('agenda.restore');
    }
}
