<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Advogado extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['escritorio_id', 'user_id', 'nome', 'cpf', 'email', 'telefone', 'celular', 'oab_numero', 'oab_uf', 'especialidade', 'status', 'observacoes'];

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processos(): BelongsToMany
    {
        return $this->belongsToMany(Processo::class, 'processo_advogados')
            ->withPivot(['tipo', 'principal'])
            ->withTimestamps();
    }
}
