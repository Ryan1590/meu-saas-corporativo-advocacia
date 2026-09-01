<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documento\StoreDocumentoRequest;
use App\Http\Resources\DocumentoResource;
use App\Models\ActivityLog;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Documento;
use App\Models\Processo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DocumentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Documento::class);
        $items = Documento::where('escritorio_id', $request->user()->escritorio_id)->latest()->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => DocumentoResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    public function store(StoreDocumentoRequest $request): JsonResponse
    {
        $this->relations($request);
        $file = $request->file('arquivo');
        $path = $file->store('documentos/'.$request->user()->escritorio_id, 'private');
        $item = Documento::create([...$request->safe()->except('arquivo'), 'escritorio_id' => $request->user()->escritorio_id, 'nome' => $request->input('nome', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)), 'nome_original' => $file->getClientOriginalName(), 'tipo' => $file->getClientOriginalExtension(), 'arquivo' => $path, 'mime_type' => $file->getMimeType(), 'tamanho' => $file->getSize(), 'uploaded_by' => $request->user()->id]);
        $this->log($request, 'uploaded', $item);

        return response()->json(['success' => true, 'message' => 'Documento enviado com sucesso.', 'data' => (new DocumentoResource($item))->resolve()], 201);
    }

    public function show(Documento $documento): JsonResponse
    {
        $this->authorize('view', $documento);

        return response()->json(['success' => true, 'data' => (new DocumentoResource($documento))->resolve()]);
    }

    public function download(Request $request, Documento $documento)
    {
        $this->authorize('download', $documento);

        $disk = Storage::disk('private');

        abort_unless($disk->exists($documento->arquivo), 404);

        $this->log($request, 'downloaded', $documento);

        return response()->streamDownload(
            function () use ($disk, $documento) {
                echo $disk->get($documento->arquivo);
            },
            $documento->nome_original,
            [
                'Content-Type' => $documento->mime_type,
            ]
        );
    }

    public function preview(Request $request, Documento $documento)
    {
        $this->authorize('view', $documento);

        $disk = Storage::disk('private');

        abort_unless(
            $disk->exists($documento->arquivo),
            404
        );

        return response()->stream(
            function () use ($disk, $documento) {
                echo $disk->get($documento->arquivo);
            },
            200,
            [
                'Content-Type' => $documento->mime_type,
                'Content-Disposition' => 'inline; filename="' . $documento->nome_original . '"',
                'Cache-Control' => 'private, max-age=3600',
            ]
        );
    }

    public function destroy(Request $request, Documento $documento): JsonResponse
    {
        $this->authorize('delete', $documento);
        $this->log($request, 'deleted', $documento);
        $documento->delete();

        return response()->json(['success' => true, 'message' => 'Documento excluído com sucesso.', 'data' => null]);
    }

    public function restore(Request $request, int $documento): JsonResponse
    {
        $item = Documento::withTrashed()->findOrFail($documento);
        $this->authorize('restore', $item);
        $item->restore();
        $this->log($request, 'restored', $item);

        return response()->json(['success' => true, 'message' => 'Documento restaurado com sucesso.', 'data' => (new DocumentoResource($item))->resolve()]);
    }

    private function relations(Request $request): void
    {
        $office = $request->user()->escritorio_id;
        foreach (['cliente_id' => Cliente::class, 'processo_id' => Processo::class, 'contrato_id' => Contrato::class] as $field => $model) {
            if ($request->filled($field) && ! $model::whereKey($request->integer($field))->where('escritorio_id', $office)->exists()) {
                throw ValidationException::withMessages([$field => 'A entidade relacionada deve pertencer ao mesmo escritório.']);
            }
        }
    }

    private function log(Request $request, string $action, Documento $item): void
    {
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => $action, 'module' => 'documentos', 'description' => "Documento {$action}.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['documento_id' => $item->id]]);
    }
}
