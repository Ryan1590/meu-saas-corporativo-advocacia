<?php

namespace App\Policies;

use App\Models\User;

class RelatorioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('reports.view');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('reports.export');
    }
}
