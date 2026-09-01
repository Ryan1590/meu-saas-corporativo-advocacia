<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['escritorio_id', 'tipo_pessoa', 'nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj', 'rg', 'data_nascimento', 'email', 'telefone', 'celular', 'whatsapp', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'observacoes', 'status', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['data_nascimento' => 'date'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function atualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function processos(): HasMany
    {
        return $this->hasMany(Processo::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class);
    }

    public function tarefas(): HasMany
    {
        return $this->hasMany(Tarefa::class);
    }

    public function eventosAgenda(): HasMany
    {
        return $this->hasMany(AgendaEvento::class);
    }
}
