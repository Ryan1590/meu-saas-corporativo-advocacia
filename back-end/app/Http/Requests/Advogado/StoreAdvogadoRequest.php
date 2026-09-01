<?php

namespace App\Http\Requests\Advogado;

use App\Models\Advogado;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdvogadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Advogado::class);
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'min:3', 'max:255'],
            'cpf' => ['nullable', 'digits:11'],
            'email' => ['nullable', 'email:rfc', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'celular' => ['nullable', 'string', 'max:20'],
            'oab_numero' => ['required', 'string', 'max:30'],
            'oab_uf' => ['required', 'string', 'size:2'],
            'especialidade' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'observacoes' => ['nullable', 'string'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
