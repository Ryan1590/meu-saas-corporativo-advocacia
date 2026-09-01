<?php

namespace App\Http\Requests\StatusProcesso;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusProcessoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('status_processo'));
    }

    public function rules(): array
    {
        return ['nome' => ['required', 'string', 'max:255'], 'descricao' => ['nullable', 'string'], 'cor' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'], 'ordem' => ['required', 'integer', 'min:0'], 'ativo' => ['required', 'boolean']];
    }
}
