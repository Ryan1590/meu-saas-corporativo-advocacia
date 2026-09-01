<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EscritorioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->nome,
            'razaoSocial' => $this->razao_social,
            'cnpj' => $this->cnpj,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'cep' => $this->cep,
            'logradouro' => $this->logradouro,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'bairro' => $this->bairro,
            'cidade' => $this->cidade,
            'estado' => $this->estado,
            'status' => $this->status,
            'users' => UserResource::collection($this->whenLoaded('users')),
            'clientes' => ClienteResource::collection($this->whenLoaded('clientes')),
            'advogados' => AdvogadoResource::collection($this->whenLoaded('advogados')),
            'statusProcessos' => StatusProcessoResource::collection($this->whenLoaded('statusProcessos')),
            'processos' => ProcessoResource::collection($this->whenLoaded('processos')),
            'contratos' => ContratoResource::collection($this->whenLoaded('contratos')),
            'tarefas' => TarefaResource::collection($this->whenLoaded('tarefas')),
            'documentos' => DocumentoResource::collection($this->whenLoaded('documentos')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
