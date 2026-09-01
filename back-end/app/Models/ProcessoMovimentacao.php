<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessoMovimentacao extends Model
{
    protected $table = 'processo_movimentacoes';

    protected $fillable = ['escritorio_id', 'processo_id', 'data_movimentacao', 'tipo', 'titulo', 'descricao', 'responsavel_id', 'origem', 'created_by'];

    protected function casts(): array
    {
        return ['data_movimentacao' => 'date'];
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
