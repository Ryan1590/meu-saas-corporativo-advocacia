<?php

namespace App\Http\Requests\Tarefa;

use App\Models\Tarefa;
use Illuminate\Foundation\Http\FormRequest;

class TarefaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('post') ? $this->user()->can('create', Tarefa::class) : $this->user()->can('update', $this->route('tarefa'));
    }

    public function rules(): array
    {
        return ['titulo' => ['required', 'string', 'max:255'], 'descricao' => ['nullable', 'string'], 'processo_id' => ['nullable', 'integer', 'exists:processos,id'], 'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'], 'responsavel_id' => ['nullable', 'integer', 'exists:users,id'], 'prioridade' => ['nullable', 'in:baixa,media,alta,urgente'], 'status' => ['nullable', 'in:a_fazer,em_andamento,concluida,cancelada'], 'data_inicio' => ['nullable', 'date'], 'data_vencimento' => ['nullable', 'date', 'after_or_equal:data_inicio'], 'observacoes' => ['nullable', 'string']];
    }
}
