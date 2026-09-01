<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Parcela\StoreParcelaRequest;
use App\Http\Requests\Parcela\UpdateParcelaRequest;
use App\Http\Resources\ParcelaResource;
use App\Models\ActivityLog;
use App\Models\Contrato;
use App\Models\Parcela;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ParcelaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Parcela::class);
        $items = Parcela::where('escritorio_id', $request->user()->escritorio_id)->with('contrato')->orderBy('data_vencimento')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => ParcelaResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    public function store(StoreParcelaRequest $request): JsonResponse
    {
        $contrato = $this->contrato($request->input('contrato_id'), $request);
        $this->ensureUniqueNumber($contrato, $request->integer('numero'));
        $item = Parcela::create([...$request->validated(), 'contrato_id' => $contrato->id, 'escritorio_id' => $contrato->escritorio_id]);
        $this->log($request, 'created', $item);

        return response()->json(['success' => true, 'message' => 'Parcela cadastrada com sucesso.', 'data' => (new ParcelaResource($item))->resolve()], 201);
    }

    public function show(Parcela $parcela): JsonResponse
    {
        $this->authorize('view', $parcela);

        return response()->json(['success' => true, 'data' => (new ParcelaResource($parcela->load('pagamentos')))->resolve()]);
    }

    public function update(UpdateParcelaRequest $request, Parcela $parcela): JsonResponse
    {
        $this->ensurePaidFits($parcela, (float) $request->input('valor'));
        $parcela->update($request->validated());
        $this->recalculate($parcela);
        $this->log($request, 'updated', $parcela);

        return response()->json(['success' => true, 'message' => 'Parcela atualizada com sucesso.', 'data' => (new ParcelaResource($parcela->fresh()))->resolve()]);
    }

    public function destroy(Request $request, Parcela $parcela): JsonResponse
    {
        $this->authorize('delete', $parcela);
        $this->log($request, 'deleted', $parcela);
        $parcela->delete();

        return response()->json(['success' => true, 'message' => 'Parcela excluída com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $parcela): JsonResponse
    {
        $item = Parcela::withTrashed()->findOrFail($parcela);
        $this->authorize('restore', $item);
        $item->restore();
        $this->recalculate($item);
        $this->log($request, 'restored', $item);

        return response()->json(['success' => true, 'message' => 'Parcela restaurada com sucesso.', 'data' => (new ParcelaResource($item))->resolve()]);
    }

    private function contrato(?int $id, Request $request): Contrato
    {
        $contrato = Contrato::whereKey($id)->where('escritorio_id', $request->user()->escritorio_id)->first();
        abort_unless($contrato, 422, 'Contrato inválido para este escritório.');

        return $contrato;
    }

    private function ensureUniqueNumber(Contrato $contrato, int $number): void
    {
        if ($contrato->parcelas()->where('numero', $number)->exists()) {
            throw ValidationException::withMessages(['numero' => 'Já existe uma parcela com este número no contrato.']);
        }
    }

    private function ensurePaidFits(Parcela $parcela, float $value): void
    {
        if ((float) $parcela->pagamentos()->sum('valor') > $value) {
            throw ValidationException::withMessages(['valor' => 'O valor não pode ser menor que os pagamentos já registrados.']);
        }
    }

    private function recalculate(Parcela $parcela): void
    {
        $total = (float) $parcela->pagamentos()->sum('valor');
        $paid = $total >= (float) $parcela->valor;
        $parcela->update(['status' => $paid ? 'paga' : ($total > 0 ? 'parcialmente_paga' : 'pendente'), 'data_pagamento' => $paid ? $parcela->pagamentos()->max('data_pagamento') : null]);
    }

    private function log(Request $request, string $action, Parcela $item): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'parcelas', 'description' => "Parcela {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['parcela_id' => $item->id]]);
    }
}
