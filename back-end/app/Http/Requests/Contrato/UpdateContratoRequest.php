<?php

namespace App\Http\Requests\Contrato;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('contrato'));
    }

    public function rules(): array
    {
        $contrato = $this->route('contrato');

        return ['cliente_id' => ['required', 'integer', 'exists:clientes,id'], 'processo_id' => ['nullable', 'integer', 'exists:processos,id'], 'numero' => ['required', 'string', 'max:255', Rule::unique('contratos')->where('escritorio_id', $this->user()->escritorio_id)->ignore($contrato)], 'descricao' => ['nullable', 'string'], 'data_inicio' => ['required', 'date'], 'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'], 'valor_total' => ['required', 'numeric', 'gt:0'], 'forma_pagamento' => ['required', 'string', 'max:30'], 'status' => ['nullable', 'string', 'max:20'], 'observacoes' => ['nullable', 'string']];
    }
}
