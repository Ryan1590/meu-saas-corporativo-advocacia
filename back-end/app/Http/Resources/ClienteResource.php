<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'tipoPessoa' => $this->tipo_pessoa,
            'nome' => $this->nome,
            'razaoSocial' => $this->razao_social,
            'nomeFantasia' => $this->nome_fantasia,
            'cpf' => $this->cpf,
            'cnpj' => $this->cnpj,
            'rg' => $this->rg,
            'dataNascimento' => $this->data_nascimento?->format('Y-m-d'),
            'email' => $this->email,
            'telefone' => $this->telefone,
            'celular' => $this->celular,
            'whatsapp' => $this->whatsapp,
            'cep' => $this->cep,
            'logradouro' => $this->logradouro,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'bairro' => $this->bairro,
            'cidade' => $this->cidade,
            'estado' => $this->estado,
            'observacoes' => $this->observacoes,
            'status' => $this->status,
            'processosCount' => $this->whenCounted('processos'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
