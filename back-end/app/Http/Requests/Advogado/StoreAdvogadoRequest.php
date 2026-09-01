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

    protected function prepareForValidation(): void
    {
        $this->merge([
            'cpf' => $this->filled('cpf') ? preg_replace('/\D/', '', (string) $this->input('cpf')) : null,
            'oab_numero' => $this->filled('oab_numero') ? preg_replace('/\D/', '', (string) $this->input('oab_numero')) : null,
        ]);
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

    public function messages(): array
    {
        return [
            'cpf.digits' => 'O CPF deve conter 11 dígitos.',
            'oab_numero.required' => 'O número da OAB é obrigatório.',
            'oab_uf.required' => 'Selecione a UF da OAB.',
            'oab_uf.size' => 'Selecione uma UF válida para a OAB.',
        ];
    }
}
