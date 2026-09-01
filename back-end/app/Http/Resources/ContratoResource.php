<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'numero' => $this->numero,
            'descricao' => $this->descricao,
            'dataInicio' => $this->data_inicio?->format('Y-m-d'),
            'dataFim' => $this->data_fim?->format('Y-m-d'),
            'valorTotal' => $this->valor_total,
            'formaPagamento' => $this->forma_pagamento,
            'status' => $this->status,
            'observacoes' => $this->observacoes,
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'processo' => new ProcessoResource($this->whenLoaded('processo')),
            'parcelas' => ParcelaResource::collection($this->whenLoaded('parcelas')),
            'documentos' => DocumentoResource::collection($this->whenLoaded('documentos')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
