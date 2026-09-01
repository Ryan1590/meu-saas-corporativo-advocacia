<?php

namespace App\Http\Requests\Contrato;

use App\Models\Contrato;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Contrato::class);
    }

    public function rules(): array
    {
        return ['cliente_id' => ['required', 'integer', 'exists:clientes,id'], 'processo_id' => ['nullable', 'integer', 'exists:processos,id'], 'numero' => ['required', 'string', 'max:255', Rule::unique('contratos')->where('escritorio_id', $this->user()->escritorio_id)], 'descricao' => ['nullable', 'string'], 'data_inicio' => ['required', 'date'], 'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'], 'valor_total' => ['required', 'numeric', 'gt:0'], 'forma_pagamento' => ['required', 'string', 'max:30'], 'status' => ['nullable', 'string', 'max:20'], 'observacoes' => ['nullable', 'string']];
    }
}
