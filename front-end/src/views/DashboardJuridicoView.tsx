import React, { useEffect, useState } from 'react';
import { CalendarClock, CircleDollarSign, FileWarning, FolderKanban, Scale, UsersRound } from 'lucide-react';
import { Badge, Card } from '../components/design-system/Badge';
import { Skeleton } from '../components/design-system/Tabs';
import { DashboardJuridicoMetrics } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const DashboardJuridicoView: React.FC = () => {
  const { can } = useAuth();
  const { error } = useToast();
  const [metrics, setMetrics] = useState<DashboardJuridicoMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/v1/dashboard-juridico/metrics');
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message);
        setMetrics(json.data);
      } catch {
        error('Não foi possível carregar os indicadores jurídicos.', 'Erro');
      } finally { setLoading(false); }
    };
    load();
  }, [error]);

  if (!can('dashboard-juridico.view')) return <ForbiddenShield requiredPermission="dashboard-juridico.view" message="Seu perfil não possui acesso ao dashboard jurídico." />;
  if (loading || !metrics) return <div className="space-y-5"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}</div><Skeleton className="h-64 rounded-xl" /></div>;

  const kpis = [
    ['Clientes ativos', metrics.clientesAtivos, <UsersRound className="h-5 w-5" />, 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400'],
    ['Prazos para hoje', metrics.prazos.hoje, <CalendarClock className="h-5 w-5" />, 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400'],
    ['Prazos vencidos', metrics.prazos.vencidos, <FileWarning className="h-5 w-5" />, 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400'],
    ['Tarefas pendentes', metrics.tarefasPendentes, <FolderKanban className="h-5 w-5" />, 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400'],
  ];
  return <div className="space-y-5 text-left"><div><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard Jurídico</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Visão operacional de processos, prazos e compromissos.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(([label, value, icon, color]) => <Card key={String(label)} className="border-slate-200 p-5 dark:border-slate-800"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p></div><span className={`rounded-lg p-2.5 ${color}`}>{icon}</span></div></Card>)}</div><div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><Card className="border-slate-200 p-5 dark:border-slate-800"><div className="mb-4 flex items-center gap-2"><Scale className="h-4 w-4 text-indigo-600" /><h3 className="text-sm font-semibold">Processos por status</h3></div><div className="space-y-3">{Object.entries(metrics.processosPorStatus).length ? Object.entries(metrics.processosPorStatus).map(([status, total]) => <div key={status} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"><Badge variant="indigo" size="sm">{status}</Badge><span className="text-sm font-semibold">{total}</span></div>) : <p className="py-8 text-center text-xs text-slate-500">Nenhum processo cadastrado.</p>}</div></Card><div className="space-y-5"><Card className="border-slate-200 p-5 dark:border-slate-800"><div className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Financeiro vinculado</h3></div><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-[11px] text-slate-500">A receber</p><p className="mt-1 text-base font-bold">{money(metrics.valores.a_receber)}</p></div><div><p className="text-[11px] text-slate-500">Em atraso</p><p className="mt-1 text-base font-bold text-rose-600">{money(metrics.valores.em_atraso)}</p></div></div></Card><Card className="border-slate-200 p-5 dark:border-slate-800"><h3 className="text-sm font-semibold">Agenda dos próximos 7 dias</h3><div className="mt-3 space-y-3">{metrics.agendaProxima.length ? metrics.agendaProxima.map((event) => <div key={event.id} className="flex justify-between gap-3 text-xs"><div><p className="font-medium">{event.titulo}</p><p className="text-slate-500">{event.tipo}</p></div><span className="whitespace-nowrap text-slate-500">{new Date(event.data_inicio).toLocaleDateString('pt-BR')}</span></div>) : <p className="py-3 text-xs text-slate-500">Nenhum compromisso próximo.</p>}</div></Card></div></div></div>;
};