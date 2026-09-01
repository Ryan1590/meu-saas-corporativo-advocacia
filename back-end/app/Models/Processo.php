<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Processo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['escritorio_id', 'cliente_id', 'numero_processo', 'titulo', 'descricao', 'tribunal', 'comarca', 'vara', 'foro', 'tipo_acao', 'area_juridica', 'assunto', 'status_id', 'data_distribuicao', 'data_abertura', 'data_encerramento', 'valor_causa', 'valor_honorarios', 'observacoes', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['data_distribuicao' => 'date', 'data_abertura' => 'date', 'data_encerramento' => 'date', 'valor_causa' => 'decimal:2', 'valor_honorarios' => 'decimal:2'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(StatusProcesso::class, 'status_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function atualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function advogados(): BelongsToMany
    {
        return $this->belongsToMany(Advogado::class, 'processo_advogados')
            ->withPivot(['tipo', 'principal'])
            ->withTimestamps();
    }

    public function responsaveis(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'processo_responsaveis')
            ->withPivot(['tipo', 'principal'])
            ->withTimestamps();
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(ProcessoMovimentacao::class);
    }

    public function prazos(): HasMany
    {
        return $this->hasMany(ProcessoPrazo::class);
    }

    public function tarefas(): HasMany
    {
        return $this->hasMany(Tarefa::class);
    }

    public function eventosAgenda(): HasMany
    {
        return $this->hasMany(AgendaEvento::class);
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}
