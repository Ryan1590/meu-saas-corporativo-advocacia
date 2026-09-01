<?php

namespace App\Http\Requests\Cliente;

use App\Rules\ValidCnpj;
use App\Rules\ValidCpf;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('cliente'));
    }

    protected function prepareForValidation(): void
    {
        $cliente = $this->route('cliente');
        $this->merge([
            'tipo_pessoa' => $this->input('tipo_pessoa', $cliente->tipo_pessoa),
            'cpf' => $this->has('cpf') ? preg_replace('/\D/', '', (string) $this->input('cpf')) : $cliente->cpf,
            'cnpj' => $this->has('cnpj') ? preg_replace('/\D/', '', (string) $this->input('cnpj')) : $cliente->cnpj,
            'cep' => $this->has('cep') ? preg_replace('/\D/', '', (string) $this->input('cep')) : $cliente->cep,
        ]);
    }

    public function rules(): array
    {
        $cliente = $this->route('cliente');

        return [
            'tipo_pessoa' => ['required', Rule::in(['PF', 'PJ'])],
            'nome' => ['nullable', 'string', 'max:255', 'required_if:tipo_pessoa,PF'],
            'razao_social' => ['nullable', 'string', 'max:255', 'required_if:tipo_pessoa,PJ'],
            'nome_fantasia' => ['nullable', 'string', 'max:255', 'required_if:tipo_pessoa,PJ'],
            'cpf' => ['nullable', 'required_if:tipo_pessoa,PF', 'digits:11', new ValidCpf, Rule::unique('clientes', 'cpf')->ignore($cliente->id)],
            'cnpj' => ['nullable', 'required_if:tipo_pessoa,PJ', 'digits:14', new ValidCnpj, Rule::unique('clientes', 'cnpj')->ignore($cliente->id)],
            'rg' => ['nullable', 'string', 'max:30'],
            'data_nascimento' => ['nullable', 'date', 'before:today'],
            'email' => ['nullable', 'email:rfc', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'celular' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'cep' => ['nullable', 'digits:8'],
            'logradouro' => ['nullable', 'string', 'max:255'],
            'numero' => ['nullable', 'string', 'max:20'],
            'complemento' => ['nullable', 'string', 'max:255'],
            'bairro' => ['nullable', 'string', 'max:255'],
            'cidade' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', 'string', 'size:2'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ];
    }
}
