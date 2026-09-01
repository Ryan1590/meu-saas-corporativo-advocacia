import React, { useCallback, useEffect, useState } from 'react';
import { Building2, CircleHelp, Edit2, Mail, MapPin, Phone, Save } from 'lucide-react';
import { Badge, Card } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { Input, Select } from '../components/design-system/Input';
import { Modal } from '../components/design-system/Modal';
import { Tooltip } from '../components/design-system/Dropdown';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';
import { formatCep, formatCnpj, formatPhoneBR } from '../utils/formatters';

interface Escritorio {
  id: string;
  nome: string;
  razaoSocial: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  status: 'active' | 'inactive';
}

type EscritorioForm = {
  nome: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: 'active' | 'inactive';
};

const toForm = (escritorio: Escritorio): EscritorioForm => ({
  nome: escritorio.nome,
  razao_social: escritorio.razaoSocial || '',
  cnpj: formatCnpj(escritorio.cnpj || ''),
  email: escritorio.email || '',
  telefone: formatPhoneBR(escritorio.telefone || ''),
  cep: formatCep(escritorio.cep || ''),
  logradouro: escritorio.logradouro || '',
  numero: escritorio.numero || '',
  complemento: escritorio.complemento || '',
  bairro: escritorio.bairro || '',
  cidade: escritorio.cidade || '',
  estado: escritorio.estado || '',
  status: escritorio.status,
});

