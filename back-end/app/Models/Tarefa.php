<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tarefa extends Model
{
    use SoftDeletes;

    protected $fillable = ['escritorio_id', 'titulo', 'descricao', 'processo_id', 'cliente_id', 'responsavel_id', 'criador_id', 'prioridade', 'status', 'data_inicio', 'data_vencimento', 'concluido_em', 'observacoes'];

    protected function casts(): array
    {
        return ['data_inicio' => 'date', 'data_vencimento' => 'date', 'concluido_em' => 'datetime'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(Processo::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    public function criador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criador_id');
    }
}
