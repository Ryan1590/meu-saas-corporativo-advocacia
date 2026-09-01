<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Escritorio\UpdateEscritorioRequest;
use App\Http\Resources\EscritorioResource;
use App\Models\ActivityLog;
use App\Models\Escritorio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EscritorioController extends Controller
{
    public function show(Request $request, Escritorio $escritorio): JsonResponse
    {
        $this->authorize('view', $escritorio);

        return response()->json(['success' => true, 'data' => (new EscritorioResource($escritorio))->resolve()]);
    }

    public function update(UpdateEscritorioRequest $request, Escritorio $escritorio): JsonResponse
    {
        $escritorio->update($request->validated());
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => 'updated', 'module' => 'escritorios', 'description' => 'Escritório atualizado.', 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['escritorio_id' => $escritorio->id]]);

        return response()->json(['success' => true, 'message' => 'Escritório atualizado com sucesso.', 'data' => (new EscritorioResource($escritorio->fresh()))->resolve()]);
    }
}
