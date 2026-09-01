<?php

namespace App\Http\Requests\Documento;

use App\Models\Documento;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Documento::class);
    }

    public function rules(): array
    {
        return ['arquivo' => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:20480'], 'nome' => ['nullable', 'string', 'max:255'], 'categoria' => ['required', 'string', 'max:50'], 'descricao' => ['nullable', 'string'], 'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'], 'processo_id' => ['nullable', 'integer', 'exists:processos,id'], 'contrato_id' => ['nullable', 'integer', 'exists:contratos,id']];
    }
}