export const EscritorioView: React.FC = () => {
  const { user, can } = useAuth();
  const { success, error: toastError } = useToast();
  const [escritorio, setEscritorio] = useState<Escritorio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EscritorioForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchEscritorio = useCallback(async () => {
    if (!user?.escritorioId) {
      setEscritorio(null);
      setLoadError('Seu usuário não possui um escritório vinculado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const response = await fetch(`/api/v1/escritorios/${user.escritorioId}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || 'Não foi possível carregar o escritório.');
      setEscritorio(json.data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Erro de comunicação ao carregar o escritório.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.escritorioId]);

  useEffect(() => {
    fetchEscritorio();
  }, [fetchEscritorio]);

  const openEdit = () => {
    if (!escritorio) return;
    setFormData(toForm(escritorio));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const setField = <K extends keyof EscritorioForm>(field: K, value: EscritorioForm[K]) => {
    const formatted = field === 'cnpj' ? formatCnpj(String(value)) : field === 'telefone' ? formatPhoneBR(String(value)) : field === 'cep' ? formatCep(String(value)) : value;
    setFormData((current) => (current ? { ...current, [field]: formatted as EscritorioForm[K] } : current));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!escritorio || !formData) return;

    setFormErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/escritorios/${escritorio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.errors) {
          setFormErrors(Object.fromEntries(Object.entries(json.errors).map(([field, messages]) => [field, (messages as string[])[0]])));
        }
        toastError(json.message || 'Não foi possível atualizar o escritório.');
        return;
      }
      setEscritorio(json.data);
      setIsModalOpen(false);
      success(json.message || 'Escritório atualizado com sucesso.');
    } catch {
      toastError('Erro de comunicação ao atualizar o escritório.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can('escritorios.view')) {
    return <ForbiddenShield requiredPermission="escritorios.view" message="Seu perfil não possui permissão para visualizar o escritório." />;
  }

  if (isLoading) {
    return <div className="flex min-h-64 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" /></div>;
  }

  if (loadError || !escritorio) {
    return <div className="space-y-4 text-left"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Escritório</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Dados cadastrais do escritório: identidade, contato e endereço. Clientes e processos são gerenciados em suas próprias áreas.</p></div><Card className="p-6 text-center"><p className="text-sm text-rose-600 dark:text-rose-400">{loadError || 'Escritório não encontrado.'}</p><Button variant="secondary" size="sm" className="mt-4" onClick={fetchEscritorio}>Tentar novamente</Button></Card></div>;
  }

  const address = [escritorio.logradouro, escritorio.numero, escritorio.complemento, escritorio.bairro, escritorio.cidade, escritorio.estado].filter(Boolean).join(', ');

  return <div className="space-y-5 text-left">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Escritório</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Dados cadastrais do escritório: identidade, contato e endereço. Clientes e processos são gerenciados em suas próprias áreas.</p></div>{can('escritorios.update') && <Button variant="primary" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={openEdit}>Editar escritório</Button>}</div>
    <Card className="overflow-hidden"><div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"><Building2 className="h-5 w-5" /></div><div><h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{escritorio.nome}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{escritorio.razaoSocial || 'Razão social não informada'}</p></div></div><Badge variant={escritorio.status === 'active' ? 'success' : 'neutral'} size="sm" dot>{escritorio.status === 'active' ? 'Ativo' : 'Inativo'}</Badge></div></div><div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3"><Info label="CNPJ" value={escritorio.cnpj} /><Info label="CEP" value={escritorio.cep} /><Info label="Endereço" value={address || null} icon={<MapPin className="h-4 w-4" />} /><Info label="E-mail" value={escritorio.email} icon={<Mail className="h-4 w-4" />} /><Info label="Telefone" value={escritorio.telefone} icon={<Phone className="h-4 w-4" />} /></div></Card>
    {formData && <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar escritório" description="Atualize os dados cadastrais do escritório." size="xl" footer={<><Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit" form="escritorio-form" isLoading={isSubmitting} leftIcon={<Save className="h-3.5 w-3.5" />}>Salvar alterações</Button></>}><form id="escritorio-form" onSubmit={handleSubmit} className="space-y-5"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Nome" value={formData.nome} onChange={(event) => setField('nome', event.target.value)} error={formErrors.nome} required /><Input label="Razão social" value={formData.razao_social} onChange={(event) => setField('razao_social', event.target.value)} error={formErrors.razao_social} /><Input label="CNPJ" value={formData.cnpj} onChange={(event) => setField('cnpj', event.target.value)} error={formErrors.cnpj} /><Input label="E-mail" type="email" value={formData.email} onChange={(event) => setField('email', event.target.value)} error={formErrors.email} /><Input label="Telefone" value={formData.telefone} onChange={(event) => setField('telefone', event.target.value)} error={formErrors.telefone} /><Input label="CEP" value={formData.cep} onChange={(event) => setField('cep', event.target.value)} error={formErrors.cep} /></div><div className="border-t border-slate-200 pt-5 dark:border-slate-800"><p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Endereço</p><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Logradouro" value={formData.logradouro} onChange={(event) => setField('logradouro', event.target.value)} error={formErrors.logradouro} /><Input label="Número" value={formData.numero} onChange={(event) => setField('numero', event.target.value)} error={formErrors.numero} /><Input label="Complemento" value={formData.complemento} onChange={(event) => setField('complemento', event.target.value)} error={formErrors.complemento} /><Input label="Bairro" value={formData.bairro} onChange={(event) => setField('bairro', event.target.value)} error={formErrors.bairro} /><Input label="Cidade" value={formData.cidade} onChange={(event) => setField('cidade', event.target.value)} error={formErrors.cidade} /><Input label="Estado" value={formData.estado} maxLength={2} onChange={(event) => setField('estado', event.target.value.toUpperCase())} error={formErrors.estado} /></div></div><Select label="Status" value={formData.status} onChange={(event) => setField('status', event.target.value as EscritorioForm['status'])} error={formErrors.status} options={[{ value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }]} /></form></Modal>}
  </div>;
};

const Info: React.FC<{ label: string; value: string | null; icon?: React.ReactNode }> = ({ label, value, icon }) => <div><dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><span>{label}</span>{label === 'Endereço' && <Tooltip content="Endereço institucional do escritório."><CircleHelp className="h-3.5 w-3.5" aria-hidden="true" /></Tooltip>}</dt><dd className="mt-1 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">{icon && <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>}<span>{value || 'Não informado'}</span></dd></div>;