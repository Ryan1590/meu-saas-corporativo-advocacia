<?php

namespace App\Http\Controllers\Api;

use App\Exports\RelatorioFinanceiroExport;
use App\Exports\RelatorioJuridicoExport;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Cliente;
use App\Models\Parcela;
use App\Models\Processo;
use App\Models\ProcessoPrazo;
use App\Models\Tarefa;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RelatorioController extends Controller
{
    public function export(Request $request, string $tipo): BinaryFileResponse
    {
        abort_unless($request->user()->hasPermission('reports.export'), 403);
        abort_unless(in_array($tipo, ['clientes', 'processos', 'prazos', 'tarefas', 'inadimplencia'], true), 404);
        $filters = $request->validate(['inicio' => ['nullable', 'date'], 'fim' => ['nullable', 'date', 'after_or_equal:inicio'], 'status' => ['nullable', 'string', 'max:30']]);
        $office = $request->user()->escritorio_id;
        [$headings, $rows] = match ($tipo) {
            'clientes' => [['Nome', 'Documento', 'E-mail', 'Status'], Cliente::where('escritorio_id', $office)->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))->get()->map(fn (Cliente $item) => [$item->nome, $item->documento, $item->email, $item->status])],
            'processos' => [['Número', 'Título', 'Status', 'Abertura'], Processo::where('escritorio_id', $office)->with('status:id,nome')->when($filters['status'] ?? null, fn ($q, $status) => $q->whereHas('status', fn ($statusQuery) => $statusQuery->where('nome', $status)))->when($filters['inicio'] ?? null, fn ($q, $date) => $q->whereDate('data_abertura', '>=', $date))->when($filters['fim'] ?? null, fn ($q, $date) => $q->whereDate('data_abertura', '<=', $date))->get()->map(fn (Processo $item) => [$item->numero_processo, $item->titulo, $item->status?->nome, $item->data_abertura?->format('d/m/Y')])],
            'prazos' => [['Título', 'Vencimento', 'Status', 'Prioridade'], ProcessoPrazo::where('escritorio_id', $office)->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))->when($filters['inicio'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '>=', $date))->when($filters['fim'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '<=', $date))->get()->map(fn (ProcessoPrazo $item) => [$item->titulo, $item->data_vencimento?->format('d/m/Y'), $item->status, $item->prioridade])],
            'tarefas' => [['Título', 'Vencimento', 'Status', 'Prioridade'], Tarefa::where('escritorio_id', $office)->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))->when($filters['inicio'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '>=', $date))->when($filters['fim'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '<=', $date))->get()->map(fn (Tarefa $item) => [$item->titulo, $item->data_vencimento?->format('d/m/Y'), $item->status, $item->prioridade])],
            'inadimplencia' => [['Contrato', 'Parcela', 'Vencimento', 'Valor', 'Status'], Parcela::where('escritorio_id', $office)->with('contrato:id,numero')->whereIn('status', ['pendente', 'parcialmente_paga'])->whereDate('data_vencimento', '<', now())->when($filters['inicio'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '>=', $date))->when($filters['fim'] ?? null, fn ($q, $date) => $q->whereDate('data_vencimento', '<=', $date))->get()->map(fn (Parcela $item) => [$item->contrato?->numero, $item->numero, $item->data_vencimento?->format('d/m/Y'), $item->valor, $item->status])],
        };
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => 'exported', 'module' => 'reports', 'description' => "Relatório de {$tipo} exportado em Excel.", 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['formato' => 'xlsx', 'tipo' => $tipo, 'filtros' => $filters]]);

        return Excel::download(new RelatorioJuridicoExport($rows, $headings), "relatorio-{$tipo}.xlsx");
    }

    public function financeiro(Request $request): BinaryFileResponse
    {
        abort_unless($request->user()->hasPermission('reports.export'), 403);
        ActivityLog::create(['user_id' => $request->user()->id, 'action' => 'exported', 'module' => 'reports', 'description' => 'Relatório financeiro exportado em Excel.', 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'details' => ['formato' => 'xlsx']]);

        return Excel::download(new RelatorioFinanceiroExport($request->user()->escritorio_id), 'relatorio-financeiro.xlsx');
    }
}
