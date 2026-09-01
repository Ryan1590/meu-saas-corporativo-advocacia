<?php

namespace App\Http\Requests\Processo;

use Illuminate\Foundation\Http\FormRequest;

class SyncProcessoVinculosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('processo'));
    }

    public function rules(): array
    {
        return [
            'vinculos' => ['present', 'array'],
            'vinculos.*.id' => ['required', 'integer'],
            'vinculos.*.tipo' => ['required', 'in:principal,secundario'],
        ];
    }
}
