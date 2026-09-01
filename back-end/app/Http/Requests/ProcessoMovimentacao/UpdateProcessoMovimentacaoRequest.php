<?php

namespace App\Http\Requests\ProcessoMovimentacao;

class UpdateProcessoMovimentacaoRequest extends StoreProcessoMovimentacaoRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('movimentacao'));
    }
}
