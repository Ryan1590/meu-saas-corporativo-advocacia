import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Notificacao, PaginatedResponse } from '../types';
import { Button } from '../components/design-system/Button';
import { Pagination } from '../components/design-system/Table';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

const notificationText = (notification: Notificacao) => {
  const data = notification.data;
  return { title: typeof data.title === 'string' ? data.title : notification.type, message: typeof data.message === 'string' ? data.message : typeof data.descricao === 'string' ? data.descricao : 'Você possui uma nova notificação.' };
};

export const NotificacoesView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/notifications?page=${currentPage}&perPage=${perPage}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      const result = json as PaginatedResponse<Notificacao> & { success: boolean };
      setNotifications(result.data); setTotalPages(result.meta.lastPage); setTotalItems(result.meta.total);
    } catch {
      toastError('Erro ao buscar notificações.', 'Erro');
    } finally { setIsLoading(false); }
  }, [currentPage, perPage, toastError]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (notification: Notificacao) => {
    if (notification.readAt) return;
    try {
      const response = await fetch(`/api/v1/notifications/${notification.id}/read`, { method: 'PATCH' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: json.data.readAt } : item));
    } catch { toastError('Não foi possível marcar a notificação como lida.'); }
  };

  const markAllRead = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/notifications/read-all', { method: 'PATCH' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      success(json.message || 'Notificações marcadas como lidas.');
      fetchNotifications();
    } catch { toastError('Não foi possível marcar todas como lidas.'); } finally { setIsSubmitting(false); }
  };

  if (!can('notifications.view')) return <ForbiddenShield requiredPermission="notifications.view" message="Seu perfil não possui permissão para visualizar notificações." />;

  return <div className="space-y-5 text-left"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notificações</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Acompanhe os avisos destinados à sua conta.</p></div><Button variant="secondary" size="sm" leftIcon={<CheckCheck className="h-3.5 w-3.5" />} onClick={markAllRead} isLoading={isSubmitting} disabled={!notifications.some((item) => !item.readAt)}>Marcar todas como lidas</Button></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">{isLoading ? <div className="py-12 text-center text-xs text-slate-500">Carregando notificações...</div> : notifications.length === 0 ? <div className="py-12 text-center"><Bell className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="mt-2 text-xs text-slate-500">Nenhuma notificação encontrada.</p></div> : <ul className="divide-y divide-slate-100 dark:divide-slate-800">{notifications.map((notification) => { const text = notificationText(notification); return <li key={notification.id} className={`flex gap-3 px-4 py-4 sm:px-5 ${notification.readAt ? '' : 'bg-indigo-50/40 dark:bg-indigo-950/10'}`}><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.readAt ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}`}><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{text.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text.message}</p><p className="mt-1.5 text-[11px] text-slate-400">{notification.createdAt ? new Date(notification.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</p></div>{!notification.readAt && <button onClick={() => markRead(notification)} className="shrink-0 self-start rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-950/50" title="Marcar como lida"><Check className="h-4 w-4" /></button>}</li>; })}</ul>}</div><Pagination currentPage={currentPage} totalPages={totalPages} perPage={perPage} totalItems={totalItems} onPageChange={setCurrentPage} onPerPageChange={(value) => { setPerPage(value); setCurrentPage(1); }} /></div>;
};