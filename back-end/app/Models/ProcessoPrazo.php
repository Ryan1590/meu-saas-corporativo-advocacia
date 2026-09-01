<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProcessoPrazo extends Model
{
    use SoftDeletes;

    protected $table = 'processo_prazos';

    protected $fillable = ['escritorio_id', 'processo_id', 'titulo', 'descricao', 'data_inicio', 'data_vencimento', 'responsavel_id', 'status', 'prioridade', 'concluido_em', 'observacoes', 'created_by'];

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

    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
