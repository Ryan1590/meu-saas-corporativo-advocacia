<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StatusProcesso extends Model
{
    use HasFactory;

    protected $table = 'status_processos';

    protected $fillable = ['escritorio_id', 'nome', 'descricao', 'cor', 'ordem', 'ativo'];

    protected function casts(): array
    {
        return ['ativo' => 'boolean'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function processos(): HasMany
    {
        return $this->hasMany(Processo::class, 'status_id');
    }
}
