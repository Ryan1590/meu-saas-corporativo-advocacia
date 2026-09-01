<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pagamento\StorePagamentoRequest;
use App\Http\Requests\Pagamento\UpdatePagamentoRequest;
use App\Http\Resources\PagamentoResource;
use App\Models\ActivityLog;
use App\Models\Pagamento;
use App\Models\Parcela;
use App\Notifications\JuridicoNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PagamentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Pagamento::class);
        $items = Pagamento::where('escritorio_id', $request->user()->escritorio_id)->with('parcela.contrato')->latest('data_pagamento')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => PagamentoResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    public function store(StorePagamentoRequest $request): JsonResponse
    {
        $payment = DB::transaction(function () use ($request) {
            $parcela = Parcela::lockForUpdate()->whereKey($request->integer('parcela_id'))->where('escritorio_id', $request->user()->escritorio_id)->first();
            if (! $parcela) {
                throw ValidationException::withMessages(['parcela_id' => 'Parcela inválida para este escritório.']);
            } $saldo = (float) $parcela->valor - (float) $parcela->pagamentos()->sum('valor');
            if ((float) $request->input('valor') > $saldo + 0.00001) {
                throw ValidationException::withMessages(['valor' => 'O pagamento não pode exceder o saldo da parcela.']);
            }
            $payment = Pagamento::create([...$request->validated(), 'escritorio_id' => $parcela->escritorio_id, 'created_by' => $request->user()->id]);
            $this->recalculate($parcela);
            $this->log($request, 'created', $payment);
            $request->user()->notify(new JuridicoNotification('pagamento_registrado', 'Pagamento registrado', 'Um pagamento foi registrado.', ['pagamento_id' => $payment->id, 'parcela_id' => $parcela->id]));

            return $payment;
        });

        return response()->json(['success' => true, 'message' => 'Pagamento registrado com sucesso.', 'data' => (new PagamentoResource($payment->load('parcela')))->resolve()], 201);
    }

    public function show(Pagamento $pagamento): JsonResponse
    {
        $this->authorize('view', $pagamento);

        return response()->json(['success' => true, 'data' => (new PagamentoResource($pagamento->load('parcela')))->resolve()]);
    }

    public function update(UpdatePagamentoRequest $request, Pagamento $pagamento): JsonResponse
    {
        DB::transaction(function () use ($request, $pagamento) {
            $parcela = Parcela::lockForUpdate()->findOrFail($pagamento->parcela_id);
            $saldoSemPagamento = (float) $parcela->valor - (float) $parcela->pagamentos()->whereKeyNot($pagamento->id)->sum('valor');
            if ((float) $request->input('valor') > $saldoSemPagamento + 0.00001) {
                throw ValidationException::withMessages(['valor' => 'O pagamento não pode exceder o saldo da parcela.']);
            }
            $old = $pagamento->only(['valor', 'data_pagamento', 'forma_pagamento', 'comprovante', 'observacoes']);
            $pagamento->update($request->validated());
            $this->recalculate($parcela);
            $this->log($request, 'updated', $pagamento, ['changed_fields' => array_keys($pagamento->getChanges()), 'old' => $old, 'new' => $pagamento->only(array_keys($old))]);
        });

        return response()->json(['success' => true, 'message' => 'Pagamento atualizado com sucesso.', 'data' => (new PagamentoResource($pagamento->fresh()->load('parcela')))->resolve()]);
    }

    public function destroy(Request $request, Pagamento $pagamento): JsonResponse
    {
        $this->authorize('delete', $pagamento);
        DB::transaction(function () use ($request, $pagamento) {
            $parcela = Parcela::lockForUpdate()->findOrFail($pagamento->parcela_id);
            $this->log($request, 'deleted', $pagamento);
            $pagamento->delete();
            $this->recalculate($parcela);
        });

        return response()->json(['success' => true, 'message' => 'Pagamento excluído com sucesso.', 'data' => null]);
    }

    public function cancel(Request $request, Pagamento $pagamento): JsonResponse
    {
        $this->authorize('delete', $pagamento);

        return $this->destroy($request, $pagamento)->setData(['success' => true, 'message' => 'Pagamento cancelado com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $pagamento): JsonResponse
    {
        $item = Pagamento::withTrashed()->findOrFail($pagamento);
        $this->authorize('restore', $item);
        DB::transaction(function () use ($request, $item) {
            $parcela = Parcela::lockForUpdate()->findOrFail($item->parcela_id);
            $saldo = (float) $parcela->valor - (float) $parcela->pagamentos()->sum('valor');
            if ((float) $item->valor > $saldo + 0.00001) {
                throw ValidationException::withMessages(['pagamento' => 'Não é possível restaurar pagamento que excede o saldo atual.']);
            }
            $item->restore();
            $this->recalculate($parcela);
            $this->log($request, 'restored', $item);
        });

        return response()->json(['success' => true, 'message' => 'Pagamento restaurado com sucesso.', 'data' => (new PagamentoResource($item->load('parcela')))->resolve()]);
    }

    private function recalculate(Parcela $parcela): void
    {
        $total = (float) $parcela->pagamentos()->sum('valor');
        $paid = $total >= (float) $parcela->valor;
        $parcela->update(['status' => $paid ? 'paga' : ($total > 0 ? 'parcialmente_paga' : 'pendente'), 'data_pagamento' => $paid ? $parcela->pagamentos()->max('data_pagamento') : null]);
    }

    private function log(Request $request, string $action, Pagamento $item, array $details = []): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'pagamentos', 'description' => "Pagamento {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['pagamento_id' => $item->id, 'parcela_id' => $item->parcela_id, ...$details]]);
    }
}
