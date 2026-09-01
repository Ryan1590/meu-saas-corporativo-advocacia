<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\StoreClienteRequest;
use App\Http\Requests\Cliente\UpdateClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use App\Services\ClienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function __construct(private readonly ClienteService $clienteService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Cliente::class);
        $clientes = $this->clienteService->getPaginatedClientes($request->user(), $request->query('search'), $request->query('tipoPessoa'), $request->query('status'), $request->query('sortColumn', 'created_at'), $request->query('sortDirection', 'desc'), (int) $request->query('perPage', 5));

        return response()->json(['success' => true, 'data' => ClienteResource::collection($clientes->items())->resolve(), 'meta' => ['currentPage' => $clientes->currentPage(), 'lastPage' => $clientes->lastPage(), 'perPage' => $clientes->perPage(), 'total' => $clientes->total()]]);
    }

    public function store(StoreClienteRequest $request): JsonResponse
    {
        $cliente = $this->clienteService->createCliente($request->validated(), $request->user());

        return (new ClienteResource($cliente))->additional(['success' => true, 'message' => 'Cliente cadastrado com sucesso.'])->response()->setStatusCode(201);
    }

    public function show(Cliente $cliente): ClienteResource
    {
        $this->authorize('view', $cliente);

        return new ClienteResource($cliente->loadCount('processos'));
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): JsonResponse
    {
        $cliente = $this->clienteService->updateCliente($cliente, $request->validated(), $request->user());

        return (new ClienteResource($cliente))->additional(['success' => true, 'message' => 'Cliente atualizado com sucesso.'])->response();
    }

    public function destroy(Request $request, Cliente $cliente): JsonResponse
    {
        $this->authorize('delete', $cliente);
        $this->clienteService->deleteCliente($cliente, $request->user());

        return response()->json(['success' => true, 'message' => 'Cliente excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $cliente): JsonResponse
    {
        $model = Cliente::withTrashed()->findOrFail($cliente);
        $this->authorize('restore', $model);
        $model = $this->clienteService->restoreCliente($model, $request->user());

        return (new ClienteResource($model))->additional(['success' => true, 'message' => 'Cliente restaurado com sucesso.'])->response();
    }
}
