<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgendaEventoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'tipo' => $this->tipo,
            'dataInicio' => $this->data_inicio?->toISOString(),
            'dataFim' => $this->data_fim?->toISOString(),
            'local' => $this->local,
            'status' => $this->status,
            'processo' => new ProcessoResource($this->whenLoaded('processo')),
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'responsavel' => new UserResource($this->whenLoaded('responsavel')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
