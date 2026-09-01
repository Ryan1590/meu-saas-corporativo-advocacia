import React, { useCallback, useEffect, useState } from 'react';
import { CircleDot, Edit2, Plus, Trash2 } from 'lucide-react';
import { StatusProcesso } from '../types';
import { Button } from '../components/design-system/Button';
import { ConfirmationDialog } from '../components/design-system/ConfirmationDialog';
import { Input, Switch } from '../components/design-system/Input';
import { Drawer, Modal } from '../components/design-system/Modal';
import { Table, Column } from '../components/design-system/Table';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

type StatusForm = { nome: string; descricao: string; cor: string; ordem: number; ativo: boolean };
const emptyForm = (): StatusForm => ({ nome: '', descricao: '', cor: '#4F46E5', ordem: 0, ativo: true });

export const StatusProcessosView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();
  const [statuses, setStatuses] = useState<StatusProcesso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<StatusProcesso | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StatusForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/status-processos');
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      setStatuses(json.data);
    } catch {
      toastError('Erro ao buscar status de processos.', 'Erro');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => { fetchStatuses(); }, [fetchStatuses]);

  const openCreate = () => { setSelectedStatus(null); setFormData(emptyForm()); setFormErrors({}); setIsFormOpen(true); };
  const openEdit = (status: StatusProcesso) => { setSelectedStatus(status); setFormData({ nome: status.nome, descricao: status.descricao || '', cor: status.cor || '#4F46E5', ordem: status.ordem || 0, ativo: status.ativo }); setFormErrors({}); setIsFormOpen(true); };
  const setField = <K extends keyof StatusForm>(field: K, value: StatusForm[K]) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch(selectedStatus ? `/api/v1/status-processos/${selectedStatus.id}` : '/api/v1/status-processos', { method: selectedStatus ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.errors) setFormErrors(Object.fromEntries(Object.entries(json.errors).map(([field, messages]) => [field, (messages as string[])[0]])));
        toastError(json.message || 'Não foi possível salvar o status.');
        return;
      }
      success(json.message || 'Status salvo com sucesso.');
      setIsFormOpen(false);
      fetchStatuses();
    } catch {
      toastError('Erro de conexão ao salvar status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/status-processos/${selectedStatus.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok || !json.success) { toastError(json.message || 'Não foi possível excluir o status.'); return; }
      success(json.message || 'Status excluído com sucesso.');
      setIsDeleteOpen(false);
      fetchStatuses();
    } catch {
      toastError('Erro de conexão ao excluir status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can('status-processos.view')) return <ForbiddenShield requiredPermission="status-processos.view" message="Seu perfil não possui permissão para visualizar status de processos." />;

  const columns: Column<StatusProcesso>[] = [
    { key: 'nome', header: 'Status', render: (item) => <div className="flex items-center gap-2.5"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.cor || '#64748B' }} /><div><p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.nome}</p><p className="text-[11px] text-slate-400">{item.descricao || 'Sem descrição'}</p></div></div> },
    { key: 'ordem', header: 'Ordem', render: (item) => <span className="text-xs text-slate-600 dark:text-slate-300">{item.ordem ?? 0}</span> },
    { key: 'ativo', header: 'Disponível', render: (item) => <span className={`text-xs font-medium ${item.ativo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{item.ativo ? 'Ativo' : 'Inativo'}</span> },
    { key: 'actions', header: 'Ações', align: 'right', render: (item) => <div className="flex justify-end gap-1">{can('status-processos.update') && <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50" title="Editar status"><Edit2 className="h-3.5 w-3.5" /></button>}{can('status-processos.delete') && <button onClick={() => { setSelectedStatus(item); setIsDeleteOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50" title="Excluir status"><Trash2 className="h-3.5 w-3.5" /></button>}</div> },
  ];

  return <div className="space-y-5 text-left"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Status de Processos</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Configure as etapas usadas no acompanhamento processual.</p></div>{can('status-processos.create') && <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>Novo Status</Button>}</div><Table columns={columns} data={statuses} keyExtractor={(item) => item.id} isLoading={isLoading} emptyMessage={<div className="space-y-2 py-8 text-center"><CircleDot className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="text-xs text-slate-500">Nenhum status configurado.</p></div>} /><Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedStatus ? 'Editar Status' : 'Cadastrar Status'}><form onSubmit={handleSubmit} className="space-y-4"><Input label="Nome" value={formData.nome} onChange={(event) => setField('nome', event.target.value)} error={formErrors.nome} required /><div className="space-y-1.5"><label htmlFor="status-descricao" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Descrição</label><textarea id="status-descricao" value={formData.descricao} onChange={(event) => setField('descricao', event.target.value)} className="block min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label htmlFor="status-cor" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cor</label><input id="status-cor" type="color" value={formData.cor} onChange={(event) => setField('cor', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" /></div><Input label="Ordem" type="number" min="0" value={formData.ordem} onChange={(event) => setField('ordem', Number(event.target.value))} error={formErrors.ordem} required /></div><Switch label="Status disponível" checked={formData.ativo} onCheckedChange={(checked) => setField('ativo', checked)} /><div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit" variant="primary" isLoading={isSubmitting}>Salvar</Button></div></form></Modal><ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Excluir status" message={`Deseja excluir o status ${selectedStatus?.nome || ''}? Status vinculados a processos não podem ser excluídos.`} confirmText="Excluir" isLoading={isSubmitting} variant="danger" /></div>;
};