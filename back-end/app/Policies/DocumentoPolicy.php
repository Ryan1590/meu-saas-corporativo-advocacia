<?php

namespace App\Policies;

use App\Models\Documento;
use App\Models\User;

class DocumentoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('documentos.view');
    }

    public function view(User $user, Documento $documento): bool
    {
        return $user->escritorio_id === $documento->escritorio_id && $user->hasPermission('documentos.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('documentos.create');
    }

    public function delete(User $user, Documento $documento): bool
    {
        return $user->escritorio_id === $documento->escritorio_id && $user->hasPermission('documentos.delete');
    }

    public function download(User $user, Documento $documento): bool
    {
        return $user->escritorio_id === $documento->escritorio_id && $user->hasPermission('documentos.download');
    }

    public function restore(User $user, Documento $documento): bool
    {
        return $user->escritorio_id === $documento->escritorio_id && $user->hasPermission('documentos.restore');
    }
}
