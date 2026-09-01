<?php

namespace App\Http\Requests\Escritorio;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEscritorioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('escritorio'));
    }

    public function rules(): array
    {
        return ['nome' => ['required', 'string', 'max:255'], 'razao_social' => ['nullable', 'string', 'max:255'], 'cnpj' => ['nullable', 'string', 'max:20'], 'email' => ['nullable', 'email', 'max:255'], 'telefone' => ['nullable', 'string', 'max:30'], 'cep' => ['nullable', 'string', 'max:15'], 'logradouro' => ['nullable', 'string', 'max:255'], 'numero' => ['nullable', 'string', 'max:30'], 'complemento' => ['nullable', 'string', 'max:255'], 'bairro' => ['nullable', 'string', 'max:255'], 'cidade' => ['nullable', 'string', 'max:255'], 'estado' => ['nullable', 'string', 'size:2'], 'status' => ['nullable', 'in:active,inactive']];
    }
}
