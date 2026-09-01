<?php

namespace App\Http\Requests\Parcela;

use App\Models\Parcela;
use Illuminate\Foundation\Http\FormRequest;

class StoreParcelaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Parcela::class);
    }

    public function rules(): array
    {
        return ['contrato_id' => ['required', 'integer', 'exists:contratos,id'], 'numero' => ['required', 'integer', 'min:1'], 'descricao' => ['nullable', 'string', 'max:255'], 'valor' => ['required', 'numeric', 'gt:0'], 'data_vencimento' => ['required', 'date'], 'forma_pagamento' => ['nullable', 'string', 'max:30'], 'observacoes' => ['nullable', 'string']];
    }
}
