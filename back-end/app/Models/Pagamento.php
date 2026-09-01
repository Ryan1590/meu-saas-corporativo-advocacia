<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pagamento extends Model
{
    use SoftDeletes;

    protected $fillable = ['escritorio_id', 'parcela_id', 'valor', 'data_pagamento', 'forma_pagamento', 'comprovante', 'observacoes', 'created_by'];

    protected function casts(): array
    {
        return ['valor' => 'decimal:2', 'data_pagamento' => 'date'];
    }

    public function escritorio(): BelongsTo
    {
        return $this->belongsTo(Escritorio::class);
    }

    public function parcela(): BelongsTo
    {
        return $this->belongsTo(Parcela::class);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
