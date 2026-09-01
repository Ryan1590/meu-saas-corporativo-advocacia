<?php

namespace App\Http\Requests\AgendaEvento;

use App\Models\AgendaEvento;
use Illuminate\Foundation\Http\FormRequest;

class AgendaEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('post') ? $this->user()->can('create', AgendaEvento::class) : $this->user()->can('update', $this->route('agenda_evento'));
    }

    public function rules(): array
    {
        return ['titulo' => ['required', 'string', 'max:255'], 'descricao' => ['nullable', 'string'], 'tipo' => ['required', 'string', 'max:30'], 'data_inicio' => ['required', 'date'], 'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'], 'local' => ['nullable', 'string', 'max:255'], 'processo_id' => ['nullable', 'integer', 'exists:processos,id'], 'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'], 'responsavel_id' => ['nullable', 'integer', 'exists:users,id'], 'status' => ['nullable', 'in:agendado,realizado,cancelado']];
    }
}
