<?php

namespace App\Http\Requests\Pagamento;

use App\Models\Pagamento;
use Illuminate\Foundation\Http\FormRequest;

class StorePagamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Pagamento::class);
    }

    public function rules(): array
    {
        return ['parcela_id' => ['required', 'integer', 'exists:parcelas,id'], 'valor' => ['required', 'numeric', 'gt:0'], 'data_pagamento' => ['required', 'date'], 'forma_pagamento' => ['required', 'string', 'max:30'], 'comprovante' => ['nullable', 'string', 'max:255'], 'observacoes' => ['nullable', 'string']];
    }
}
