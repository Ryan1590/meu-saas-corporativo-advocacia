<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RelatorioJuridicoExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly Collection $linhas, private readonly array $cabecalhos) {}

    public function collection(): Collection
    {
        return $this->linhas;
    }

    public function headings(): array
    {
        return $this->cabecalhos;
    }
}
