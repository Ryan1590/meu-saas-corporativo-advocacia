<?php

namespace App\Http\Requests\Parcela;

use Illuminate\Foundation\Http\FormRequest;

class UpdateParcelaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('parcela'));
    }

    public function rules(): array
    {
        return ['numero' => ['required', 'integer', 'min:1'], 'descricao' => ['nullable', 'string', 'max:255'], 'valor' => ['required', 'numeric', 'gt:0'], 'data_vencimento' => ['required', 'date'], 'forma_pagamento' => ['nullable', 'string', 'max:30'], 'observacoes' => ['nullable', 'string']];
    }
}
