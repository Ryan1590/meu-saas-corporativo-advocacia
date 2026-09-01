<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ClienteService
{
    private const SORTABLE_COLUMNS = ['nome' => 'nome', 'tipoPessoa' => 'tipo_pessoa', 'email' => 'email', 'status' => 'status', 'createdAt' => 'created_at', 'created_at' => 'created_at'];

    public function getPaginatedClientes(User $user, ?string $search, ?string $tipoPessoa, ?string $status, string $sortColumn, string $sortDirection, int $perPage): LengthAwarePaginator
    {
        $sortColumn = self::SORTABLE_COLUMNS[$sortColumn] ?? 'created_at';
        $sortDirection = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        return Cliente::query()
            ->where('escritorio_id', $user->escritorio_id)
            ->withCount('processos')
            ->when($search, fn ($query) => $query->where(fn ($filter) => $filter->where('nome', 'like', "%{$search}%")->orWhere('razao_social', 'like', "%{$search}%")->orWhere('cpf', 'like', "%{$search}%")->orWhere('cnpj', 'like', "%{$search}%")))
            ->when($tipoPessoa && $tipoPessoa !== 'all', fn ($query) => $query->where('tipo_pessoa', $tipoPessoa))
            ->when($status && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderBy($sortColumn, $sortDirection)
            ->paginate(max(1, min($perPage, 100)));
    }

    public function createCliente(array $data, User $actor): Cliente
    {
        return DB::transaction(function () use ($data, $actor) {
            $cliente = Cliente::create([...$data, 'escritorio_id' => $actor->escritorio_id, 'created_by' => $actor->id, 'updated_by' => $actor->id]);
            $this->log($actor, 'created', $cliente, 'Cliente cadastrado.');

            return $cliente->loadCount('processos');
        });
    }

    public function updateCliente(Cliente $cliente, array $data, User $actor): Cliente
    {
        return DB::transaction(function () use ($cliente, $data, $actor) {
            $changedFields = array_keys(array_diff_assoc($data, $cliente->only(array_keys($data))));
            $cliente->update([...$data, 'updated_by' => $actor->id]);
            $this->log($actor, 'updated', $cliente, 'Dados do cliente atualizados.', ['changed_fields' => $changedFields]);

            return $cliente->fresh()->loadCount('processos');
        });
    }

    public function deleteCliente(Cliente $cliente, User $actor): void
    {
        DB::transaction(function () use ($cliente, $actor) {
            $this->log($actor, 'deleted', $cliente, 'Cliente excluído logicamente.');
            $cliente->delete();
        });
    }

    public function restoreCliente(Cliente $cliente, User $actor): Cliente
    {
        return DB::transaction(function () use ($cliente, $actor) {
            $cliente->restore();
            $this->log($actor, 'restored', $cliente, 'Cliente restaurado.');

            return $cliente->loadCount('processos');
        });
    }

    private function log(User $actor, string $action, Cliente $cliente, string $description, array $details = []): void
    {
        ActivityLog::create(['user_id' => $actor->id, 'action' => $action, 'module' => 'clientes', 'description' => $description, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent(), 'details' => ['cliente_id' => $cliente->id, ...$details]]);
    }
}
