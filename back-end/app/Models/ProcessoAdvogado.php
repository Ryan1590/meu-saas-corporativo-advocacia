<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessoAdvogado extends Model
{
    protected $table = 'processo_advogados';

    protected $fillable = ['processo_id', 'advogado_id', 'tipo', 'principal'];

    protected function casts(): array
    {
        return ['principal' => 'boolean'];
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(Processo::class);
    }

    public function advogado(): BelongsTo
    {
        return $this->belongsTo(Advogado::class);
    }
}
