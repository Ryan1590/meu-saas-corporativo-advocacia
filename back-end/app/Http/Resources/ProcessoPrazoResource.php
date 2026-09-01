<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessoPrazoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'dataInicio' => $this->data_inicio?->format('Y-m-d'),
            'dataVencimento' => $this->data_vencimento?->format('Y-m-d'),
            'status' => $this->status,
            'prioridade' => $this->prioridade,
            'concluidoEm' => $this->concluido_em?->toISOString(),
            'observacoes' => $this->observacoes,
            'processo' => new ProcessoResource($this->whenLoaded('processo')),
            'responsavel' => new UserResource($this->whenLoaded('responsavel')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
