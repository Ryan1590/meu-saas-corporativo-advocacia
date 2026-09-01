<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Parcela extends Model
{
    use SoftDeletes;

    protected $fillable = ['escritorio_id', 'contrato_id', 'numero', 'descricao', 'valor', 'data_vencimento', 'data_pagamento', 'status', 'forma_pagamento', 'observacoes'];

    protected function casts(): array
    {
        return ['valor' => 'decimal:2', 'data_vencimento' => 'date', 'data_pagamento' => 'date'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class);
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }
}
