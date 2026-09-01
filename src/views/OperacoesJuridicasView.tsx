import React, { useCallback, useEffect, useState } from 'react';
import { 
  CalendarDays, 
  CircleHelp, 
  Download, 
  Edit2, 
  Eye, 
  FileText, 
  Landmark, 
  ListTodo, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  UserCheck,
  Scale,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  UserRound
} from 'lucide-react';
import { 
  AgendaEvento, 
  Cliente, 
  Contrato, 
  Documento, 
  Pagamento, 
  PaginatedResponse, 
  Parcela, 
  Processo, 
  Tarefa, 
  User 
} from '../types';
import { Badge } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { ConfirmationDialog } from '../components/design-system/ConfirmationDialog';
import { DocumentFileInput } from '../components/design-system/DocumentFileInput';
import { Input, Select } from '../components/design-system/Input';
import { Drawer, Modal } from '../components/design-system/Modal';
import { Pagination, Table, type Column } from '../components/design-system/Table';
import { Tabs } from '../components/design-system/Tabs';
import { Tooltip } from '../components/design-system/Dropdown';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';
import { brlToDecimal, formatBrlDecimal } from '../utils/formatters';

type Meta = { lastPage: number; total: number };
type ReferenceData = { 
  clientes: Cliente[]; 
  processos: Processo[]; 
  usuarios: User[]; 
  contratos: Contrato[]; 
  parcelas: Parcela[] 
};

const emptyReferences: ReferenceData = { clientes: [], processos: [], usuarios: [], contratos: [], parcelas: [] };
const errorMap = (errors?: Record<string, string[]>) => Object.fromEntries(Object.entries(errors ?? {}).map(([key, messages]) => [key, messages[0]]));
const dateValue = (value?: string | null) => (value ? value.slice(0, 10) : '');
const dateTimeValue = (value?: string | null) => (value ? value.slice(0, 16) : '');
const currency = (value?: number | string | null) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));
const clientName = (cliente?: Cliente) => cliente?.nome || cliente?.razaoSocial || cliente?.nomeFantasia || '-';
const labelStatus = (value?: string | null) => {
  if (!value) return '-';
  const map: Record<string, string> = {
    a_fazer: 'A Fazer',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
    agendado: 'Agendado',
    realizado: 'Realizado',
    cancelado: 'Cancelado',
    ativo: 'Ativo',
    encerrado: 'Encerrado',
    rescindido: 'Rescindido',
    pendente: 'Pendente',
    paga: 'Paga',
    atrasada: 'Em Atraso',
  };
  return map[value] || value.replaceAll('_', ' ');
};

const statusBadge = (value?: string | null) => {
  const isGood = value === 'concluida' || value === 'realizado' || value === 'paga' || value === 'ativo';
  const isBad = value === 'cancelada' || value === 'cancelado' || value === 'rescindido' || value === 'atrasada';
  const isWarn = value === 'em_andamento' || value === 'pendente';
  return (
    <Badge size="sm" variant={isGood ? 'success' : isBad ? 'danger' : isWarn ? 'purple' : 'indigo'} dot>
      {labelStatus(value)}
    </Badge>
  );
};

const priorityBadge = (prioridade?: string | null) => {
  switch (prioridade) {
    case 'urgente':
      return <Badge size="sm" variant="danger">Urgente</Badge>;
    case 'alta':
      return <Badge size="sm" variant="purple">Alta</Badge>;
    case 'media':
      return <Badge size="sm" variant="indigo">Média</Badge>;
    case 'baixa':
      return <Badge size="sm" variant="neutral">Baixa</Badge>;
    default:
      return <Badge size="sm" variant="neutral">Normal</Badge>;
  }
};

function useCollection<T>(endpoint: string, toastMessage: string) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [meta, setMeta] = useState<Meta>({ lastPage: 1, total: 0 });

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${endpoint}?${new URLSearchParams({ page: String(page), perPage: String(perPage) })}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      const result = json as PaginatedResponse<T> & { success: boolean };
      setItems(result.data);
      setMeta({ lastPage: result.meta.lastPage, total: result.meta.total });
    } catch {
      toast.error(toastMessage, 'Erro');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, perPage, toast, toastMessage]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, page, setPage, perPage, setPerPage, meta, reload };
}

