<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagamentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'valor' => $this->valor,
            'dataPagamento' => $this->data_pagamento?->format('Y-m-d'),
            'formaPagamento' => $this->forma_pagamento,
            'observacoes' => $this->observacoes,
            'parcela' => new ParcelaResource($this->whenLoaded('parcela')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
