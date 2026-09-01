<?php

namespace App\Exports;

use App\Models\Parcela;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RelatorioFinanceiroExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly int $escritorioId) {}

    public function collection(): Collection
    {
        return Parcela::query()
            ->where('escritorio_id', $this->escritorioId)
            ->with('contrato:id,numero')
            ->orderBy('data_vencimento')
            ->get()
            ->map(fn (Parcela $parcela) => [
                $parcela->contrato?->numero,
                $parcela->numero,
                $parcela->data_vencimento?->format('d/m/Y'),
                $parcela->valor,
                $parcela->status,
            ]);
    }

    public function headings(): array
    {
        return ['Contrato', 'Parcela', 'Vencimento', 'Valor', 'Status'];
    }
}
