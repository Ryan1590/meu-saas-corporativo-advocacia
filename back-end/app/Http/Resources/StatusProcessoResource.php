<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatusProcessoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'cor' => $this->cor,
            'ordem' => $this->ordem,
            'ativo' => $this->ativo,
            'processos' => ProcessoResource::collection($this->whenLoaded('processos')),
            'processosCount' => $this->whenCounted('processos'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
