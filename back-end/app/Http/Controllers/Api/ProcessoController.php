<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Processo\StoreProcessoRequest;
use App\Http\Requests\Processo\SyncProcessoVinculosRequest;
use App\Http\Requests\Processo\UpdateProcessoRequest;
use App\Http\Resources\ProcessoResource;
use App\Models\ActivityLog;
use App\Models\Advogado;
use App\Models\Cliente;
use App\Models\Processo;
use App\Models\StatusProcesso;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProcessoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Processo::class);
        $processos = Processo::where('escritorio_id', $request->user()->escritorio_id)->with(['cliente', 'status'])->when($request->query('search'), fn ($query, $search) => $query->where(fn ($filter) => $filter->where('numero_processo', 'like', "%{$search}%")->orWhere('titulo', 'like', "%{$search}%")))->orderByDesc('created_at')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => ProcessoResource::collection($processos->items())->resolve(), 'meta' => ['currentPage' => $processos->currentPage(), 'lastPage' => $processos->lastPage(), 'perPage' => $processos->perPage(), 'total' => $processos->total()]]);
    }

    public function store(StoreProcessoRequest $request): JsonResponse
    {
        $actor = $request->user();
        $data = $request->validated();
        $this->validateRelations($data, $actor);
        $processo = DB::transaction(function () use ($data, $actor) {
            $processo = Processo::create([...collect($data)->except(['advogados', 'responsaveis'])->all(), 'escritorio_id' => $actor->escritorio_id, 'created_by' => $actor->id, 'updated_by' => $actor->id]);
            $this->syncRelations($processo, $data);
            $this->log($actor, 'created', $processo, 'Processo cadastrado.');

            return $processo;
        });

        return response()->json(['success' => true, 'message' => 'Processo cadastrado com sucesso.', 'data' => (new ProcessoResource($processo->load(['cliente', 'status', 'advogados', 'responsaveis'])))->resolve()], 201);
    }

    public function show(Processo $processo): JsonResponse
    {
        $this->authorize('view', $processo);

        return response()->json(['success' => true, 'data' => (new ProcessoResource($processo->load(['cliente', 'status', 'advogados', 'responsaveis'])))->resolve()]);
    }

    public function advogados(Request $request, Processo $processo): JsonResponse
    {
        $this->authorize('view', $processo);

        return response()->json(['success' => true, 'data' => $processo->advogados()->get()]);
    }

    public function syncAdvogados(SyncProcessoVinculosRequest $request, Processo $processo): JsonResponse
    {
        $data = $request->validated()['vinculos'];
        $this->validateVinculos($data, Advogado::class, $request->user(), 'advogados');
        $processo->advogados()->sync($this->pivotData($data));
        $this->log($request->user(), 'updated', $processo, 'Advogados vinculados ao processo atualizados.', ['changed_fields' => ['advogados']]);

        return response()->json(['success' => true, 'message' => 'Advogados vinculados com sucesso.', 'data' => $processo->advogados()->get()]);
    }

    public function responsaveis(Request $request, Processo $processo): JsonResponse
    {
        $this->authorize('view', $processo);

        return response()->json(['success' => true, 'data' => $processo->responsaveis()->get()]);
    }

    public function syncResponsaveis(SyncProcessoVinculosRequest $request, Processo $processo): JsonResponse
    {
        $data = $request->validated()['vinculos'];
        $this->validateVinculos($data, User::class, $request->user(), 'responsaveis');
        $processo->responsaveis()->sync($this->pivotData($data));
        $this->log($request->user(), 'updated', $processo, 'Responsáveis vinculados ao processo atualizados.', ['changed_fields' => ['responsaveis']]);

        return response()->json(['success' => true, 'message' => 'Responsáveis vinculados com sucesso.', 'data' => $processo->responsaveis()->get()]);
    }

    public function update(UpdateProcessoRequest $request, Processo $processo): JsonResponse
    {
        $actor = $request->user();
        $data = $request->validated();
        $this->validateRelations($data, $actor);

        DB::transaction(function () use ($processo, $data, $actor) {
            $changes = collect($data)->except(['advogados', 'responsaveis'])->all();
            $old = collect($processo->only(array_keys($changes)));
            $processo->update([...$changes, 'updated_by' => $actor->id]);
            $this->syncRelations($processo, $data);
            $changed = collect($processo->getChanges())->except(['updated_at', 'updated_by'])->all();
            $this->log($actor, 'updated', $processo, 'Processo atualizado.', ['changed_fields' => array_keys($changed), 'old' => $old->only(array_keys($changed))->all(), 'new' => $changed]);
        });

        return response()->json(['success' => true, 'message' => 'Processo atualizado com sucesso.', 'data' => (new ProcessoResource($processo->fresh()->load(['cliente', 'status', 'advogados', 'responsaveis'])))->resolve()]);
    }

    public function destroy(Request $request, Processo $processo): JsonResponse
    {
        $this->authorize('delete', $processo);
        $this->log($request->user(), 'deleted', $processo, 'Processo excluído logicamente.');
        $processo->delete();

        return response()->json(['success' => true, 'message' => 'Processo excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $processo): JsonResponse
    {
        $model = Processo::withTrashed()->findOrFail($processo);
        $this->authorize('restore', $model);
        $model->restore();
        $model->update(['updated_by' => $request->user()->id]);
        $this->log($request->user(), 'restored', $model, 'Processo restaurado.');

        return response()->json(['success' => true, 'message' => 'Processo restaurado com sucesso.', 'data' => (new ProcessoResource($model->load(['cliente', 'status', 'advogados', 'responsaveis'])))->resolve()]);
    }

    private function validateRelations(array $data, User $actor): void
    {
        $clienteBelongsToOffice = Cliente::whereKey($data['cliente_id'])->where('escritorio_id', $actor->escritorio_id)->exists();
        $statusBelongsToOffice = StatusProcesso::whereKey($data['status_id'])->where('escritorio_id', $actor->escritorio_id)->where('ativo', true)->exists();
        if (! $clienteBelongsToOffice || ! $statusBelongsToOffice) {
            throw ValidationException::withMessages(['cliente_id' => 'Cliente ou status inválido para este escritório.']);
        }
        foreach ($data['advogados'] ?? [] as $item) {
            if (! Advogado::whereKey($item['id'])->where('escritorio_id', $actor->escritorio_id)->exists()) {
                throw ValidationException::withMessages(['advogados' => 'Advogado inválido para este escritório.']);
            }
        }
        foreach ($data['responsaveis'] ?? [] as $item) {
            if (! User::whereKey($item['id'])->where('escritorio_id', $actor->escritorio_id)->exists()) {
                throw ValidationException::withMessages(['responsaveis' => 'Responsável inválido para este escritório.']);
            }
        }
        if (collect($data['advogados'] ?? [])->where('tipo', 'principal')->count() > 1 || collect($data['responsaveis'] ?? [])->where('tipo', 'principal')->count() > 1) {
            throw ValidationException::withMessages(['advogados' => 'Informe somente um principal para advogados e responsáveis.']);
        }
    }

    private function syncRelations(Processo $processo, array $data): void
    {
        if (array_key_exists('advogados', $data)) {
            $processo->advogados()->sync(collect($data['advogados'] ?? [])->mapWithKeys(fn (array $item) => [$item['id'] => ['tipo' => $item['tipo'], 'principal' => $item['tipo'] === 'principal']])->all());
        }
        if (array_key_exists('responsaveis', $data)) {
            $processo->responsaveis()->sync(collect($data['responsaveis'] ?? [])->mapWithKeys(fn (array $item) => [$item['id'] => ['tipo' => $item['tipo'], 'principal' => $item['tipo'] === 'principal']])->all());
        }
    }

    private function validateVinculos(array $vinculos, string $model, User $actor, string $field): void
    {
        if (collect($vinculos)->pluck('id')->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages(['vinculos' => 'Não são permitidos vínculos duplicados.']);
        }
        if (collect($vinculos)->where('tipo', 'principal')->count() > 1) {
            throw ValidationException::withMessages(['vinculos' => 'Informe somente um vínculo principal.']);
        }
        if ($model::whereIn('id', collect($vinculos)->pluck('id'))->where('escritorio_id', $actor->escritorio_id)->count() !== count($vinculos)) {
            throw ValidationException::withMessages([$field => 'Todos os vínculos devem pertencer ao mesmo escritório.']);
        }
    }

    private function pivotData(array $vinculos): array
    {
        return collect($vinculos)->mapWithKeys(fn (array $item) => [$item['id'] => ['tipo' => $item['tipo'], 'principal' => $item['tipo'] === 'principal']])->all();
    }

    private function log(User $actor, string $action, Processo $processo, string $description, array $details = []): void
    {
        ActivityLog::create(['user_id' => $actor->id, 'action' => $action, 'module' => 'processos', 'description' => $description, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent(), 'details' => ['processo_id' => $processo->id, ...$details]]);
    }
}
