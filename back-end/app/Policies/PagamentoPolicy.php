<?php

namespace App\Policies;

use App\Models\Pagamento;
use App\Models\User;

class PagamentoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('pagamentos.view');
    }

    public function view(User $user, Pagamento $pagamento): bool
    {
        return $user->escritorio_id === $pagamento->escritorio_id && $user->hasPermission('pagamentos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('pagamentos.create');
    }

    public function update(User $user, Pagamento $pagamento): bool
    {
        return $user->escritorio_id === $pagamento->escritorio_id && $user->hasPermission('pagamentos.update');
    }

    public function delete(User $user, Pagamento $pagamento): bool
    {
        return $user->escritorio_id === $pagamento->escritorio_id && $user->hasPermission('pagamentos.delete');
    }

    public function restore(User $user, Pagamento $pagamento): bool
    {
        return $user->escritorio_id === $pagamento->escritorio_id && $user->hasPermission('pagamentos.restore');
    }
}