function ListFrame({
  title,
  subtitle,
  createLabel,
  canCreate,
  onCreate,
  search,
  setSearch,
  filter,
  children,
  collection,
}: {
  title: string;
  subtitle: string;
  createLabel: string;
  canCreate: boolean;
  onCreate: () => void;
  search: string;
  setSearch: (value: string) => void;
  filter?: React.ReactNode;
  children: React.ReactNode;
  collection: { page: number; setPage: (page: number) => void; perPage: number; setPerPage: (perPage: number) => void; meta: Meta };
}) {
  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {canCreate && (
          <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={onCreate}>
            {createLabel}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12">
        <div className={filter ? 'sm:col-span-8' : 'sm:col-span-12'}>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por título, responsável ou referência..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        {filter && <div className="sm:col-span-4">{filter}</div>}
      </div>
      {children}
      <Pagination
        currentPage={collection.page}
        totalPages={collection.meta.lastPage}
        perPage={collection.perPage}
        totalItems={collection.meta.total}
        onPageChange={collection.setPage}
        onPerPageChange={(value) => {
          collection.setPerPage(value);
          collection.setPage(1);
        }}
      />
    </div>
  );
}

function References({ onLoad }: { onLoad: (data: ReferenceData) => void }) {
  useEffect(() => {
    Promise.all(['clientes', 'processos', 'users', 'contratos', 'parcelas'].map((path) =>
      fetch(`/api/v1/${path}?perPage=100`).then((response) => response.json())
    )).then((data) =>
      onLoad({
        clientes: data[0].data ?? [],
        processos: data[1].data ?? [],
        usuarios: data[2].data ?? [],
        contratos: data[3].data ?? [],
        parcelas: data[4].data ?? [],
      })
    );
  }, [onLoad]);
  return null;
}

const relationFields = (
  form: Record<string, string>,
  setField: (field: string, value: string) => void,
  references: ReferenceData,
  includeContract = false
) => (
  <>
    <Select
      label="Cliente Vinculado"
      value={form.cliente_id}
      onChange={(event) => setField('cliente_id', event.target.value)}
      options={[{ value: '', label: 'Não vincular cliente' }, ...references.clientes.map((item) => ({ value: item.id, label: clientName(item) }))]}
    />
    <Select
      label="Processo Vinculado"
      value={form.processo_id}
      onChange={(event) => setField('processo_id', event.target.value)}
      options={[{ value: '', label: 'Não vincular processo' }, ...references.processos.map((item) => ({ value: item.id, label: item.numeroProcesso }))]}
    />
    {includeContract && (
      <Select
        label="Contrato de Honorários"
        value={form.contrato_id}
        onChange={(event) => setField('contrato_id', event.target.value)}
        options={[{ value: '', label: 'Não vincular contrato' }, ...references.contratos.map((item) => ({ value: item.id, label: item.numero }))]}
      />
    )}
  </>
);

const Actions = ({ onView, onEdit, onDelete }: { onView: () => void; onEdit?: () => void; onDelete?: () => void }) => (
  <div className="flex items-center justify-end gap-1">
    <button
      title="Visualizar Detalhes"
      onClick={onView}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
    >
      <Eye className="h-3.5 w-3.5" />
    </button>
    {onEdit && (
      <button
        title="Editar Registro"
        onClick={onEdit}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
    )}
    {onDelete && (
      <button
        title="Excluir Registro"
        onClick={onDelete}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

const Empty = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="py-8 text-center text-xs text-slate-500">
    <span className="mx-auto mb-2 block h-8 w-8 text-slate-300 dark:text-slate-600">{icon}</span>
    {message}
  </div>
);

const TextArea = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="block sm:col-span-2">
    <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </label>
);

const FormFooter = ({ formId, saving, onCancel }: { formId: string; saving: boolean; onCancel: () => void }) => (
  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
    <Button variant="secondary" onClick={onCancel} disabled={saving}>
      Cancelar
    </Button>
    <Button
      variant="primary"
      onClick={() => document.getElementById(formId)?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
      isLoading={saving}
    >
      Salvar
    </Button>
  </div>
);

const DetailDrawer = ({ open, onClose, title, values }: { open: boolean; onClose: () => void; title: string; values: [string, string][] }) => (
  <Drawer isOpen={open} onClose={onClose} title={title}>
    <dl className="space-y-3 text-xs text-left">
      {values.map(([label, value]) => (
        <div key={label} className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <dt className="text-slate-400 font-semibold uppercase text-[10px]">{label}</dt>
          <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  </Drawer>
);

const DeleteDialog = ({ open, onClose, onConfirm, saving, item }: { open: boolean; onClose: () => void; onConfirm: () => void; saving: boolean; item: string }) => (
  <ConfirmationDialog
    isOpen={open}
    onClose={onClose}
    onConfirm={onConfirm}
    isLoading={saving}
    title="Confirmar exclusão"
    message={<>Deseja realmente excluir {item}? Esta ação poderá ser restaurada por administradores autorizados.</>}
    confirmText="Excluir"
    variant="danger"
  />
);

/* =========================================================================
   1. TAREFAS VIEW
   ========================================================================= */
export const TarefasView: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const collection = useCollection<Tarefa>('/api/v1/tarefas', 'Não foi possível carregar tarefas.');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Tarefa | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [references, setReferences] = useState(emptyReferences);

  const empty = () => ({
    titulo: '',
    descricao: '',
    processo_id: '',
    cliente_id: '',
    responsavel_id: '',
    prioridade: 'media',
    status: 'a_fazer',
    data_inicio: '',
    data_vencimento: '',
    observacoes: '',
  });

  const [form, setForm] = useState(empty());

  const visible = collection.items.filter(
    (item) =>
      (!status || status === 'all' || item.status === status) &&
      `${item.titulo} ${item.responsavel?.name ?? ''} ${item.cliente?.nome ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openForm = (item?: Tarefa) => {
    setSelected(item ?? null);
    setErrors({});
    setForm(
      item
        ? {
            titulo: item.titulo,
            descricao: item.descricao ?? '',
            processo_id: item.processo?.id ?? '',
            cliente_id: item.cliente?.id ?? '',
            responsavel_id: item.responsavel?.id ?? '',
            prioridade: item.prioridade ?? 'media',
            status: item.status ?? 'a_fazer',
            data_inicio: dateValue(item.dataInicio),
            data_vencimento: dateValue(item.dataVencimento),
            observacoes: item.observacoes ?? '',
          }
        : empty()
    );
    setFormOpen(true);
  };

  const quickToggleStatus = async (item: Tarefa) => {
    const nextStatus = item.status === 'concluida' ? 'a_fazer' : 'concluida';
    try {
      const response = await fetch(`/api/v1/tarefas/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(nextStatus === 'concluida' ? 'Tarefa concluída!' : 'Tarefa reaberta.');
      collection.reload();
    } catch {
      toast.error('Não foi possível alterar o status da tarefa.');
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await fetch(selected ? `/api/v1/tarefas/${selected.id}` : '/api/v1/tarefas', {
        method: selected ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(errorMap(json.errors));
        toast.error(json.message || 'Não foi possível salvar a tarefa.');
        return;
      }
      toast.success(json.message || 'Tarefa salva com sucesso.');
      setFormOpen(false);
      collection.reload();
    } catch {
      toast.error('Erro de conexão ao salvar tarefa.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/tarefas/${selected.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || 'Tarefa excluída.');
      setDeleteOpen(false);
      setDrawerOpen(false);
      collection.reload();
    } catch {
      toast.error('Não foi possível excluir a tarefa.');
    } finally {
      setSaving(false);
    }
  };

  if (!can('tarefas.view')) return <ForbiddenShield requiredPermission="tarefas.view" />;

  // Contadores
  const totalAFazer = collection.items.filter((t) => t.status === 'a_fazer').length;
  const totalEmAndamento = collection.items.filter((t) => t.status === 'em_andamento').length;
  const totalConcluidas = collection.items.filter((t) => t.status === 'concluida').length;

  const columns: Column<Tarefa>[] = [
    {
      key: 'titulo',
      header: 'Tarefa & Vínculo',
      render: (item) => (
        <div className="flex items-start gap-2.5">
          <button
            onClick={() => quickToggleStatus(item)}
            className={`mt-0.5 rounded p-0.5 transition-colors ${
              item.status === 'concluida' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 hover:text-slate-500'
            }`}
            title={item.status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <div>
            <button
              className={`text-left text-xs font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 ${
                item.status === 'concluida' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
              }`}
              onClick={() => {
                setSelected(item);
                setDrawerOpen(true);
              }}
            >
              {item.titulo}
            </button>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span>{item.responsavel?.name || 'Sem responsável'}</span>
              {item.cliente && (
                <>
                  <span>•</span>
                  <span className="text-slate-500">{clientName(item.cliente)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'prioridade',
      header: 'Prioridade',
      render: (item) => priorityBadge(item.prioridade),
    },
    {
      key: 'vencimento',
      header: 'Prazo',
      render: (item) => (
        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {dateValue(item.dataVencimento) ? new Date(item.dataVencimento!).toLocaleDateString('pt-BR') : 'Sem prazo'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => statusBadge(item.status),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => (
        <Actions
          onView={() => {
            setSelected(item);
            setDrawerOpen(true);
          }}
          onEdit={can('tarefas.update') ? () => openForm(item) : undefined}
          onDelete={can('tarefas.delete') ? () => {
            setSelected(item);
            setDeleteOpen(true);
          } : undefined}
        />
      ),
    },
  ];

  return (
    <>
      <References onLoad={setReferences} />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <ListTodo className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">A Fazer</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalAFazer}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Em Andamento</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalEmAndamento}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Concluídas</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalConcluidas}</p>
          </div>
        </div>
      </div>

      <ListFrame
        title="Quadro de Tarefas"
        subtitle="Gerenciamento de atividades diárias, prazos internos e distribuição de trabalho."
        createLabel="Nova Tarefa"
        canCreate={can('tarefas.create')}
        onCreate={() => openForm()}
        search={search}
        setSearch={setSearch}
        filter={
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              ...['a_fazer', 'em_andamento', 'concluida', 'cancelada'].map((value) => ({
                value,
                label: labelStatus(value),
              })),
            ]}
          />
        }
        collection={collection}
      >
        <Table
          columns={columns}
          data={visible}
          keyExtractor={(item) => item.id}
          isLoading={collection.loading}
          emptyMessage={<Empty icon={<ListTodo />} message="Nenhuma tarefa encontrada para os filtros atuais." />}
        />
      </ListFrame>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selected ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
        size="lg"
        footer={<FormFooter formId="tarefa-form" saving={saving} onCancel={() => setFormOpen(false)} />}
      >
        <form id="tarefa-form" onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          <Input label="Título da Tarefa" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} error={errors.titulo} required />
          <Select
            label="Responsável"
            value={form.responsavel_id}
            onChange={(event) => setForm({ ...form, responsavel_id: event.target.value })}
            options={[{ value: '', label: 'Sem responsável definido' }, ...references.usuarios.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <Select
            label="Nível de Prioridade"
            value={form.prioridade}
            onChange={(event) => setForm({ ...form, prioridade: event.target.value })}
            options={['baixa', 'media', 'alta', 'urgente'].map((value) => ({ value, label: labelStatus(value) }))}
          />
          <Select
            label="Status Atual"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
            options={['a_fazer', 'em_andamento', 'concluida', 'cancelada'].map((value) => ({ value, label: labelStatus(value) }))}
          />
          <Input label="Data de Início" type="date" value={form.data_inicio} onChange={(event) => setForm({ ...form, data_inicio: event.target.value })} />
          <Input label="Data de Vencimento" type="date" value={form.data_vencimento} onChange={(event) => setForm({ ...form, data_vencimento: event.target.value })} error={errors.data_vencimento} />
          {relationFields(form, (field, value) => setForm({ ...form, [field]: value }), references)}
          <TextArea label="Descrição Detalhada" value={form.descricao} onChange={(value) => setForm({ ...form, descricao: value })} />
          <TextArea label="Observações Internas" value={form.observacoes} onChange={(value) => setForm({ ...form, observacoes: value })} />
        </form>
      </Modal>

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.titulo || 'Detalhes da Tarefa'}
        values={[
          ['Status', labelStatus(selected?.status)],
          ['Prioridade', labelStatus(selected?.prioridade)],
          ['Responsável', selected?.responsavel?.name || 'Não atribuído'],
          ['Cliente Vinculado', clientName(selected?.cliente)],
          ['Processo', selected?.processo?.numeroProcesso || 'Não vinculado'],
          ['Início', dateValue(selected?.dataInicio) ? new Date(selected?.dataInicio!).toLocaleDateString('pt-BR') : '-'],
          ['Vencimento', dateValue(selected?.dataVencimento) ? new Date(selected?.dataVencimento!).toLocaleDateString('pt-BR') : '-'],
          ['Descrição', selected?.descricao || 'Sem descrição'],
          ['Observações', selected?.observacoes || 'Sem observações'],
        ]}
      />

      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} saving={saving} item="a tarefa" />
    </>
  );
};

/* =========================================================================
   2. AGENDA VIEW
   ========================================================================= */
export const AgendaView: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const collection = useCollection<AgendaEvento>('/api/v1/agenda-eventos', 'Não foi possível carregar a agenda.');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AgendaEvento | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [references, setReferences] = useState(emptyReferences);

  const empty = () => ({
    titulo: '',
    descricao: '',
    tipo: 'audiencia',
    data_inicio: '',
    data_fim: '',
    local: '',
    processo_id: '',
    cliente_id: '',
    responsavel_id: '',
    status: 'agendado',
  });

  const [form, setForm] = useState(empty());

  const visible = collection.items.filter((item) =>
    `${item.titulo} ${item.tipo} ${item.local ?? ''} ${item.cliente?.nome ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openForm = (item?: AgendaEvento) => {
    setSelected(item ?? null);
    setErrors({});
    setForm(
      item
        ? {
            titulo: item.titulo,
            descricao: item.descricao ?? '',
            tipo: item.tipo,
            data_inicio: dateTimeValue(item.dataInicio),
            data_fim: dateTimeValue(item.dataFim),
            local: item.local ?? '',
            processo_id: item.processo?.id ?? '',
            cliente_id: item.cliente?.id ?? '',
            responsavel_id: item.responsavel?.id ?? '',
            status: item.status ?? 'agendado',
          }
        : empty()
    );
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await fetch(selected ? `/api/v1/agenda-eventos/${selected.id}` : '/api/v1/agenda-eventos', {
        method: selected ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(errorMap(json.errors));
        toast.error(json.message || 'Não foi possível salvar o evento.');
        return;
      }
      toast.success(json.message || 'Evento salvo com sucesso.');
      setFormOpen(false);
      collection.reload();
    } catch {
      toast.error('Erro de conexão ao salvar evento.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/agenda-eventos/${selected.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || 'Evento excluído.');
      setDeleteOpen(false);
      setDrawerOpen(false);
      collection.reload();
    } catch {
      toast.error('Não foi possível excluir o evento.');
    } finally {
      setSaving(false);
    }
  };

  if (!can('agenda.view')) return <ForbiddenShield requiredPermission="agenda.view" />;

  const columns: Column<AgendaEvento>[] = [
    {
      key: 'titulo',
      header: 'Compromisso / Audiência',
      render: (item) => (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <button
              className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
              onClick={() => {
                setSelected(item);
                setDrawerOpen(true);
              }}
            >
              {item.titulo}
            </button>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span className="capitalize font-medium text-indigo-600 dark:text-indigo-400">{item.tipo}</span>
              {item.local && (
                <>
                  <span>•</span>
                  <span>{item.local}</span>
                </>
              )}
              {item.cliente && (
                <>
                  <span>•</span>
                  <span className="text-slate-500">{clientName(item.cliente)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'inicio',
      header: 'Data & Horário',
      render: (item) => (
        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
          {new Date(item.dataInicio).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => statusBadge(item.status),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => (
        <Actions
          onView={() => {
            setSelected(item);
            setDrawerOpen(true);
          }}
          onEdit={can('agenda.update') ? () => openForm(item) : undefined}
          onDelete={can('agenda.delete') ? () => {
            setSelected(item);
            setDeleteOpen(true);
          } : undefined}
        />
      ),
    },
  ];

  return (
    <>
      <References onLoad={setReferences} />
      <ListFrame
        title="Agenda & Audiências"
        subtitle="Acompanhe audiências, reuniões, julgamentos e despachos com juízes."
        createLabel="Novo Compromisso"
        canCreate={can('agenda.create')}
        onCreate={() => openForm()}
        search={search}
        setSearch={setSearch}
        collection={collection}
      >
        <Table
          columns={columns}
          data={visible}
          keyExtractor={(item) => item.id}
          isLoading={collection.loading}
          emptyMessage={<Empty icon={<CalendarDays />} message="Nenhum compromisso agendado para o período." />}
        />
      </ListFrame>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selected ? 'Editar Compromisso' : 'Agendar Audiência ou Compromisso'}
        size="lg"
        footer={<FormFooter formId="agenda-form" saving={saving} onCancel={() => setFormOpen(false)} />}
      >
        <form id="agenda-form" onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          <Input label="Título do Compromisso" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} error={errors.titulo} required />
          <Select
            label="Tipo de Evento"
            value={form.tipo}
            onChange={(event) => setForm({ ...form, tipo: event.target.value })}
            options={[
              { value: 'audiencia', label: 'Audiência' },
              { value: 'reuniao', label: 'Reunião com Cliente' },
              { value: 'despacho', label: 'Despacho com Juiz' },
              { value: 'pericia', label: 'Perícia Técnica' },
              { value: 'prazo_fatal', label: 'Prazo Fatal' },
              { value: 'outro', label: 'Outro' },
            ]}
            error={errors.tipo}
            required
          />
          <Input label="Data e Hora de Início" type="datetime-local" value={form.data_inicio} onChange={(event) => setForm({ ...form, data_inicio: event.target.value })} error={errors.data_inicio} required />
          <Input label="Data e Hora de Término" type="datetime-local" value={form.data_fim} onChange={(event) => setForm({ ...form, data_fim: event.target.value })} error={errors.data_fim} />
          <Input label="Local / Sala / Link Virtual" value={form.local} onChange={(event) => setForm({ ...form, local: event.target.value })} placeholder="Ex: Fórum Central - 2ª Vara Cível ou Google Meet" />
          <Select
            label="Advogado / Responsável"
            value={form.responsavel_id}
            onChange={(event) => setForm({ ...form, responsavel_id: event.target.value })}
            options={[{ value: '', label: 'Sem responsável' }, ...references.usuarios.map((item) => ({ value: item.id, label: item.name }))]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
            options={['agendado', 'realizado', 'cancelado'].map((value) => ({ value, label: labelStatus(value) }))}
          />
          {relationFields(form, (field, value) => setForm({ ...form, [field]: value }), references)}
          <TextArea label="Pauta / Descrição do Compromisso" value={form.descricao} onChange={(value) => setForm({ ...form, descricao: value })} />
        </form>
      </Modal>

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.titulo || 'Compromisso da Agenda'}
        values={[
          ['Tipo', selected?.tipo || '-'],
          ['Status', labelStatus(selected?.status)],
          ['Início', selected ? new Date(selected.dataInicio).toLocaleString('pt-BR') : '-'],
          ['Término', selected?.dataFim ? new Date(selected.dataFim).toLocaleString('pt-BR') : '-'],
          ['Local', selected?.local || 'Não informado'],
          ['Cliente', clientName(selected?.cliente)],
          ['Processo', selected?.processo?.numeroProcesso || 'Não vinculado'],
          ['Pauta / Descrição', selected?.descricao || 'Sem descrição'],
        ]}
      />

      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} saving={saving} item="o evento" />
    </>
  );
};

/* =========================================================================
   3. DOCUMENTOS VIEW
   ========================================================================= */
export const DocumentosView: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const collection = useCollection<Documento>('/api/v1/documentos', 'Não foi possível carregar documentos.');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Documento | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [references, setReferences] = useState(emptyReferences);
  const [file, setFile] = useState<File | null>(null);
  const [vincularA, setVincularA] = useState<'cliente' | 'processo' | ''>('');
  const [form, setForm] = useState({ nome: '', categoria: '', descricao: '', cliente_id: '', processo_id: '', contrato_id: '' });

  const visible = collection.items.filter((item) =>
    `${item.nome} ${item.nomeOriginal} ${item.categoria}`.toLowerCase().includes(search.toLowerCase())
  );

  const download = async (documento: Documento) => {
    try {
      const response = await fetch(`/api/v1/documentos/${documento.id}/download`);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const filename = (documento.nomeOriginal || documento.nome || 'documento').replace(/[\\/:*?"<>|]/g, '_') || 'documento';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Não foi possível baixar o documento.');
    }
  };

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setErrors({ arquivo: 'Selecione um arquivo para envio.' });
      return;
    }
    if (!vincularA || (vincularA === 'cliente' ? !form.cliente_id : !form.processo_id)) {
      setErrors({ vinculo: 'Selecione o vínculo do documento.' });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const data = new FormData();
      data.append('arquivo', file);
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      const response = await fetch('/api/v1/documentos', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(errorMap(json.errors));
        toast.error(json.message || 'Não foi possível enviar o documento.');
        return;
      }
      toast.success(json.message || 'Documento anexado com sucesso.');
      setFormOpen(false);
      collection.reload();
    } catch {
      toast.error('Erro de conexão ao enviar documento.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/documentos/${selected.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || 'Documento excluído.');
      setDeleteOpen(false);
      setDrawerOpen(false);
      collection.reload();
    } catch {
      toast.error('Não foi possível excluir o documento.');
    } finally {
      setSaving(false);
    }
  };

  if (!can('documentos.view')) return <ForbiddenShield requiredPermission="documentos.view" />;

  const columns: Column<Documento>[] = [
    {
      key: 'nome',
      header: 'Arquivo & Identificação',
      render: (item) => (
        <button className="text-left text-xs font-semibold hover:text-indigo-600" onClick={() => { setSelected(item); setDrawerOpen(true); }}>
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="truncate">{item.nome}</span>
          </span>
          <p className="ml-6 text-[11px] font-normal text-slate-400 truncate">{item.nomeOriginal}</p>
        </button>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (item) => <Badge size="sm" variant="indigo">{item.categoria || 'Geral'}</Badge>,
    },
    {
      key: 'tamanho',
      header: 'Tamanho',
      render: (item) => `${(item.tamanho / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => (
        <div className="flex justify-end gap-1">
          <button title="Visualizar" onClick={() => { setSelected(item); setDrawerOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {can('documentos.download') && (
            <button title="Baixar Arquivo" onClick={() => download(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
          {can('documentos.delete') && (
            <button title="Excluir" onClick={() => { setSelected(item); setDeleteOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <References onLoad={setReferences} />
      <ListFrame
        title="Central de Documentos & Anexos"
        subtitle="Repositório central de petições, procurações, comprovantes e contratos."
        createLabel="Anexar Documento"
        canCreate={can('documentos.create')}
        onCreate={() => {
          setFile(null);
          setErrors({});
          setVincularA('');
          setForm({ nome: '', categoria: '', descricao: '', cliente_id: '', processo_id: '', contrato_id: '' });
          setFormOpen(true);
        }}
        search={search}
        setSearch={setSearch}
        collection={collection}
      >
        <Table columns={columns} data={visible} keyExtractor={(item) => item.id} isLoading={collection.loading} emptyMessage={<Empty icon={<FileText />} message="Nenhum documento encontrado." />} />
      </ListFrame>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Anexar Novo Documento" footer={<FormFooter formId="documento-form" saving={saving} onCancel={() => setFormOpen(false)} />}>
        <form id="documento-form" onSubmit={upload} className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          <DocumentFileInput value={file} onChange={setFile} error={errors.arquivo} disabled={saving} />
          <Input label="Nome de Identificação" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} error={errors.nome} placeholder="Ex: Procuração Ad Judicia Assinada" />
          <Input label="Categoria" value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })} error={errors.categoria} required placeholder="Ex: Petição, Procuração, Sentença" />
          <div>
            <div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vincular a <span className="text-rose-500">*</span>
            </div>
            <Select
              aria-label="Vincular a"
              value={vincularA}
              onChange={(event) => {
                const value = event.target.value as 'cliente' | 'processo' | '';
                setVincularA(value);
                setForm({ ...form, cliente_id: '', processo_id: '', contrato_id: '' });
              }}
              options={[
                { value: '', label: 'Selecione o tipo de vínculo' },
                { value: 'cliente', label: 'Cliente' },
                { value: 'processo', label: 'Processo' },
              ]}
              error={errors.vinculo}
              required
            />
          </div>
          {vincularA === 'cliente' && (
            <Select
              label="Cliente"
              value={form.cliente_id}
              onChange={(event) => setForm({ ...form, cliente_id: event.target.value })}
              options={[{ value: '', label: 'Selecione o cliente' }, ...references.clientes.map((item) => ({ value: item.id, label: clientName(item) }))]}
              required
            />
          )}
          {vincularA === 'processo' && (
            <Select
              label="Processo"
              value={form.processo_id}
              onChange={(event) => setForm({ ...form, processo_id: event.target.value })}
              options={[{ value: '', label: 'Selecione o processo' }, ...references.processos.map((item) => ({ value: item.id, label: item.numeroProcesso }))]}
              required
            />
          )}
          <TextArea label="Observações do Arquivo" value={form.descricao} onChange={(value) => setForm({ ...form, descricao: value })} />
        </form>
      </Modal>

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.nome || 'Documento'}
        values={[
          ['Arquivo original', selected?.nomeOriginal || '-'],
          ['Categoria', selected?.categoria || 'Geral'],
          ['Tipo MIME', selected?.mimeType || '-'],
          ['Tamanho', selected ? `${(selected.tamanho / 1024 / 1024).toFixed(2)} MB` : '-'],
          ['Descrição', selected?.descricao || 'Sem descrição'],
        ]}
      />

      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} saving={saving} item="o documento" />
    </>
  );
};

/* =========================================================================
   4. HONORÁRIOS & CONTRATOS (FINANCEIRO) VIEW
   ========================================================================= */
export const FinanceiroView: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('contratos');
  const contratos = useCollection<Contrato>('/api/v1/contratos', 'Não foi possível carregar contratos.');
  const parcelas = useCollection<Parcela>('/api/v1/parcelas', 'Não foi possível carregar parcelas.');
  const pagamentos = useCollection<Pagamento>('/api/v1/pagamentos', 'Não foi possível carregar pagamentos.');
  const [references, setReferences] = useState(emptyReferences);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<(Contrato | Parcela | Pagamento) | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Record<string, string>>({});

  const config =
    tab === 'contratos'
      ? {
          endpoint: '/api/v1/contratos',
          label: 'Contrato de Honorários',
          collection: contratos,
          permission: 'contratos',
          empty: {
            cliente_id: '',
            processo_id: '',
            numero: '',
            descricao: '',
            data_inicio: '',
            data_fim: '',
            valor_total: '',
            forma_pagamento: 'Pix',
            status: 'ativo',
            observacoes: '',
          },
        }
      : tab === 'parcelas'
      ? {
          endpoint: '/api/v1/parcelas',
          label: 'Parcela de Honorário',
          collection: parcelas,
          permission: 'parcelas',
          empty: {
            contrato_id: '',
            numero: '1',
            descricao: '',
            valor: '',
            data_vencimento: '',
            forma_pagamento: 'Pix',
            observacoes: '',
          },
        }
      : {
          endpoint: '/api/v1/pagamentos',
          label: 'Recebimento / Pagamento',
          collection: pagamentos,
          permission: 'pagamentos',
          empty: {
            parcela_id: '',
            valor: '',
            data_pagamento: '',
            forma_pagamento: 'Pix',
            comprovante: '',
            observacoes: '',
          },
        };

  const openForm = (item?: Contrato | Parcela | Pagamento) => {
    setSelected(item ?? null);
    setErrors({});
    if (!item) {
      setForm(config.empty);
    } else if (tab === 'contratos') {
      const current = item as Contrato;
      setForm({
        cliente_id: current.cliente?.id ?? '',
        processo_id: current.processo?.id ?? '',
        numero: current.numero,
        descricao: current.descricao ?? '',
        data_inicio: dateValue(current.dataInicio),
        data_fim: dateValue(current.dataFim),
        valor_total: formatBrlDecimal(current.valorTotal),
        forma_pagamento: current.formaPagamento,
        status: current.status ?? 'ativo',
        observacoes: current.observacoes ?? '',
      });
    } else if (tab === 'parcelas') {
      const current = item as Parcela;
      setForm({
        contrato_id: current.contrato?.id ?? '',
        numero: String(current.numero),
        descricao: current.descricao ?? '',
        valor: formatBrlDecimal(current.valor),
        data_vencimento: dateValue(current.dataVencimento),
        forma_pagamento: current.formaPagamento ?? '',
        observacoes: current.observacoes ?? '',
      });
    } else {
      const current = item as Pagamento;
      setForm({
        valor: formatBrlDecimal(current.valor),
        data_pagamento: dateValue(current.dataPagamento),
        forma_pagamento: current.formaPagamento,
        comprovante: '',
        observacoes: current.observacoes ?? '',
      });
    }
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        ...(form.valor_total !== undefined ? { valor_total: brlToDecimal(form.valor_total) } : {}),
        ...(form.valor !== undefined ? { valor: brlToDecimal(form.valor) } : {}),
      };
      const response = await fetch(selected ? `${config.endpoint}/${selected.id}` : config.endpoint, {
        method: selected ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(errorMap(json.errors));
        toast.error(json.message || `Não foi possível salvar ${config.label.toLowerCase()}.`);
        return;
      }
      toast.success(json.message || `${config.label} salvo com sucesso.`);
      setFormOpen(false);
      config.collection.reload();
      parcelas.reload();
      pagamentos.reload();
    } catch {
      toast.error(`Erro de conexão ao salvar ${config.label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const suffix = tab === 'pagamentos' ? '/cancelar' : '';
      const response = await fetch(`${config.endpoint}/${selected.id}${suffix}`, {
        method: tab === 'pagamentos' ? 'POST' : 'DELETE',
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || `${config.label} removido com sucesso.`);
      setDeleteOpen(false);
      setDrawerOpen(false);
      config.collection.reload();
      parcelas.reload();
      pagamentos.reload();
    } catch {
      toast.error(`Não foi possível remover ${config.label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  if (!can('contratos.view') && !can('parcelas.view') && !can('pagamentos.view')) {
    return <ForbiddenShield requiredPermission="contratos.view" message="Seu perfil não possui permissão para visualizar o financeiro." />;
  }

  // Métricas financeiras calculadas
  const totalContratado = contratos.items.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0);
  const totalRecebido = pagamentos.items.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const totalPendente = Math.max(0, totalContratado - totalRecebido);

  return (
    <>
      <References onLoad={setReferences} />
      <div className="space-y-5 text-left">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Honorários & Gestão Financeira</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Controle de contratos de prestação de serviços, parcelamentos e recebimentos de clientes.
          </p>
        </div>

        {/* Cards Resumo Financeiro */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Contratado</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{currency(totalContratado)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Honorários Recebidos</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(totalRecebido)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo a Receber</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{currency(totalPendente)}</p>
            </div>
          </div>
        </div>

        <Tabs
          activeTab={tab}
          onChange={(value) => {
            setTab(value);
            setSearch('');
          }}
          tabs={[
            ...(can('contratos.view') ? [{ id: 'contratos', label: 'Contratos de Honorários' }] : []),
            ...(can('parcelas.view') ? [{ id: 'parcelas', label: 'Parcelas & Vencimentos' }] : []),
            ...(can('pagamentos.view') ? [{ id: 'pagamentos', label: 'Histórico de Pagamentos' }] : []),
          ]}
        />

        {tab === 'contratos' && (
          <ListFrame
            title="Contratos de Honorários"
            subtitle="Acordos de honorários pactuados com clientes para processos ou consultorias."
            createLabel="Novo Contrato"
            canCreate={can('contratos.create')}
            onCreate={() => openForm()}
            search={search}
            setSearch={setSearch}
            collection={config.collection}
          >
            <Table
              columns={[
                {
                  key: 'numero',
                  header: 'Nº Contrato & Cliente',
                  render: (item: Contrato) => (
                    <button
                      className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100"
                      onClick={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                    >
                      {item.numero}
                      <p className="font-normal text-slate-400">{clientName(item.cliente)}</p>
                    </button>
                  ),
                },
                {
                  key: 'processo',
                  header: 'Processo',
                  render: (item: Contrato) => (
                    <span className="text-[11px] text-slate-500">{item.processo?.numeroProcesso || 'Avulso'}</span>
                  ),
                },
                {
                  key: 'valor',
                  header: 'Valor Total',
                  render: (item: Contrato) => <span className="font-semibold text-slate-900 dark:text-slate-100">{currency(item.valorTotal)}</span>,
                },
                {
                  key: 'formaPagamento',
                  header: 'Forma',
                  render: (item: Contrato) => <span className="text-xs text-slate-500">{item.formaPagamento || 'Pix'}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: Contrato) => statusBadge(item.status),
                },
                {
                  key: 'actions',
                  header: 'Ações',
                  align: 'right',
                  render: (item: Contrato) => (
                    <Actions
                      onView={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                      onEdit={can('contratos.update') ? () => openForm(item) : undefined}
                      onDelete={can('contratos.delete') ? () => {
                        setSelected(item);
                        setDeleteOpen(true);
                      } : undefined}
                    />
                  ),
                },
              ]}
              data={contratos.items.filter((item) =>
                `${item.numero} ${clientName(item.cliente)}`.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              isLoading={contratos.loading}
              emptyMessage={<Empty icon={<Landmark />} message="Nenhum contrato de honorários encontrado." />}
            />
          </ListFrame>
        )}

        {tab === 'parcelas' && (
          <ListFrame
            title="Parcelas de Honorários"
            subtitle="Acompanhamento de vencimentos e quitação de parcelas."
            createLabel="Nova Parcela"
            canCreate={can('parcelas.create')}
            onCreate={() => openForm()}
            search={search}
            setSearch={setSearch}
            collection={config.collection}
          >
            <Table
              columns={[
                {
                  key: 'numero',
                  header: 'Parcela & Contrato',
                  render: (item: Parcela) => (
                    <button
                      className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100"
                      onClick={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                    >
                      Parcela #{item.numero}
                      <p className="font-normal text-slate-400">Contrato: {item.contrato?.numero || '-'}</p>
                    </button>
                  ),
                },
                {
                  key: 'vencimento',
                  header: 'Vencimento',
                  render: (item: Parcela) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {dateValue(item.dataVencimento) ? new Date(item.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  ),
                },
                {
                  key: 'valor',
                  header: 'Valor',
                  render: (item: Parcela) => <span className="font-semibold">{currency(item.valor)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: Parcela) => statusBadge(item.status),
                },
                {
                  key: 'actions',
                  header: 'Ações',
                  align: 'right',
                  render: (item: Parcela) => (
                    <Actions
                      onView={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                      onEdit={can('parcelas.update') ? () => openForm(item) : undefined}
                      onDelete={can('parcelas.delete') ? () => {
                        setSelected(item);
                        setDeleteOpen(true);
                      } : undefined}
                    />
                  ),
                },
              ]}
              data={parcelas.items.filter((item) =>
                `${item.numero} ${item.contrato?.numero ?? ''}`.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              isLoading={parcelas.loading}
              emptyMessage={<Empty icon={<Landmark />} message="Nenhuma parcela cadastrada." />}
            />
          </ListFrame>
        )}

        {tab === 'pagamentos' && (
          <ListFrame
            title="Recebimentos Registrados"
            subtitle="Histórico de pagamentos efetuados e baixados."
            createLabel="Registrar Pagamento"
            canCreate={can('pagamentos.create')}
            onCreate={() => openForm()}
            search={search}
            setSearch={setSearch}
            collection={config.collection}
          >
            <Table
              columns={[
                {
                  key: 'data',
                  header: 'Recebimento & Valor',
                  render: (item: Pagamento) => (
                    <button
                      className="text-left text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      onClick={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                    >
                      {currency(item.valor)}
                      <p className="font-normal text-slate-400">
                        {dateValue(item.dataPagamento) ? new Date(item.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </button>
                  ),
                },
                {
                  key: 'parcela',
                  header: 'Referência',
                  render: (item: Pagamento) => <span className="text-xs text-slate-500">Parcela #{item.parcela?.numero ?? '-'}</span>,
                },
                {
                  key: 'forma',
                  header: 'Forma de Pagamento',
                  render: (item: Pagamento) => <Badge size="sm" variant="indigo">{item.formaPagamento}</Badge>,
                },
                {
                  key: 'actions',
                  header: 'Ações',
                  align: 'right',
                  render: (item: Pagamento) => (
                    <Actions
                      onView={() => {
                        setSelected(item);
                        setDrawerOpen(true);
                      }}
                      onEdit={can('pagamentos.update') ? () => openForm(item) : undefined}
                      onDelete={can('pagamentos.delete') ? () => {
                        setSelected(item);
                        setDeleteOpen(true);
                      } : undefined}
                    />
                  ),
                },
              ]}
              data={pagamentos.items.filter((item) =>
                `${item.formaPagamento} ${item.valor}`.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              isLoading={pagamentos.loading}
              emptyMessage={<Empty icon={<Landmark />} message="Nenhum pagamento registrado." />}
            />
          </ListFrame>
        )}
      </div>

      {/* Modal de Formulário Financeiro */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={`${selected ? 'Editar' : 'Novo'} ${config.label}`}
        size="lg"
        footer={<FormFooter formId="financeiro-form" saving={saving} onCancel={() => setFormOpen(false)} />}
      >
        <FinanceForm tab={tab} form={form} setForm={setForm} errors={errors} references={references} selected={!!selected} onSubmit={save} />
      </Modal>

      {/* Drawer Detalhado */}
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={config.label}
        values={
          selected
            ? Object.entries(selected)
                .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
                .map(([key, value]) => [key, String(value)])
            : []
        }
      />

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        saving={saving}
        item={tab === 'pagamentos' ? 'o recebimento? O cancelamento restaurará o saldo da parcela' : `o ${config.label.toLowerCase()}`}
      />
    </>
  );
};

const FinanceForm = ({
  tab,
  form,
  setForm,
  errors,
  references,
  selected,
  onSubmit,
}: {
  tab: string;
  form: Record<string, string>;
  setForm: (value: Record<string, string>) => void;
  errors: Record<string, string>;
  references: ReferenceData;
  selected: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) => (
  <form id="financeiro-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
    {tab === 'contratos' && (
      <>
        <Select
          label="Cliente"
          value={form.cliente_id}
          onChange={(event) => setForm({ ...form, cliente_id: event.target.value })}
          options={[{ value: '', label: 'Selecione o Cliente' }, ...references.clientes.map((item) => ({ value: item.id, label: clientName(item) }))]}
          error={errors.cliente_id}
          required
        />
        <Select
          label="Processo Vinculado"
          value={form.processo_id}
          onChange={(event) => setForm({ ...form, processo_id: event.target.value })}
          options={[{ value: '', label: 'Não vincular (Contrato Avulso)' }, ...references.processos.map((item) => ({ value: item.id, label: item.numeroProcesso }))]}
        />
        <Input label="Número do Contrato" value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} error={errors.numero} placeholder="Ex: CT-2026/001" required />
        <Input label="Valor Total dos Honorários (R$)" type="number" step="0.01" value={form.valor_total} onChange={(event) => setForm({ ...form, valor_total: event.target.value })} error={errors.valor_total} required />
        <Input label="Data de Início" type="date" value={form.data_inicio} onChange={(event) => setForm({ ...form, data_inicio: event.target.value })} error={errors.data_inicio} required />
        <Input label="Data de Término / Validade" type="date" value={form.data_fim} onChange={(event) => setForm({ ...form, data_fim: event.target.value })} error={errors.data_fim} />
        <Select
          label="Forma de Pagamento"
          value={form.forma_pagamento}
          onChange={(event) => setForm({ ...form, forma_pagamento: event.target.value })}
          options={[
            { value: 'Pix', label: 'Pix' },
            { value: 'Boleto Bancário', label: 'Boleto Bancário' },
            { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
            { value: 'Transferência / TED', label: 'Transferência / TED' },
            { value: 'Dinheiro', label: 'Dinheiro' },
          ]}
          error={errors.forma_pagamento}
          required
        />
        <Select
          label="Status do Contrato"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
          options={[
            { value: 'ativo', label: 'Ativo' },
            { value: 'encerrado', label: 'Encerrado' },
            { value: 'rescindido', label: 'Rescindido' },
          ]}
        />
        <TextArea label="Objeto do Contrato" value={form.descricao} onChange={(value) => setForm({ ...form, descricao: value })} />
        <TextArea label="Cláusulas e Observações" value={form.observacoes} onChange={(value) => setForm({ ...form, observacoes: value })} />
      </>
    )}

    {tab === 'parcelas' && (
      <>
        <Select
          label="Contrato de Honorários"
          value={form.contrato_id ?? ''}
          onChange={(event) => setForm({ ...form, contrato_id: event.target.value })}
          options={[{ value: '', label: 'Selecione o Contrato' }, ...references.contratos.map((item) => ({ value: item.id, label: `${item.numero} - ${clientName(item.cliente)}` }))]}
          error={errors.contrato_id}
          required
          disabled={selected}
        />
        <Input label="Número da Parcela" type="number" value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} error={errors.numero} required />
        <Input label="Valor da Parcela (R$)" type="number" step="0.01" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} error={errors.valor} required />
        <Input label="Data de Vencimento" type="date" value={form.data_vencimento} onChange={(event) => setForm({ ...form, data_vencimento: event.target.value })} error={errors.data_vencimento} required />
        <Input label="Forma de Pagamento" value={form.forma_pagamento} onChange={(event) => setForm({ ...form, forma_pagamento: event.target.value })} placeholder="Pix, Boleto, etc." />
        <TextArea label="Descrição da Parcela" value={form.descricao} onChange={(value) => setForm({ ...form, descricao: value })} />
      </>
    )}

    {tab === 'pagamentos' && (
      <>
        <Select
          label="Parcela a Baixar"
          value={form.parcela_id ?? ''}
          onChange={(event) => setForm({ ...form, parcela_id: event.target.value })}
          options={[{ value: '', label: 'Selecione a Parcela' }, ...references.parcelas.map((item) => ({ value: item.id, label: `Parcela #${item.numero} - ${currency(item.valor)}` }))]}
          error={errors.parcela_id}
          required
          disabled={selected}
        />
        <Input label="Valor Recebido (R$)" type="number" step="0.01" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} error={errors.valor} required />
        <Input label="Data do Recebimento" type="date" value={form.data_pagamento} onChange={(event) => setForm({ ...form, data_pagamento: event.target.value })} error={errors.data_pagamento} required />
        <Select
          label="Meio de Recebimento"
          value={form.forma_pagamento}
          onChange={(event) => setForm({ ...form, forma_pagamento: event.target.value })}
          options={[
            { value: 'Pix', label: 'Pix' },
            { value: 'Boleto', label: 'Boleto Bancário' },
            { value: 'Transferência Bancária', label: 'Transferência Bancária' },
            { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
            { value: 'Dinheiro', label: 'Dinheiro' },
          ]}
          error={errors.forma_pagamento}
          required
        />
        <Input label="Comprovante / Código da Transação" value={form.comprovante} onChange={(event) => setForm({ ...form, comprovante: event.target.value })} error={errors.comprovante} />
        <TextArea label="Observações do Recebimento" value={form.observacoes} onChange={(value) => setForm({ ...form, observacoes: value })} />
      </>
    )}
  </form>
);
