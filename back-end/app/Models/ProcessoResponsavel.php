<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessoResponsavel extends Model
{
    protected $table = 'processo_responsaveis';

    protected $fillable = ['processo_id', 'user_id', 'tipo', 'principal'];

    protected function casts(): array
    {
        return ['principal' => 'boolean'];
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(Processo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
