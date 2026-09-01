<?php

namespace App\Http\Requests\Processo;

use App\Models\Processo;
use Illuminate\Foundation\Http\FormRequest;

class StoreProcessoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Processo::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['numero_processo' => preg_replace('/\D/', '', (string) $this->input('numero_processo'))]);
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['required', 'integer', 'exists:clientes,id'],
            'status_id' => ['required', 'integer', 'exists:status_processos,id'],
            'numero_processo' => ['required', 'digits:20', 'unique:processos,numero_processo'],
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'tribunal' => ['nullable', 'string', 'max:255'],
            'comarca' => ['nullable', 'string', 'max:255'],
            'vara' => ['nullable', 'string', 'max:255'],
            'foro' => ['nullable', 'string', 'max:255'],
            'tipo_acao' => ['nullable', 'string', 'max:255'],
            'area_juridica' => ['nullable', 'string', 'max:255'],
            'assunto' => ['nullable', 'string', 'max:255'],
            'data_distribuicao' => ['nullable', 'date'],
            'data_abertura' => ['nullable', 'date'],
            'data_encerramento' => ['nullable', 'date', 'after_or_equal:data_abertura'],
            'valor_causa' => ['nullable', 'numeric', 'min:0'],
            'valor_honorarios' => ['nullable', 'numeric', 'min:0'],
            'observacoes' => ['nullable', 'string'],
            'advogados' => ['nullable', 'array'],
            'advogados.*.id' => ['required', 'integer', 'distinct', 'exists:advogados,id'],
            'advogados.*.tipo' => ['required', 'in:principal,corresponsavel,apoio'],
            'responsaveis' => ['nullable', 'array'],
            'responsaveis.*.id' => ['required', 'integer', 'distinct', 'exists:users,id'],
            'responsaveis.*.tipo' => ['required', 'in:principal,operacional,apoio'],
        ];
    }
}
