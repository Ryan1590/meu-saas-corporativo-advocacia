<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessoMovimentacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'dataMovimentacao' => $this->data_movimentacao?->format('Y-m-d'),
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'origem' => $this->origem,
            'processo' => new ProcessoResource($this->whenLoaded('processo')),
            'responsavel' => new UserResource($this->whenLoaded('responsavel')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
