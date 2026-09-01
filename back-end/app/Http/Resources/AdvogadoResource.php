<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdvogadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'cpf' => $this->cpf,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'celular' => $this->celular,
            'oabNumero' => $this->oab_numero,
            'oabUf' => $this->oab_uf,
            'especialidade' => $this->especialidade,
            'status' => $this->status,
            'observacoes' => $this->observacoes,
            'user' => new UserResource($this->whenLoaded('user')),
            'processos' => ProcessoResource::collection($this->whenLoaded('processos')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
