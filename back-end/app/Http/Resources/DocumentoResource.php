<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'nomeOriginal' => $this->nome_original,
            'tipo' => $this->tipo,
            'categoria' => $this->categoria,
            'mimeType' => $this->mime_type,
            'tamanho' => $this->tamanho,
            'descricao' => $this->descricao,
            'downloadUrl' => '/api/v1/documentos/'.$this->id.'/download',
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'processo' => new ProcessoResource($this->whenLoaded('processo')),
            'contrato' => new ContratoResource($this->whenLoaded('contrato')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
