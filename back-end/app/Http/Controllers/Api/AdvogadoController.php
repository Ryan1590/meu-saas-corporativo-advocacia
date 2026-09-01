<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Advogado\StoreAdvogadoRequest;
use App\Http\Requests\Advogado\UpdateAdvogadoRequest;
use App\Http\Resources\AdvogadoResource;
use App\Models\ActivityLog;
use App\Models\Advogado;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdvogadoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Advogado::class);
        $advogados = Advogado::query()->where('escritorio_id', $request->user()->escritorio_id)->when($request->query('search'), fn ($query, $search) => $query->where(fn ($filter) => $filter->where('nome', 'like', "%{$search}%")->orWhere('oab_numero', 'like', "%{$search}%")))->when($request->query('status'), fn ($query, $status) => $status !== 'all' ? $query->where('status', $status) : $query)->orderBy('nome')->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => AdvogadoResource::collection($advogados->items())->resolve(), 'meta' => ['currentPage' => $advogados->currentPage(), 'lastPage' => $advogados->lastPage(), 'perPage' => $advogados->perPage(), 'total' => $advogados->total()]]);
    }

    public function store(StoreAdvogadoRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (isset($data['user_id']) && ! User::whereKey($data['user_id'])->where('escritorio_id', $request->user()->escritorio_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'O usuário deve pertencer ao mesmo escritório.'], 422);
        }
        if (Advogado::where('escritorio_id', $request->user()->escritorio_id)->where('oab_numero', $data['oab_numero'])->where('oab_uf', $data['oab_uf'])->exists()) {
            return response()->json(['success' => false, 'message' => 'Esta OAB já está cadastrada no escritório.'], 422);
        }
        $advogado = Advogado::create([...$data, 'escritorio_id' => $request->user()->escritorio_id]);
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => 'created', 'module' => 'advogados', 'description' => 'Advogado cadastrado.', 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['advogado_id' => $advogado->id]]);

        return response()->json(['success' => true, 'message' => 'Advogado cadastrado com sucesso.', 'data' => (new AdvogadoResource($advogado))->resolve()], 201);
    }

    public function show(Advogado $advogado): JsonResponse
    {
        $this->authorize('view', $advogado);

        return response()->json(['success' => true, 'data' => (new AdvogadoResource($advogado))->resolve()]);
    }

    public function update(UpdateAdvogadoRequest $request, Advogado $advogado): JsonResponse
    {
        $data = $request->validated();
        $userBelongsToOffice = ! isset($data['user_id']) || User::whereKey($data['user_id'])->where('escritorio_id', $request->user()->escritorio_id)->exists();
        if (! $userBelongsToOffice) {
            return response()->json(['success' => false, 'message' => 'O usuário deve pertencer ao mesmo escritório.'], 422);
        }
        $duplicateOab = Advogado::where('escritorio_id', $request->user()->escritorio_id)->where('oab_numero', $data['oab_numero'])->where('oab_uf', $data['oab_uf'])->whereKeyNot($advogado->id)->exists();
        if ($duplicateOab) {
            return response()->json(['success' => false, 'message' => 'Esta OAB já está cadastrada no escritório.'], 422);
        }
        $advogado->update($data);
        $this->log($request, 'updated', $advogado, 'Dados do advogado atualizados.');

        return response()->json(['success' => true, 'message' => 'Advogado atualizado com sucesso.', 'data' => (new AdvogadoResource($advogado))->resolve()]);
    }

    public function destroy(Request $request, Advogado $advogado): JsonResponse
    {
        $this->authorize('delete', $advogado);
        $this->log($request, 'deleted', $advogado, 'Advogado excluído logicamente.');
        $advogado->delete();

        return response()->json(['success' => true, 'message' => 'Advogado excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $advogado): JsonResponse
    {
        $item = Advogado::withTrashed()->findOrFail($advogado);
        $this->authorize('restore', $item);
        $item->restore();
        $this->log($request, 'restored', $item, 'Advogado restaurado.');

        return response()->json(['success' => true, 'message' => 'Advogado restaurado com sucesso.', 'data' => (new AdvogadoResource($item))->resolve()]);
    }

    private function log(Request $request, string $action, Advogado $advogado, string $description): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'advogados', 'description' => $description, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['advogado_id' => $advogado->id]]);
    }
}
