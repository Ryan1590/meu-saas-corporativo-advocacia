<?php

namespace App\Http\Requests\StatusProcesso;

use App\Models\StatusProcesso;
use Illuminate\Foundation\Http\FormRequest;

class StoreStatusProcessoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', StatusProcesso::class);
    }

    public function rules(): array
    {
        return ['nome' => ['required', 'string', 'max:255'], 'descricao' => ['nullable', 'string'], 'cor' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'], 'ordem' => ['required', 'integer', 'min:0'], 'ativo' => ['boolean']];
    }
}
