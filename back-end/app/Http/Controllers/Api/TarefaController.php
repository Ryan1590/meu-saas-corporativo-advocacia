<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tarefa\TarefaRequest;
use App\Http\Resources\TarefaResource;
use App\Models\ActivityLog;
use App\Models\Cliente;
use App\Models\Processo;
use App\Models\Tarefa;
use App\Models\User;
use App\Notifications\JuridicoNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TarefaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Tarefa::class);
        $items = Tarefa::where('escritorio_id', $request->user()->escritorio_id)->with('responsavel')->orderBy('data_vencimento')->paginate($this->perPage($request));

        return $this->paginated($items);
    }

    public function store(TarefaRequest $request): JsonResponse
    {
        $this->relations($request);
        $item = Tarefa::create([...$request->validated(), 'escritorio_id' => $request->user()->escritorio_id, 'criador_id' => $request->user()->id, 'concluido_em' => $request->input('status') === 'concluida' ? now() : null]);
        $this->log($request, 'created', $item);
        $this->notifyResponsible($item, 'tarefa_atribuida', 'Tarefa atribuída');

        return response()->json(['success' => true, 'message' => 'Tarefa cadastrada com sucesso.', 'data' => (new TarefaResource($item))->resolve()], 201);
    }

    public function show(Tarefa $tarefa): JsonResponse
    {
        $this->authorize('view', $tarefa);

        return response()->json(['success' => true, 'data' => (new TarefaResource($tarefa->load(['processo', 'cliente', 'responsavel'])))->resolve()]);
    }

    public function update(TarefaRequest $request, Tarefa $tarefa): JsonResponse
    {
        $this->relations($request);
        $data = $request->validated();
        $data['concluido_em'] = ($data['status'] ?? $tarefa->status) === 'concluida' ? ($tarefa->concluido_em ?? now()) : null;
        $old = $tarefa->only(array_keys($data));
        $tarefa->update($data);
        $changed = collect($tarefa->getChanges())->except(['updated_at'])->all();
        $this->log($request, 'updated', $tarefa, ['changed_fields' => array_keys($changed), 'old' => collect($old)->only(array_keys($changed))->all(), 'new' => $changed]);
        if (array_key_exists('responsavel_id', $changed)) {
            $this->notifyResponsible($tarefa, 'tarefa_atribuida', 'Tarefa atribuída');
        }

        return response()->json(['success' => true, 'message' => 'Tarefa atualizada com sucesso.', 'data' => (new TarefaResource($tarefa->fresh()))->resolve()]);
    }

    public function destroy(Request $request, Tarefa $tarefa): JsonResponse
    {
        $this->authorize('delete', $tarefa);
        $this->log($request, 'deleted', $tarefa);
        $tarefa->delete();

        return response()->json(['success' => true, 'message' => 'Tarefa excluída com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $tarefa): JsonResponse
    {
        $item = Tarefa::withTrashed()->findOrFail($tarefa);
        $this->authorize('restore', $item);
        $item->restore();
        $this->log($request, 'restored', $item);

        return response()->json(['success' => true, 'message' => 'Tarefa restaurada com sucesso.', 'data' => (new TarefaResource($item))->resolve()]);
    }

    private function relations(Request $request): void
    {
        $office = $request->user()->escritorio_id;
        foreach (['processo_id' => Processo::class, 'cliente_id' => Cliente::class, 'responsavel_id' => User::class] as $field => $model) {
            if ($request->filled($field) && ! $model::whereKey($request->integer($field))->where('escritorio_id', $office)->exists()) {
                throw ValidationException::withMessages([$field => 'A entidade relacionada deve pertencer ao mesmo escritório.']);
            }
        }
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->query('perPage', 5), 100));
    }

    private function paginated($items): JsonResponse
    {
        return response()->json(['success' => true, 'data' => TarefaResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    private function notifyResponsible(Tarefa $tarefa, string $tipo, string $titulo): void
    {
        $tarefa->responsavel?->notify(new JuridicoNotification($tipo, $titulo, $tarefa->titulo, ['tarefa_id' => $tarefa->id]));
    }

    private function log(Request $request, string $action, Tarefa $item, array $details = []): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'tarefas', 'description' => "Tarefa {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['tarefa_id' => $item->id, ...$details]]);
    }
}
