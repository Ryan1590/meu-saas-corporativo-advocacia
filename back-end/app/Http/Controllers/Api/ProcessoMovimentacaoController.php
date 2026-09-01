<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessoMovimentacao\StoreProcessoMovimentacaoRequest;
use App\Http\Requests\ProcessoMovimentacao\UpdateProcessoMovimentacaoRequest;
use App\Http\Resources\ProcessoMovimentacaoResource;
use App\Models\ActivityLog;
use App\Models\Processo;
use App\Models\ProcessoMovimentacao;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProcessoMovimentacaoController extends Controller
{
    public function index(Request $request, Processo $processo): JsonResponse
    {
        $this->authorize('viewAny', ProcessoMovimentacao::class);
        $this->ensureProcessScope($processo, $request->user());
        $movimentacoes = $processo->movimentacoes()->with('responsavel')->orderByDesc('data_movimentacao')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => ProcessoMovimentacaoResource::collection($movimentacoes->items())->resolve(), 'meta' => ['currentPage' => $movimentacoes->currentPage(), 'lastPage' => $movimentacoes->lastPage(), 'perPage' => $movimentacoes->perPage(), 'total' => $movimentacoes->total()]]);
    }

    public function store(StoreProcessoMovimentacaoRequest $request, Processo $processo): JsonResponse
    {
        $this->ensureProcessScope($processo, $request->user());
        $data = $request->validated();
        $this->ensureResponsibleScope($data['responsavel_id'] ?? null, $request->user());
        $movimentacao = ProcessoMovimentacao::create([...$data, 'escritorio_id' => $processo->escritorio_id, 'processo_id' => $processo->id, 'created_by' => $request->user()->id]);
        $this->log($request, 'created', $movimentacao, 'Movimentação de processo cadastrada.');

        return response()->json(['success' => true, 'message' => 'Movimentação cadastrada com sucesso.', 'data' => (new ProcessoMovimentacaoResource($movimentacao->load('responsavel')))->resolve()], 201);
    }

    public function show(Request $request, Processo $processo, ProcessoMovimentacao $movimentacao): JsonResponse
    {
        $this->authorize('view', $movimentacao);
        $this->ensureNestedScope($processo, $movimentacao, $request->user());

        return response()->json(['success' => true, 'data' => (new ProcessoMovimentacaoResource($movimentacao->load('responsavel')))->resolve()]);
    }

    public function update(UpdateProcessoMovimentacaoRequest $request, Processo $processo, ProcessoMovimentacao $movimentacao): JsonResponse
    {
        $this->ensureNestedScope($processo, $movimentacao, $request->user());
        $data = $request->validated();
        $this->ensureResponsibleScope($data['responsavel_id'] ?? null, $request->user());
        $movimentacao->update($data);
        $this->log($request, 'updated', $movimentacao, 'Movimentação de processo atualizada.');

        return response()->json(['success' => true, 'message' => 'Movimentação atualizada com sucesso.', 'data' => (new ProcessoMovimentacaoResource($movimentacao->fresh()->load('responsavel')))->resolve()]);
    }

    public function destroy(Request $request, Processo $processo, ProcessoMovimentacao $movimentacao): JsonResponse
    {
        $this->authorize('delete', $movimentacao);
        $this->ensureNestedScope($processo, $movimentacao, $request->user());
        $this->log($request, 'deleted', $movimentacao, 'Movimentação de processo excluída.');
        $movimentacao->delete();

        return response()->json(['success' => true, 'message' => 'Movimentação excluída com sucesso.', 'data' => null]);
    }

    private function ensureProcessScope(Processo $processo, User $user): void
    {
        abort_unless($processo->escritorio_id === $user->escritorio_id, 404);
    }

    private function ensureNestedScope(Processo $processo, ProcessoMovimentacao $movimentacao, User $user): void
    {
        $this->ensureProcessScope($processo, $user);
        abort_unless($movimentacao->processo_id === $processo->id, 404);
    }

    private function ensureResponsibleScope(?int $responsavelId, User $user): void
    {
        if ($responsavelId && ! User::whereKey($responsavelId)->where('escritorio_id', $user->escritorio_id)->exists()) {
            throw ValidationException::withMessages(['responsavel_id' => 'O responsável deve pertencer ao mesmo escritório.']);
        }
    }

    private function log(Request $request, string $action, ProcessoMovimentacao $movimentacao, string $description): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'processo-movimentacoes', 'description' => $description, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['processo_id' => $movimentacao->processo_id, 'movimentacao_id' => $movimentacao->id]]);
    }
}
