import React, { useState } from 'react';
import { Download, FileSpreadsheet, LockKeyhole } from 'lucide-react';
import { Button } from '../components/design-system/Button';
import { Input, Select } from '../components/design-system/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

const reportOptions = [
  { value: 'clientes', label: 'Clientes' }, { value: 'processos', label: 'Processos' }, { value: 'prazos', label: 'Prazos processuais' }, { value: 'tarefas', label: 'Tarefas' }, { value: 'inadimplencia', label: 'Inadimplência' }, { value: 'financeiro', label: 'Financeiro consolidado' },
];

export const RelatoriosView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();
  const [type, setType] = useState('processos');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!can('reports.export')) { toastError('Seu perfil não possui permissão para exportar relatórios.'); return; }
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.set('inicio', inicio);
      if (fim) params.set('fim', fim);
      if (status) params.set('status', status);
      const path = type === 'financeiro' ? '/api/v1/reports/financeiro/export' : `/api/v1/reports/${type}/export?${params}`;
      const response = await fetch(path);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Não foi possível gerar o relatório.');
      }
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || `relatorio-${type}.xlsx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      success('Relatório exportado em Excel.');
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Erro ao exportar relatório.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!can('reports.view')) return <ForbiddenShield requiredPermission="reports.view" message="Seu perfil não possui permissão para visualizar relatórios." />;

  const isFinanceiro = type === 'financeiro';
  return <div className="space-y-5 text-left"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Relatórios</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Exporte dados do escritório em arquivos Excel.</p></div><section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><FileSpreadsheet className="h-4 w-4" /></div><div><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exportação XLSX</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Os dados são filtrados no servidor conforme o seu acesso.</p></div></div><div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"><Select label="Relatório" value={type} onChange={(event) => setType(event.target.value)} options={reportOptions} /><Input label="Data inicial" type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} disabled={isFinanceiro} /><Input label="Data final" type="date" value={fim} onChange={(event) => setFim(event.target.value)} disabled={isFinanceiro} /><Input label="Status" value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Ex.: pendente" disabled={isFinanceiro} /></div><div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center"><p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">{can('reports.export') ? 'Formato: Excel (.xlsx)' : <><LockKeyhole className="h-3.5 w-3.5" /> Exportação não autorizada</>}</p><Button variant="primary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={handleExport} isLoading={isExporting} disabled={!can('reports.export')}>Exportar XLSX</Button></div></section></div>;
};