<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParcelaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'numero' => $this->numero,
            'descricao' => $this->descricao,
            'valor' => $this->valor,
            'dataVencimento' => $this->data_vencimento?->format('Y-m-d'),
            'dataPagamento' => $this->data_pagamento?->format('Y-m-d'),
            'status' => $this->status,
            'formaPagamento' => $this->forma_pagamento,
            'observacoes' => $this->observacoes,
            'contrato' => new ContratoResource($this->whenLoaded('contrato')),
            'pagamentos' => PagamentoResource::collection($this->whenLoaded('pagamentos')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
