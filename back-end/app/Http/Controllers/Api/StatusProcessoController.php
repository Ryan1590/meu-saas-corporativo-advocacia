<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StatusProcesso\StoreStatusProcessoRequest;
use App\Http\Requests\StatusProcesso\UpdateStatusProcessoRequest;
use App\Http\Resources\StatusProcessoResource;
use App\Models\ActivityLog;
use App\Models\StatusProcesso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusProcessoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StatusProcesso::class);

        return response()->json(['success' => true, 'data' => StatusProcessoResource::collection(StatusProcesso::where('escritorio_id', $request->user()->escritorio_id)->orderBy('ordem')->get())->resolve()]);
    }

    public function store(StoreStatusProcessoRequest $request): JsonResponse
    {
        $status = StatusProcesso::create([...$request->validated(), 'escritorio_id' => $request->user()->escritorio_id]);
        $this->log($request, 'created', $status);

        return response()->json(['success' => true, 'message' => 'Status cadastrado com sucesso.', 'data' => (new StatusProcessoResource($status))->resolve()], 201);
    }

    public function show(StatusProcesso $status_processo): JsonResponse
    {
        $this->authorize('view', $status_processo);

        return response()->json(['success' => true, 'data' => (new StatusProcessoResource($status_processo))->resolve()]);
    }

    public function update(UpdateStatusProcessoRequest $request, StatusProcesso $status_processo): JsonResponse
    {
        $status_processo->update($request->validated());
        $this->log($request, 'updated', $status_processo);

        return response()->json(['success' => true, 'message' => 'Status atualizado com sucesso.', 'data' => (new StatusProcessoResource($status_processo))->resolve()]);
    }

    public function destroy(Request $request, StatusProcesso $status_processo): JsonResponse
    {
        $this->authorize('delete', $status_processo);
        if ($status_processo->processos()->exists()) {
            return response()->json(['success' => false, 'message' => 'Não é possível excluir um status vinculado a processos.'], 422);
        } $this->log($request, 'deleted', $status_processo);
        $status_processo->delete();

        return response()->json(['success' => true, 'message' => 'Status excluído com sucesso.', 'data' => null]);
    }

    private function log(Request $request, string $action, StatusProcesso $status): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'status-processos', 'description' => "Status de processo {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['status_processo_id' => $status->id]]);
    }
}
