<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contrato\StoreContratoRequest;
use App\Http\Requests\Contrato\UpdateContratoRequest;
use App\Http\Resources\ContratoResource;
use App\Models\ActivityLog;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Processo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContratoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Contrato::class);
        $items = Contrato::where('escritorio_id', $request->user()->escritorio_id)->with(['cliente', 'processo'])->latest()->paginate($this->perPage($request));

        return $this->paginated($items);
    }

    public function store(StoreContratoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->relations($data, $request);
        $item = Contrato::create([...$data, 'escritorio_id' => $request->user()->escritorio_id, 'created_by' => $request->user()->id, 'updated_by' => $request->user()->id]);
        $this->log($request, 'created', $item);

        return response()->json(['success' => true, 'message' => 'Contrato cadastrado com sucesso.', 'data' => (new ContratoResource($item->load(['cliente', 'processo'])))->resolve()], 201);
    }

    public function show(Contrato $contrato): JsonResponse
    {
        $this->authorize('view', $contrato);

        return response()->json(['success' => true, 'data' => (new ContratoResource($contrato->load(['cliente', 'processo', 'parcelas.pagamentos'])))->resolve()]);
    }

    public function update(UpdateContratoRequest $request, Contrato $contrato): JsonResponse
    {
        $data = $request->validated();
        $this->relations($data, $request);
        $contrato->update([...$data, 'updated_by' => $request->user()->id]);
        $this->log($request, 'updated', $contrato);

        return response()->json(['success' => true, 'message' => 'Contrato atualizado com sucesso.', 'data' => (new ContratoResource($contrato->fresh()->load(['cliente', 'processo'])))->resolve()]);
    }

    public function destroy(Request $request, Contrato $contrato): JsonResponse
    {
        $this->authorize('delete', $contrato);
        $this->log($request, 'deleted', $contrato);
        $contrato->delete();

        return response()->json(['success' => true, 'message' => 'Contrato excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $contrato): JsonResponse
    {
        $item = Contrato::withTrashed()->findOrFail($contrato);
        $this->authorize('restore', $item);
        $item->restore();
        $this->log($request, 'restored', $item);

        return response()->json(['success' => true, 'message' => 'Contrato restaurado com sucesso.', 'data' => (new ContratoResource($item->load(['cliente', 'processo'])))->resolve()]);
    }

    private function relations(array $data, Request $request): void
    {
        $office = $request->user()->escritorio_id;
        $valid = Cliente::whereKey($data['cliente_id'])->where('escritorio_id', $office)->exists() && (! isset($data['processo_id']) || Processo::whereKey($data['processo_id'])->where('escritorio_id', $office)->exists());
        if (! $valid) {
            throw ValidationException::withMessages(['cliente_id' => 'As entidades relacionadas devem pertencer ao mesmo escritório.']);
        }
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->query('perPage', 5), 100));
    }

    private function paginated($items): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ContratoResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    private function log(Request $request, string $action, Contrato $item): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'contratos', 'description' => "Contrato {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['contrato_id' => $item->id]]);
    }
}
