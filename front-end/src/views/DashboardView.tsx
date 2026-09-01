import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { Badge } from '../components/design-system/Badge';
import { Avatar } from '../components/design-system/Badge';
import { Skeleton } from '../components/design-system/Tabs';
import { DashboardMetrics } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardView: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { user, can } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/v1/dashboard/metrics');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setMetrics(json.data);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-80 rounded-xl" />
          <Skeleton className="lg:col-span-4 h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total de Usuários',
      value: metrics.totalUsers,
      change: `+${metrics.usersGrowthPercentage}% este mês`,
      icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: 'bg-indigo-50 dark:bg-indigo-950/60',
      trendPositive: true,
    },
    {
      title: 'Usuários Ativos',
      value: metrics.activeUsers,
      change: `${metrics.activePercentage}% do total`,
      icon: <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/60',
      trendPositive: true,
    },
    {
      title: 'Usuários Inativos',
      value: metrics.inactiveUsers,
      change: `${metrics.totalUsers - metrics.activeUsers} aguardando ativação`,
      icon: <UserX className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/60',
      trendPositive: false,
    },
    {
      title: 'Perfis de Acesso (RBAC)',
      value: metrics.totalRoles,
      change: '15 permissões ativas',
      icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: 'bg-purple-50 dark:bg-purple-950/60',
      trendPositive: true,
    },
  ];

  return (
    <div className="space-y-6 text-left">
    
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                Total de Usuários
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {metrics.totalUsers}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics.usersGrowthPercentage}% neste mês</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                Perfis Ativos
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {metrics.totalRoles}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-slate-400">
            <span>Totalmente sincronizados (RBAC)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                Usuários Ativos
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {metrics.activeUsers ? metrics.activeUsers : 0}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Total Usuários Ativos</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                Eventos de Hoje
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {metrics.recentActivities.length ? metrics.recentActivities.length : 0}
              </h3>
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/60 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-slate-400">
            <span>Registro de auditoria ativado</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area Chart: Registrations Over Time */}
        <Card
          className="lg:col-span-8"
          title="Crescimento de Cadastros e Usuários Ativos"
          subtitle="Histórico consolidado nos últimos meses"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.registrationsOverTime}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Total Cadastros"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Ativos"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Roles Distribution Bar/Pie */}
        <Card
          className="lg:col-span-4"
          title="Distribuição por Perfil"
          subtitle="Usuários associados a cada Role"
        >
          <div className="space-y-4 pt-2">
            {metrics.usersByRole.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.role}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.count} ({Math.round((item.count / (metrics.totalUsers || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(10, (item.count / (metrics.totalUsers || 1)) * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => onNavigate('/roles')}
              >
                Gerenciar Matriz de Permissões
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* BOTTOM SECTION: TABLE & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECENT USERS TABLE */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100">
                Atividade recente do usuário
              </h4>
              <p className="text-xs text-gray-400 dark:text-slate-400">
                Novos membros registrados no sistema
              </p>
            </div>
            <button
              onClick={() => onNavigate('/users')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
             Ver relatório completo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider sticky top-0 text-[10px]">
                <tr>
                  <th className="px-5 py-3">User Identity</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {metrics.recentUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-slate-100">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full font-medium text-[11px]">
                        {u.rolesDetails?.[0]?.label || 'Operator'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        />
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM EVENTS / ACTIVITY LOGS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100">
              Eventos do sistema
            </h4>
            <button
              onClick={() => onNavigate('/logs')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              Ver Todos
            </button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto max-h-[380px]">
            {metrics.recentActivities.map((log, idx) => {
              const indicatorColor =
                log.action.includes('created') || log.action.includes('register')
                  ? 'bg-emerald-500'
                  : log.action.includes('error') || log.action.includes('failed') || log.action.includes('delete')
                  ? 'bg-red-500'
                  : 'bg-indigo-500';

              return (
                <div key={log.id || idx} className="flex gap-3 text-left">
                  <div className={`w-1 ${indicatorColor} rounded-full shrink-0`} />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {log.description}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                      By {log.userName} • Module: {log.module}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400 dark:text-slate-500 font-mono">
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>• IP {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
