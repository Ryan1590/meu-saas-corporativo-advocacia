<?php

namespace App\Http\Requests\ProcessoPrazo;

use App\Models\ProcessoPrazo;
use Illuminate\Foundation\Http\FormRequest;

class StoreProcessoPrazoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ProcessoPrazo::class);
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data_inicio' => ['nullable', 'date'],
            'data_vencimento' => ['required', 'date', 'after_or_equal:data_inicio'],
            'responsavel_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'string', 'max:20'],
            'prioridade' => ['nullable', 'string', 'max:20'],
            'concluido_em' => ['nullable', 'date'],
            'observacoes' => ['nullable', 'string'],
        ];
    }
}
