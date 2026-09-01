import React, { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Edit2, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { Advogado, PaginatedResponse } from '../types';
import { Column, Pagination, Table } from '../components/design-system/Table';
import { Button } from '../components/design-system/Button';
import { Input, Select, Switch } from '../components/design-system/Input';
import { Badge } from '../components/design-system/Badge';
import { ConfirmationDialog } from '../components/design-system/ConfirmationDialog';
import { Drawer, Modal } from '../components/design-system/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';
import { formatCpf, formatOab, formatPhoneBR } from '../utils/formatters';

type AdvogadoForm = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  celular: string;
  oab_numero: string;
  oab_uf: string;
  especialidade: string;
  status: 'active' | 'inactive';
  observacoes: string;
};

const emptyForm = (): AdvogadoForm => ({
  nome: '', cpf: '', email: '', telefone: '', celular: '', oab_numero: '', oab_uf: '', especialidade: '', status: 'active', observacoes: '',
});

const oabUfOptions = [
  { value: '', label: 'Selecione a UF', disabled: true },
  ...['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => ({ value: uf, label: uf })),
];

const specialtyOptions = [
  { value: '', label: 'Selecione a especialidade', disabled: true },
  ...['Administrativo', 'Ambiental', 'Bancário', 'Civil', 'Consumidor', 'Criminal', 'Digital', 'Empresarial', 'Família e Sucessões', 'Imobiliário', 'Previdenciário', 'Trabalhista', 'Tributário'].map((especialidade) => ({ value: especialidade, label: especialidade })),
];

export const AdvogadosView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();
  const [advogados, setAdvogados] = useState<Advogado[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAdvogado, setSelectedAdvogado] = useState<Advogado | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdvogadoForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchAdvogados = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ search, status: statusFilter, page: String(currentPage), perPage: String(perPage) });
      const response = await fetch(`/api/v1/advogados?${params}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      const result = json as PaginatedResponse<Advogado> & { success: boolean };
      setAdvogados(result.data);
      setTotalPages(result.meta.lastPage);
      setTotalItems(result.meta.total);
    } catch {
      toastError('Erro ao buscar advogados do servidor.', 'Erro');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter, toastError]);

  useEffect(() => { fetchAdvogados(); }, [fetchAdvogados]);

  const setField = <K extends keyof AdvogadoForm>(field: K, value: AdvogadoForm[K]) => {
    const formatted = field === 'cpf' ? formatCpf(String(value)) : field === 'telefone' || field === 'celular' ? formatPhoneBR(String(value)) : field === 'oab_numero' ? formatOab(String(value)) : value;
    setFormData((current) => ({ ...current, [field]: formatted as AdvogadoForm[K] }));
  };
  const openCreate = () => { setSelectedAdvogado(null); setFormData(emptyForm()); setFormErrors({}); setIsFormOpen(true); };
  const openEdit = (advogado: Advogado) => {
    setSelectedAdvogado(advogado);
    setFormData({ nome: advogado.nome, cpf: formatCpf(advogado.cpf || ''), email: advogado.email || '', telefone: formatPhoneBR(advogado.telefone || ''), celular: formatPhoneBR(advogado.celular || ''), oab_numero: formatOab(advogado.oabNumero || ''), oab_uf: advogado.oabUf || '', especialidade: advogado.especialidade || '', status: advogado.status === 'inactive' ? 'inactive' : 'active', observacoes: advogado.observacoes || '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload = { ...formData, oab_numero: formData.oab_numero.replace(/\D/g, '') };
      const response = await fetch(selectedAdvogado ? `/api/v1/advogados/${selectedAdvogado.id}` : '/api/v1/advogados', {
        method: selectedAdvogado ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.errors) setFormErrors(Object.fromEntries(Object.entries(json.errors).map(([field, messages]) => [field, (messages as string[])[0]])));
        toastError(json.message || 'Não foi possível salvar o advogado.');
        return;
      }
      success(json.message || 'Advogado salvo com sucesso.');
      setIsFormOpen(false);
      fetchAdvogados();
    } catch {
      toastError('Erro de conexão ao salvar advogado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdvogado) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/advogados/${selectedAdvogado.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok || !json.success) { toastError(json.message || 'Não foi possível excluir o advogado.'); return; }
      success(json.message || 'Advogado excluído com sucesso.');
      setIsDeleteOpen(false);
      fetchAdvogados();
    } catch {
      toastError('Erro de conexão ao excluir advogado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can('advogados.view')) return <ForbiddenShield requiredPermission="advogados.view" message="Seu perfil não possui permissão para visualizar advogados." />;

  const columns: Column<Advogado>[] = [
    { key: 'nome', header: 'Advogado', render: (item) => <div><button onClick={() => { setSelectedAdvogado(item); setIsDrawerOpen(true); }} className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400">{item.nome}</button><p className="text-[11px] text-slate-400">OAB {item.oabNumero}/{item.oabUf}</p></div> },
    { key: 'especialidade', header: 'Especialidade', render: (item) => <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.especialidade || 'Não informada'}</span> },
    { key: 'contato', header: 'Contato', render: (item) => <div className="text-[11px] text-slate-500 dark:text-slate-400"><p>{item.email || 'E-mail não informado'}</p><p>{item.celular || item.telefone || 'Telefone não informado'}</p></div> },
    { key: 'status', header: 'Status', render: (item) => <Badge variant={item.status === 'inactive' ? 'neutral' : 'success'} size="sm" dot>{item.status === 'inactive' ? 'Inativo' : 'Ativo'}</Badge> },
    { key: 'actions', header: 'Ações', align: 'right', render: (item) => <div className="flex items-center justify-end gap-1"><button onClick={() => { setSelectedAdvogado(item); setIsDrawerOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" title="Visualizar advogado"><Eye className="h-3.5 w-3.5" /></button>{can('advogados.update') && <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50" title="Editar advogado"><Edit2 className="h-3.5 w-3.5" /></button>}{can('advogados.delete') && <button onClick={() => { setSelectedAdvogado(item); setIsDeleteOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50" title="Excluir advogado"><Trash2 className="h-3.5 w-3.5" /></button>}</div> },
  ];

  return <div className="space-y-5 text-left">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Advogados</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Gerencie os profissionais vinculados ao escritório.</p></div>{can('advogados.create') && <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>Novo Advogado</Button>}</div>
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12"><div className="sm:col-span-8"><Input placeholder="Pesquisar por nome ou OAB..." value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} leftIcon={<Search className="h-4 w-4" />} /></div><div className="sm:col-span-4"><Select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} options={[{ value: 'all', label: 'Todos os status' }, { value: 'active', label: 'Ativos' }, { value: 'inactive', label: 'Inativos' }]} /></div></div>
    <Table columns={columns} data={advogados} keyExtractor={(item) => item.id} isLoading={isLoading} emptyMessage={<div className="space-y-2 py-8 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="text-xs text-slate-500">Nenhum advogado encontrado.</p></div>} />
    <Pagination currentPage={currentPage} totalPages={totalPages} perPage={perPage} totalItems={totalItems} onPageChange={setCurrentPage} onPerPageChange={(value) => { setPerPage(value); setCurrentPage(1); }} />
    <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedAdvogado ? 'Editar Advogado' : 'Cadastrar Advogado(a)'} size="lg"><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Nome completo" value={formData.nome} onChange={(event) => setField('nome', event.target.value)} error={formErrors.nome} required /><Input label="CPF" value={formData.cpf} onChange={(event) => setField('cpf', event.target.value)} error={formErrors.cpf} /><Input label="Número OAB" value={formData.oab_numero} onChange={(event) => setField('oab_numero', event.target.value)} error={formErrors.oab_numero} required /><Select label="UF da OAB" value={formData.oab_uf} onChange={(event) => setField('oab_uf', event.target.value)} options={oabUfOptions} error={formErrors.oab_uf} required /><Input label="E-mail" type="email" value={formData.email} onChange={(event) => setField('email', event.target.value)} error={formErrors.email} /><Select label="Especialidade" value={formData.especialidade} onChange={(event) => setField('especialidade', event.target.value)} options={specialtyOptions} error={formErrors.especialidade} /><Input label="Telefone" value={formData.telefone} onChange={(event) => setField('telefone', event.target.value)} error={formErrors.telefone} /><Input label="Celular" value={formData.celular} onChange={(event) => setField('celular', event.target.value)} error={formErrors.celular} /></div><div className="space-y-1.5"><label htmlFor="advogado-observacoes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Observações</label><textarea id="advogado-observacoes" value={formData.observacoes} onChange={(event) => setField('observacoes', event.target.value)} className="block min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></div><Switch label="Advogado ativo" checked={formData.status === 'active'} onCheckedChange={(checked) => setField('status', checked ? 'active' : 'inactive')} /><div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancelar</Button><Button type="submit" variant="primary" isLoading={isSubmitting}>Salvar</Button></div></form></Modal>
    <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={selectedAdvogado?.nome || 'Advogado'} description={selectedAdvogado ? `OAB ${selectedAdvogado.oabNumero}/${selectedAdvogado.oabUf}` : undefined}>{selectedAdvogado && <dl className="space-y-4 text-sm"><div><dt className="text-[11px] font-semibold uppercase text-slate-400">Status</dt><dd className="mt-1"><Badge variant={selectedAdvogado.status === 'inactive' ? 'neutral' : 'success'} size="sm" dot>{selectedAdvogado.status === 'inactive' ? 'Inativo' : 'Ativo'}</Badge></dd></div><div><dt className="text-[11px] font-semibold uppercase text-slate-400">Especialidade</dt><dd className="mt-1 text-slate-700 dark:text-slate-300">{selectedAdvogado.especialidade || 'Não informada'}</dd></div><div><dt className="text-[11px] font-semibold uppercase text-slate-400">Contato</dt><dd className="mt-1 text-slate-700 dark:text-slate-300">{selectedAdvogado.email || 'E-mail não informado'}<br />{selectedAdvogado.celular || selectedAdvogado.telefone || 'Telefone não informado'}</dd></div><div><dt className="text-[11px] font-semibold uppercase text-slate-400">Observações</dt><dd className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selectedAdvogado.observacoes || 'Nenhuma observação.'}</dd></div></dl>}</Drawer>
    <ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Excluir advogado" message={`Deseja excluir ${selectedAdvogado?.nome || 'este advogado'}? A ação poderá ser restaurada por um perfil autorizado.`} confirmText="Excluir" isLoading={isSubmitting} variant="danger" />
  </div>;
};