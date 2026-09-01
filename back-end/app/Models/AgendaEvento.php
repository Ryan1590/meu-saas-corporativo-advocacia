<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgendaEvento extends Model
{
    use SoftDeletes;

    protected $table = 'agenda_eventos';

    protected $fillable = ['escritorio_id', 'titulo', 'descricao', 'tipo', 'data_inicio', 'data_fim', 'local', 'processo_id', 'cliente_id', 'responsavel_id', 'status', 'created_by'];

    protected function casts(): array
    {
        return ['data_inicio' => 'datetime', 'data_fim' => 'datetime'];
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

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
