<?php

namespace App\Policies;

use App\Models\ProcessoMovimentacao;
use App\Models\User;

class ProcessoMovimentacaoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('processo-movimentacoes.view');
    }

    public function view(User $user, ProcessoMovimentacao $movimentacao): bool
    {
        return $user->escritorio_id === $movimentacao->escritorio_id && $user->hasPermission('processo-movimentacoes.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('processo-movimentacoes.create');
    }

    public function update(User $user, ProcessoMovimentacao $movimentacao): bool
    {
        return $user->escritorio_id === $movimentacao->escritorio_id && $user->hasPermission('processo-movimentacoes.update');
    }

    public function delete(User $user, ProcessoMovimentacao $movimentacao): bool
    {
        return $user->escritorio_id === $movimentacao->escritorio_id && $user->hasPermission('processo-movimentacoes.delete');
    }
}
