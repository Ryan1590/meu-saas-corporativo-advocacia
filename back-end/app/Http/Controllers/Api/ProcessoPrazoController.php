<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessoPrazo\StoreProcessoPrazoRequest;
use App\Http\Requests\ProcessoPrazo\UpdateProcessoPrazoRequest;
use App\Http\Resources\ProcessoPrazoResource;
use App\Models\ActivityLog;
use App\Models\Processo;
use App\Models\ProcessoPrazo;
use App\Models\User;
use App\Notifications\JuridicoNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProcessoPrazoController extends Controller
{
    public function index(Request $request, Processo $processo): JsonResponse
    {
        $this->authorize('viewAny', ProcessoPrazo::class);
        $this->ensureProcessScope($processo, $request->user());
        $prazos = $processo->prazos()->with('responsavel')->orderBy('data_vencimento')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => ProcessoPrazoResource::collection($prazos->items())->resolve(), 'meta' => ['currentPage' => $prazos->currentPage(), 'lastPage' => $prazos->lastPage(), 'perPage' => $prazos->perPage(), 'total' => $prazos->total()]]);
    }

    public function store(StoreProcessoPrazoRequest $request, Processo $processo): JsonResponse
    {
        $this->ensureProcessScope($processo, $request->user());
        $data = $request->validated();
        $this->ensureResponsibleScope($data['responsavel_id'] ?? null, $request->user());
        $prazo = ProcessoPrazo::create([...$data, 'escritorio_id' => $processo->escritorio_id, 'processo_id' => $processo->id, 'created_by' => $request->user()->id]);
        $this->log($request, 'created', $prazo, 'Prazo de processo cadastrado.');
        $this->notifyResponsible($prazo, 'prazo_atribuido', 'Prazo atribuído');

        return response()->json(['success' => true, 'message' => 'Prazo cadastrado com sucesso.', 'data' => (new ProcessoPrazoResource($prazo->load('responsavel')))->resolve()], 201);
    }

    public function show(Request $request, Processo $processo, ProcessoPrazo $prazo): JsonResponse
    {
        $this->authorize('view', $prazo);
        $this->ensureNestedScope($processo, $prazo, $request->user());

        return response()->json(['success' => true, 'data' => (new ProcessoPrazoResource($prazo->load('responsavel')))->resolve()]);
    }

    public function update(UpdateProcessoPrazoRequest $request, Processo $processo, ProcessoPrazo $prazo): JsonResponse
    {
        $this->ensureNestedScope($processo, $prazo, $request->user());
        $data = $request->validated();
        $this->ensureResponsibleScope($data['responsavel_id'] ?? null, $request->user());
        $old = $prazo->only(array_keys($data));
        $prazo->update($data);
        $changed = collect($prazo->getChanges())->except(['updated_at'])->all();
        $this->log($request, 'updated', $prazo, 'Prazo de processo atualizado.', ['changed_fields' => array_keys($changed), 'old' => collect($old)->only(array_keys($changed))->all(), 'new' => $changed]);
        if (array_key_exists('responsavel_id', $changed)) {
            $this->notifyResponsible($prazo, 'prazo_atribuido', 'Prazo atribuído');
        }

        return response()->json(['success' => true, 'message' => 'Prazo atualizado com sucesso.', 'data' => (new ProcessoPrazoResource($prazo->fresh()->load('responsavel')))->resolve()]);
    }

    public function destroy(Request $request, Processo $processo, ProcessoPrazo $prazo): JsonResponse
    {
        $this->authorize('delete', $prazo);
        $this->ensureNestedScope($processo, $prazo, $request->user());
        $this->log($request, 'deleted', $prazo, 'Prazo de processo excluído logicamente.');
        $prazo->delete();

        return response()->json(['success' => true, 'message' => 'Prazo excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, Processo $processo, int $prazo): JsonResponse
    {
        $model = ProcessoPrazo::withTrashed()->findOrFail($prazo);
        $this->authorize('restore', $model);
        $this->ensureNestedScope($processo, $model, $request->user());
        $model->restore();
        $this->log($request, 'restored', $model, 'Prazo de processo restaurado.');

        return response()->json(['success' => true, 'message' => 'Prazo restaurado com sucesso.', 'data' => (new ProcessoPrazoResource($model->load('responsavel')))->resolve()]);
    }

    private function ensureProcessScope(Processo $processo, User $user): void
    {
        abort_unless($processo->escritorio_id === $user->escritorio_id, 404);
    }

    private function ensureNestedScope(Processo $processo, ProcessoPrazo $prazo, User $user): void
    {
        $this->ensureProcessScope($processo, $user);
        abort_unless($prazo->processo_id === $processo->id, 404);
    }

    private function ensureResponsibleScope(?int $responsavelId, User $user): void
    {
        if ($responsavelId && ! User::whereKey($responsavelId)->where('escritorio_id', $user->escritorio_id)->exists()) {
            throw ValidationException::withMessages(['responsavel_id' => 'O responsável deve pertencer ao mesmo escritório.']);
        }
    }

    private function notifyResponsible(ProcessoPrazo $prazo, string $tipo, string $titulo): void
    {
        $prazo->responsavel?->notify(new JuridicoNotification($tipo, $titulo, $prazo->titulo, ['prazo_id' => $prazo->id, 'processo_id' => $prazo->processo_id]));
    }

    private function log(Request $request, string $action, ProcessoPrazo $prazo, string $description, array $details = []): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'processo-prazos', 'description' => $description, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['processo_id' => $prazo->processo_id, 'prazo_id' => $prazo->id, ...$details]]);
    }
}
