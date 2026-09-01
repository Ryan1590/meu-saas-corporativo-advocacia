<?php

namespace App\Http\Requests\ProcessoMovimentacao;

use App\Models\ProcessoMovimentacao;
use Illuminate\Foundation\Http\FormRequest;

class StoreProcessoMovimentacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ProcessoMovimentacao::class);
    }

    public function rules(): array
    {
        return [
            'data_movimentacao' => ['required', 'date'],
            'tipo' => ['required', 'string', 'max:30'],
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'responsavel_id' => ['nullable', 'integer', 'exists:users,id'],
            'origem' => ['nullable', 'string', 'max:20'],
        ];
    }
}
