import React, { useCallback, useEffect, useState } from 'react';
import { 
  BriefcaseBusiness, 
  Edit2, 
  Eye, 
  Plus, 
  Search, 
  Trash2, 
  UserCheck, 
  Phone, 
  Mail, 
  Award, 
  Scale, 
  Clock, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Advogado, PaginatedResponse, Processo } from '../types';
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
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  celular: '',
  oab_numero: '',
  oab_uf: '',
  especialidade: '',
  status: 'active',
  observacoes: '',
});

const oabUfOptions = [
  { value: '', label: 'Selecione a UF', disabled: true },
  ...['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => ({ value: uf, label: uf })),
];

const specialtyOptions = [
  { value: '', label: 'Todas as Especialidades' },
  ...['Administrativo', 'Ambiental', 'Bancário', 'Civil', 'Consumidor', 'Criminal', 'Digital', 'Empresarial', 'Família e Sucessões', 'Imobiliário', 'Previdenciário', 'Trabalhista', 'Tributário'].map((especialidade) => ({ value: especialidade, label: especialidade })),
];

export const AdvogadosView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();
  
  const [advogados, setAdvogados] = useState<Advogado[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedAdvogado, setSelectedAdvogado] = useState<Advogado | null>(null);
  const [advogadoProcessos, setAdvogadoProcessos] = useState<Processo[]>([]);
  const [loadingProcessos, setLoadingProcessos] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdvogadoForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchAdvogados = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(currentPage),
        perPage: String(perPage),
      });
      const response = await fetch(`/api/v1/advogados?${params}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      const result = json as PaginatedResponse<Advogado> & { success: boolean };
      
      let data = result.data;
      if (specialtyFilter) {
        data = data.filter((a) => a.especialidade === specialtyFilter);
      }
      
      setAdvogados(data);
      setTotalPages(result.meta.lastPage);
      setTotalItems(result.meta.total);
    } catch {
      toastError('Erro ao buscar advogados do servidor.', 'Erro');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter, specialtyFilter, toastError]);

  useEffect(() => {
    fetchAdvogados();
  }, [fetchAdvogados]);

  // Carregar processos do advogado selecionado
  useEffect(() => {
    if (!selectedAdvogado || !isDrawerOpen) return;
    setLoadingProcessos(true);
    fetch('/api/v1/processos?perPage=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const vinculados = json.data.filter((p: Processo) => 
            p.advogados?.some((adv) => adv.id === selectedAdvogado.id)
          );
          setAdvogadoProcessos(vinculados);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProcessos(false));
  }, [selectedAdvogado, isDrawerOpen]);

  const setField = <K extends keyof AdvogadoForm>(field: K, value: AdvogadoForm[K]) => {
    const formatted =
      field === 'cpf'
        ? formatCpf(String(value))
        : field === 'telefone' || field === 'celular'
        ? formatPhoneBR(String(value))
        : field === 'oab_numero'
        ? formatOab(String(value))
        : value;
    setFormData((current) => ({ ...current, [field]: formatted as AdvogadoForm[K] }));
  };

  const openCreate = () => {
    setSelectedAdvogado(null);
    setFormData(emptyForm());
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (advogado: Advogado) => {
    setSelectedAdvogado(advogado);
    setFormData({
      nome: advogado.nome,
      cpf: formatCpf(advogado.cpf || ''),
      email: advogado.email || '',
      telefone: formatPhoneBR(advogado.telefone || ''),
      celular: formatPhoneBR(advogado.celular || ''),
      oab_numero: formatOab(advogado.oabNumero || ''),
      oab_uf: advogado.oabUf || '',
      especialidade: advogado.especialidade || '',
      status: advogado.status === 'inactive' ? 'inactive' : 'active',
      observacoes: advogado.observacoes || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        oab_numero: formData.oab_numero.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
      };
      const response = await fetch(
        selectedAdvogado ? `/api/v1/advogados/${selectedAdvogado.id}` : '/api/v1/advogados',
        {
          method: selectedAdvogado ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.errors) {
          setFormErrors(
            Object.fromEntries(
              Object.entries(json.errors).map(([field, messages]) => [field, (messages as string[])[0]])
            )
          );
        }
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
      if (!response.ok || !json.success) {
        toastError(json.message || 'Não foi possível excluir o advogado.');
        return;
      }
      success(json.message || 'Advogado excluído com sucesso.');
      setIsDeleteOpen(false);
      setIsDrawerOpen(false);
      fetchAdvogados();
    } catch {
      toastError('Erro de conexão ao excluir advogado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can('advogados.view')) {
    return (
      <ForbiddenShield
        requiredPermission="advogados.view"
        message="Seu perfil não possui permissão para visualizar advogados."
      />
    );
  }

  // Métricas rápidas
  const totalAtivos = advogados.filter((a) => a.status !== 'inactive').length;
  const especialidadesUnicas = new Set(advogados.map((a) => a.especialidade).filter(Boolean)).size;

  const columns: Column<Advogado>[] = [
    {
      key: 'nome',
      header: 'Advogado(a)',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold text-xs">
            {item.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <button
              onClick={() => {
                setSelectedAdvogado(item);
                setIsDrawerOpen(true);
              }}
              className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
            >
              {item.nome}
            </button>
            <p className="text-[11px] text-slate-400">
              OAB {item.oabNumero}/{item.oabUf}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'especialidade',
      header: 'Especialidade',
      render: (item) => (
        <Badge variant="indigo" size="sm">
          {item.especialidade || 'Geral'}
        </Badge>
      ),
    },
    {
      key: 'contato',
      header: 'Contato Direto',
      render: (item) => (
        <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
          {item.email && (
            <p className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{item.email}</span>
            </p>
          )}
          {(item.celular || item.telefone) && (
            <p className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{item.celular || item.telefone}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'inactive' ? 'neutral' : 'success'} size="sm" dot>
          {item.status === 'inactive' ? 'Inativo' : 'Ativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedAdvogado(item);
              setIsDrawerOpen(true);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            title="Visualizar ficha completa"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {can('advogados.update') && (
            <button
              onClick={() => openEdit(item)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50"
              title="Editar advogado"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {can('advogados.delete') && (
            <button
              onClick={() => {
                setSelectedAdvogado(item);
                setIsDeleteOpen(true);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
              title="Excluir advogado"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Header com Ação */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Corpo Jurídico & Advogados
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Gestão dos advogados, inscrições na OAB, especialidades e processos atribuídos.
          </p>
        </div>
        {can('advogados.create') && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
            Novo Advogado
          </Button>
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Cadastrado</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalItems || advogados.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Advogados Ativos</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalAtivos}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Especialidades Atendidas</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{especialidadesUnicas}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <Input
            placeholder="Pesquisar por nome ou OAB..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:col-span-3">
          <Select
            value={specialtyFilter}
            onChange={(event) => {
              setSpecialtyFilter(event.target.value);
              setCurrentPage(1);
            }}
            options={specialtyOptions}
          />
        </div>
        <div className="sm:col-span-3">
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'active', label: 'Ativos' },
              { value: 'inactive', label: 'Inativos' },
            ]}
          />
        </div>
      </div>

      {/* Tabela com paginação de 5 itens padrão */}
      <Table
        columns={columns}
        data={advogados}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage={
          <div className="space-y-2 py-8 text-center">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500">Nenhum advogado encontrado com os filtros atuais.</p>
          </div>
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setCurrentPage(1);
        }}
      />

      {/* Modal de Cadastro / Edição */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedAdvogado ? 'Editar Advogado' : 'Cadastrar Advogado(a)'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome completo"
              value={formData.nome}
              onChange={(event) => setField('nome', event.target.value)}
              error={formErrors.nome}
              required
            />
            <Input
              label="CPF"
              value={formData.cpf}
              onChange={(event) => setField('cpf', event.target.value)}
              error={formErrors.cpf}
            />
            <Input
              label="Número OAB"
              value={formData.oab_numero}
              onChange={(event) => setField('oab_numero', event.target.value)}
              error={formErrors.oab_numero}
              required
            />
            <Select
              label="UF da OAB"
              value={formData.oab_uf}
              onChange={(event) => setField('oab_uf', event.target.value)}
              options={oabUfOptions}
              error={formErrors.oab_uf}
              required
            />
            <Input
              label="E-mail profissional"
              type="email"
              value={formData.email}
              onChange={(event) => setField('email', event.target.value)}
              error={formErrors.email}
            />
            <Select
              label="Especialidade Principal"
              value={formData.especialidade}
              onChange={(event) => setField('especialidade', event.target.value)}
              options={specialtyOptions.filter((o) => o.value !== '')}
              error={formErrors.especialidade}
            />
            <Input
              label="Telefone Comercial"
              value={formData.telefone}
              onChange={(event) => setField('telefone', event.target.value)}
              error={formErrors.telefone}
            />
            <Input
              label="Celular / WhatsApp"
              value={formData.celular}
              onChange={(event) => setField('celular', event.target.value)}
              error={formErrors.celular}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="advogado-observacoes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Observações & Áreas de Atuação
            </label>
            <textarea
              id="advogado-observacoes"
              value={formData.observacoes}
              onChange={(event) => setField('observacoes', event.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Descreva particularidades, subespecialidades ou referências..."
            />
          </div>

          <Switch
            label="Advogado ativo no escritório"
            checked={formData.status === 'active'}
            onCheckedChange={(checked) => setField('status', checked ? 'active' : 'inactive')}
          />

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Salvar Advogado
            </Button>
          </div>
        </form>
      </Modal>

      {/* Drawer Detalhado do Advogado */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedAdvogado?.nome || 'Ficha do Advogado'}
        description={selectedAdvogado ? `Inscrição OAB ${selectedAdvogado.oabNumero}/${selectedAdvogado.oabUf}` : undefined}
      >
        {selectedAdvogado && (
          <div className="space-y-6 text-left text-xs">
            {/* Header com Ações Rápidas */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge variant={selectedAdvogado.status === 'inactive' ? 'neutral' : 'success'} size="sm" dot>
                  {selectedAdvogado.status === 'inactive' ? 'Inativo' : 'Ativo no Escritório'}
                </Badge>
                <Badge variant="indigo" size="sm">
                  {selectedAdvogado.especialidade || 'Direito Geral'}
                </Badge>
              </div>

              {/* Botões rápidos de contato */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {selectedAdvogado.celular && (
                  <a
                    href={`https://wa.me/55${selectedAdvogado.celular.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                )}
                {selectedAdvogado.email && (
                  <a
                    href={`mailto:${selectedAdvogado.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    E-mail
                  </a>
                )}
                {can('advogados.update') && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      openEdit(selectedAdvogado);
                    }}
                  >
                    Editar Cadastro
                  </Button>
                )}
              </div>
            </div>

            {/* Informações Cadastrais */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                Dados Cadastrais
              </h4>
              <dl className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex justify-between border-b border-slate-50 pb-1.5 dark:border-slate-800/50">
                  <dt className="text-slate-500">CPF</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{formatCpf(selectedAdvogado.cpf || '') || 'Não informado'}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5 dark:border-slate-800/50">
                  <dt className="text-slate-500">OAB</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{selectedAdvogado.oabNumero}/{selectedAdvogado.oabUf}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5 dark:border-slate-800/50">
                  <dt className="text-slate-500">Telefone Comercial</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{selectedAdvogado.telefone || 'Não informado'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Celular</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{selectedAdvogado.celular || 'Não informado'}</dd>
                </div>
              </dl>
            </div>

            {/* Processos Atribuídos ao Advogado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-indigo-500" />
                  Processos Atribuídos ({advogadoProcessos.length})
                </h4>
              </div>

              {loadingProcessos ? (
                <div className="py-4 text-center text-slate-400">Carregando processos...</div>
              ) : advogadoProcessos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-slate-400 italic dark:border-slate-800">
                  Nenhum processo diretamente vinculado a este advogado no momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {advogadoProcessos.map((proc) => (
                    <div
                      key={proc.id}
                      className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {proc.numeroProcesso || 'Processo'}
                        </span>
                        <Badge size="sm" variant={proc.status?.nome === 'Concluído' ? 'success' : 'indigo'}>
                          {proc.status?.nome || 'Em andamento'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {proc.titulo || proc.tipoAcao || 'Ação Judicial'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observações */}
            {selectedAdvogado.observacoes && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                  Observações
                </h4>
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {selectedAdvogado.observacoes}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Advogado"
        message={
          <>
            Deseja realmente excluir o cadastro de <strong>{selectedAdvogado?.nome}</strong>?
            <br />
            <span className="text-xs text-slate-500">
              Esta ação removerá o profissional das listagens ativas.
            </span>
          </>
        }
        confirmText="Excluir Advogado"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};
