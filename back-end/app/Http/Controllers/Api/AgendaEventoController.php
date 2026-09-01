<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AgendaEvento\AgendaEventoRequest;
use App\Http\Resources\AgendaEventoResource;
use App\Models\ActivityLog;
use App\Models\AgendaEvento;
use App\Models\Cliente;
use App\Models\Processo;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AgendaEventoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AgendaEvento::class);
        $items = AgendaEvento::where('escritorio_id', $request->user()->escritorio_id)->with('responsavel')->orderBy('data_inicio')->paginate($this->perPage($request));

        return $this->paginated($items);
    }

    public function store(AgendaEventoRequest $request): JsonResponse
    {
        $this->relations($request);
        $item = AgendaEvento::create([...$request->validated(), 'escritorio_id' => $request->user()->escritorio_id, 'created_by' => $request->user()->id]);
        $this->log($request, 'created', $item);

        return response()->json(['success' => true, 'message' => 'Evento cadastrado com sucesso.', 'data' => (new AgendaEventoResource($item))->resolve()], 201);
    }

    public function show(AgendaEvento $agenda_evento): JsonResponse
    {
        $this->authorize('view', $agenda_evento);

        return response()->json(['success' => true, 'data' => (new AgendaEventoResource($agenda_evento->load(['processo', 'cliente', 'responsavel'])))->resolve()]);
    }

    public function update(AgendaEventoRequest $request, AgendaEvento $agenda_evento): JsonResponse
    {
        $this->relations($request);
        $agenda_evento->update($request->validated());
        $this->log($request, 'updated', $agenda_evento);

        return response()->json(['success' => true, 'message' => 'Evento atualizado com sucesso.', 'data' => (new AgendaEventoResource($agenda_evento->fresh()))->resolve()]);
    }

    public function destroy(Request $request, AgendaEvento $agenda_evento): JsonResponse
    {
        $this->authorize('delete', $agenda_evento);
        $this->log($request, 'deleted', $agenda_evento);
        $agenda_evento->delete();

        return response()->json(['success' => true, 'message' => 'Evento excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $agenda_evento): JsonResponse
    {
        $item = AgendaEvento::withTrashed()->findOrFail($agenda_evento);
        $this->authorize('restore', $item);
        $item->restore();
        $this->log($request, 'restored', $item);

        return response()->json(['success' => true, 'message' => 'Evento restaurado com sucesso.', 'data' => (new AgendaEventoResource($item))->resolve()]);
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
        return response()->json(['success' => true, 'data' => AgendaEventoResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    private function log(Request $request, string $action, AgendaEvento $item): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'agenda', 'description' => "Evento {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['agenda_evento_id' => $item->id]]);
    }
}
