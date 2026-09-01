<?php

namespace App\Http\Requests\ProcessoPrazo;

class UpdateProcessoPrazoRequest extends StoreProcessoPrazoRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('prazo'));
    }
}
