<?php

namespace App\Policies;

use App\Models\Tarefa;
use App\Models\User;

class TarefaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('tarefas.view');
    }

    public function view(User $user, Tarefa $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('tarefas.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('tarefas.create');
    }

    public function update(User $user, Tarefa $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('tarefas.update');
    }

    public function delete(User $user, Tarefa $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('tarefas.delete');
    }

    public function restore(User $user, Tarefa $item): bool
    {
        return $user->escritorio_id === $item->escritorio_id && $user->hasPermission('tarefas.restore');
    }
}
