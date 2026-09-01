import React, { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CircleHelp,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Advogado,
  Cliente,
  PaginatedResponse,
  Processo,
  ProcessoMovimentacao,
  ProcessoPrazo,
  StatusProcesso,
  User,
} from "../types";
import { Column, Pagination, Table } from "../components/design-system/Table";
import { Badge } from "../components/design-system/Badge";
import { Button } from "../components/design-system/Button";
import { Input, Select } from "../components/design-system/Input";
import { ConfirmationDialog } from "../components/design-system/ConfirmationDialog";
import { Drawer, Modal } from "../components/design-system/Modal";
import { Tabs } from "../components/design-system/Tabs";
import { Tooltip } from "../components/design-system/Dropdown";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ForbiddenShield } from "./ForbiddenView";
import {
  brlToDecimal,
  formatBrlDecimal,
  formatBrlInput,
  formatCnj,
} from "../utils/formatters";

type FormData = {
  cliente_id: string;
  status_id: string;
  numero_processo: string;
  titulo: string;
  descricao: string;
  tribunal: string;
  comarca: string;
  vara: string;
  tipo_acao: string;
  area_juridica: string;
  assunto: string;
  data_distribuicao: string;
  data_abertura: string;
  data_encerramento: string;
  valor_causa: string;
  valor_honorarios: string;
  observacoes: string;
  advogados: { id: string; tipo: string }[];
  responsaveis: { id: string; tipo: string }[];
};
const TRIBUNAIS = [
  "TJAC",
  "TJAL",
  "TJAM",
  "TJAP",
  "TJBA",
  "TJCE",
  "TJDFT",
  "TJES",
  "TJGO",
  "TJMA",
  "TJMG",
  "TJMS",
  "TJMT",
  "TJPA",
  "TJPB",
  "TJPE",
  "TJPI",
  "TJPR",
  "TJRJ",
  "TJRN",
  "TJRO",
  "TJRR",
  "TJRS",
  "TJSC",
  "TJSE",
  "TJSP",
  "TJTO",
  "TRF1",
  "TRF2",
  "TRF3",
  "TRF4",
  "TRF5",
  "TRF6",
  "TRT1",
  "TRT2",
  "TRT3",
  "TRT4",
  "TRT5",
  "TRT6",
  "TRT7",
  "TRT8",
  "TRT9",
  "TRT10",
  "TRT11",
  "TRT12",
  "TRT13",
  "TRT14",
  "TRT15",
  "TRT16",
  "TRT17",
  "TRT18",
  "TRT19",
  "TRT20",
  "TRT21",
  "TRT22",
  "TRT23",
  "TRT24",
  "STF",
  "STJ",
  "TST",
  "TSE",
  "STM",
];
const COMARCAS_POR_TRIBUNAL: Record<string, string[]> = {
  TJSP: ["São Paulo", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto"],
  TJRJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
  TJMG: ["Belo Horizonte", "Contagem", "Uberlândia", "Juiz de Fora"],
  TJPR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"],
};
const VARAS = [
  "1ª Vara Cível",
  "2ª Vara Cível",
  "1ª Vara de Família",
  "2ª Vara de Família",
  "Vara Criminal",
  "Juizado Especial Cível",
  "Vara do Trabalho",
];
const AREAS_JURIDICAS = [
  "Administrativo",
  "Ambiental",
  "Bancário",
  "Civil",
  "Consumidor",
  "Criminal",
  "Digital",
  "Empresarial",
  "Família e Sucessões",
  "Imobiliário",
  "Previdenciário",
  "Trabalhista",
  "Tributário",
];
const TIPOS_ACAO_POR_AREA: Record<string, string[]> = {
  Administrativo: [
    "Mandado de Segurança",
    "Ação Anulatória",
    "Processo Administrativo",
  ],
  Ambiental: [
    "Ação Civil Pública Ambiental",
    "Licenciamento Ambiental",
    "Defesa em Auto de Infração",
  ],
  Bancário: [
    "Revisional de Contrato",
    "Busca e Apreensão",
    "Execução de Título",
  ],
  Civil: ["Ação de Cobrança", "Indenização", "Obrigação de Fazer"],
  Consumidor: ["Dano Moral", "Cobrança Indevida", "Vício do Produto"],
  Criminal: ["Defesa Criminal", "Habeas Corpus", "Resposta à Acusação"],
  Digital: ["Remoção de Conteúdo", "Proteção de Dados", "Crime Cibernético"],
  Empresarial: [
    "Dissolução Societária",
    "Recuperação Judicial",
    "Execução Empresarial",
  ],
  "Família e Sucessões": ["Divórcio", "Guarda", "Inventário", "Alimentos"],
  Imobiliário: ["Usucapião", "Despejo", "Adjudicação Compulsória"],
  Previdenciário: [
    "Aposentadoria",
    "Auxílio por Incapacidade",
    "Pensão por Morte",
  ],
  Trabalhista: ["Reclamação Trabalhista", "Rescisão Indireta", "Horas Extras"],
  Tributário: ["Execução Fiscal", "Ação Declaratória", "Repetição de Indébito"],
};
const emptyForm = (): FormData => ({
  cliente_id: "",
  status_id: "",
  numero_processo: "",
  titulo: "",
  descricao: "",
  tribunal: "",
  comarca: "",
  vara: "",
  tipo_acao: "",
  area_juridica: "",
  assunto: "",
  data_distribuicao: "",
  data_abertura: "",
  data_encerramento: "",
  valor_causa: "",
  valor_honorarios: "",
  observacoes: "",
  advogados: [],
  responsaveis: [],
});
const errorMap = (errors: Record<string, string[]> = {}) =>
  Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, value[0]]),
  );

export const ProcessosView: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statuses, setStatuses] = useState<StatusProcesso[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [advogados, setAdvogados] = useState<Advogado[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Processo | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("resumo");
  const [distributionHelpVisible, setDistributionHelpVisible] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<ProcessoMovimentacao[]>(
    [],
  );
  const [prazos, setPrazos] = useState<ProcessoPrazo[]>([]);

  const loadProcessos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: String(page),
        perPage: String(perPage),
      });
      const response = await fetch(`/api/v1/processos?${params}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      const result = json as PaginatedResponse<Processo> & { success: boolean };
      setItems(
        statusFilter === "all"
          ? result.data
          : result.data.filter((item) => item.status?.id === statusFilter),
      );
      setLastPage(result.meta.lastPage);
      setTotal(result.meta.total);
    } catch {
      toast.error("Não foi possível carregar processos.", "Erro");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter, toast]);
  useEffect(() => {
    loadProcessos();
  }, [loadProcessos]);
  useEffect(() => {
    fetch("/api/v1/status-processos?perPage=100")
      .then((response) => response.json())
      .then((json) => setStatuses(json.data ?? []))
      .catch(() =>
        toast.error("Não foi possível carregar os status de processo.", "Erro"),
      );
  }, [toast]);
  const loadReferences = async () => {
    try {
      const [status, client, lawyer, user] = await Promise.all([
        fetch("/api/v1/status-processos?perPage=100"),
        fetch("/api/v1/clientes?perPage=100"),
        fetch("/api/v1/advogados?perPage=100"),
        fetch("/api/v1/users?perPage=100"),
      ]);
      const json = await Promise.all([
        status.json(),
        client.json(),
        lawyer.json(),
        user.json(),
      ]);
      setStatuses(json[0].data ?? []);
      setClientes(json[1].data ?? []);
      setAdvogados(json[2].data ?? []);
      setUsers(json[3].data ?? []);
    } catch {
      toast.error("Não foi possível carregar opções do formulário.", "Erro");
    }
  };
  const loadDetail = async (processo: Processo) => {
    try {
      const [detail, mov, prazo] = await Promise.all([
        fetch(`/api/v1/processos/${processo.id}`),
        fetch(`/api/v1/processos/${processo.id}/movimentacoes?perPage=5`),
        fetch(`/api/v1/processos/${processo.id}/prazos?perPage=5`),
      ]);
      const [detailJson, movJson, prazoJson] = await Promise.all([
        detail.json(),
        mov.json(),
        prazo.json(),
      ]);
      if (!detail.ok || !detailJson.success) throw new Error();
      setSelected(detailJson.data);
      setMovimentacoes(movJson.data ?? []);
      setPrazos(prazoJson.data ?? []);
      setTab("resumo");
      setDrawerOpen(true);
    } catch {
      toast.error("Não foi possível carregar os detalhes do processo.", "Erro");
    }
  };
  const openForm = async (processo?: Processo) => {
    await loadReferences();
    setSelected(processo ?? null);
    setErrors({});
    setForm(
      processo
        ? {
            cliente_id: processo.cliente?.id ?? "",
            status_id: processo.status?.id ?? "",
            numero_processo: formatCnj(processo.numeroProcesso),
            titulo: processo.titulo,
            descricao: processo.descricao ?? "",
            tribunal: processo.tribunal ?? "",
            comarca: processo.comarca ?? "",
            vara: processo.vara ?? "",
            tipo_acao: processo.tipoAcao ?? "",
            area_juridica: processo.areaJuridica ?? "",
            assunto: processo.assunto ?? "",
            data_distribuicao: processo.dataDistribuicao ?? "",
            data_abertura: processo.dataAbertura ?? "",
            data_encerramento: processo.dataEncerramento ?? "",
            valor_causa: formatBrlDecimal(processo.valorCausa),
            valor_honorarios: formatBrlDecimal(processo.valorHonorarios),
            observacoes: processo.observacoes ?? "",
            advogados: (processo.advogados ?? []).map(({ id, tipo }) => ({
              id,
              tipo: tipo ?? "apoio",
            })),
            responsaveis: (processo.responsaveis ?? []).map(({ id, tipo }) => ({
              id,
              tipo: tipo ?? "apoio",
            })),
          }
        : emptyForm(),
    );
    setFormOpen(true);
  };
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    const formatted =
      key === "numero_processo"
        ? formatCnj(String(value))
        : key === "valor_causa" || key === "valor_honorarios"
          ? formatBrlInput(String(value))
          : value;
    setForm((current) => {
      if (key === "tribunal")
        return {
          ...current,
          tribunal: formatted as string,
          comarca: "",
          vara: "",
        };
      if (key === "comarca")
        return { ...current, comarca: formatted as string, vara: "" };
      if (key === "area_juridica")
        return {
          ...current,
          area_juridica: formatted as string,
          tipo_acao: "",
        };
      return { ...current, [key]: formatted as FormData[K] };
    });
  };
  const toggleLink = (
    key: "advogados" | "responsaveis",
    id: string,
    defaultType: string,
  ) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].some((item) => item.id === id)
        ? current[key].filter((item) => item.id !== id)
        : [...current[key], { id, tipo: defaultType }],
    }));
  const setPrincipal = (
    key: "advogados" | "responsaveis",
    id: string,
    type: string,
  ) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item) => ({
        ...item,
        tipo:
          item.id === id
            ? type
            : item.tipo === "principal"
              ? key === "advogados"
                ? "apoio"
                : "operacional"
              : item.tipo,
      })),
    }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        valor_causa: brlToDecimal(form.valor_causa),
        valor_honorarios: brlToDecimal(form.valor_honorarios),
      };
      const response = await fetch(
        selected ? `/api/v1/processos/${selected.id}` : "/api/v1/processos",
        {
          method: selected ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(errorMap(json.errors));
        toast.error(json.message || "Não foi possível salvar o processo.");
        return;
      }
      toast.success(json.message || "Processo salvo com sucesso.");
      setFormOpen(false);
      loadProcessos();
    } catch {
      toast.error("Erro de conexão ao salvar processo.");
    } finally {
      setSubmitting(false);
    }
  };
  const remove = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/processos/${selected.id}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      toast.success(json.message || "Processo excluído com sucesso.");
      setDeleteOpen(false);
      setDrawerOpen(false);
      loadProcessos();
    } catch {
      toast.error("Não foi possível excluir o processo.");
    } finally {
      setSubmitting(false);
    }
  };
  const addNested = async (kind: "movimentacoes" | "prazos") => {
    if (!selected) return;
    const title = window.prompt(
      kind === "movimentacoes" ? "Título da movimentação" : "Título do prazo",
    );
    if (!title) return;
    const payload =
      kind === "movimentacoes"
        ? {
            titulo: title,
            tipo: "andamento",
            data_movimentacao: new Date().toISOString().slice(0, 10),
          }
        : {
            titulo: title,
            data_vencimento: new Date().toISOString().slice(0, 10),
            status: "pendente",
            prioridade: "media",
          };
    try {
      const response = await fetch(`/api/v1/processos/${selected.id}/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || "Registro adicionado com sucesso.");
      loadDetail(selected);
    } catch {
      toast.error("Não foi possível adicionar o registro.");
    }
  };
  if (!can("processos.view"))
    return (
      <ForbiddenShield
        requiredPermission="processos.view"
        message="Seu perfil não possui permissão para visualizar processos."
      />
    );
  const columns: Column<Processo>[] = [
    {
      key: "numeroProcesso",
      header: "Processo",
      render: (item) => (
        <div>
          <button
            onClick={() => loadDetail(item)}
            className="text-left text-xs font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100"
          >
            {item.numeroProcesso}
          </button>
          <p className="max-w-48 truncate text-[11px] text-slate-500">
            {item.titulo}
          </p>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (item) => (
        <span className="text-xs">
          {item.cliente?.nome || item.cliente?.razaoSocial || "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant="indigo" size="sm">
          {item.status?.nome || "Sem status"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      render: (item) => (
        <div className="flex justify-end gap-1">
          <button
            title="Visualizar processo"
            onClick={() => loadDetail(item)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {can("processos.edit") && (
            <button
              title="Editar processo"
              onClick={() => openForm(item)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {can("processos.delete") && (
            <button
              title="Excluir processo"
              onClick={() => {
                setSelected(item);
                setDeleteOpen(true);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];
  const linkControls = (
    key: "advogados" | "responsaveis",
    source: (Advogado | User)[],
    label: string,
    principalType: string,
  ) => (
    <div className="sm:col-span-2">
      <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </p>
      <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
        {source.map((person) => {
          const linked = form[key].find((item) => item.id === person.id);
          return (
            <label
              key={person.id}
              className="flex items-center justify-between gap-2 py-1 text-xs"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!linked}
                  onChange={() =>
                    toggleLink(
                      key,
                      person.id,
                      key === "advogados" ? "apoio" : "operacional",
                    )
                  }
                />
                {"nome" in person ? person.nome : person.name}
              </span>
              {linked && (
                <button
                  type="button"
                  onClick={() => setPrincipal(key, person.id, principalType)}
                  className={`text-[10px] ${linked.tipo === "principal" ? "font-semibold text-indigo-600" : "text-slate-400"}`}
                >
                  Principal
                </button>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
  const comarcas = form.tribunal
    ? (COMARCAS_POR_TRIBUNAL[form.tribunal] ?? ["Não listado"])
    : [];
  const varas = form.comarca
    ? form.comarca === "Não listado"
      ? ["Outra unidade judiciária"]
      : VARAS
    : [];
  const tiposAcao = form.area_juridica
    ? (TIPOS_ACAO_POR_AREA[form.area_juridica] ?? ["Outro"])
    : [];
  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Processos
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Acompanhe processos, movimentações e prazos.
          </p>
        </div>
        {can("processos.create") && (
          <Button
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => openForm()}
          >
            Novo Processo
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12">
        <div className="sm:col-span-8">
          <Input
            placeholder="Pesquisar por número CNJ ou título..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:col-span-4">
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Todos os status" },
              ...statuses.map((status) => ({
                value: status.id,
                label: status.nome,
              })),
            ]}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={items}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        emptyMessage={
          <div className="py-8 text-center text-xs text-slate-500">
            <BriefcaseBusiness className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Nenhum processo encontrado.
          </div>
        }
      />
      <Pagination
        currentPage={page}
        totalPages={lastPage}
        perPage={perPage}
        totalItems={total}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={selected ? "Editar Processo" : "Cadastrar Processo"}
        size="2xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                (
                  document.getElementById(
                    "processo-form",
                  ) as HTMLFormElement | null
                )?.requestSubmit()
              }
              isLoading={submitting}
            >
              {selected ? "Atualizar" : "Salvar Processo"}
            </Button>
          </>
        }
      >
        <form
          id="processo-form"
          onSubmit={submit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Input
            label="Número CNJ"
            value={form.numero_processo}
            onChange={(event) =>
              setField("numero_processo", event.target.value)
            }
            error={errors.numero_processo}
            required
          />
          <Input
            label="Título"
            value={form.titulo}
            onChange={(event) => setField("titulo", event.target.value)}
            error={errors.titulo}
            required
          />
          <Select
            label="Cliente"
            value={form.cliente_id}
            onChange={(event) => setField("cliente_id", event.target.value)}
            error={errors.cliente_id}
            options={[
              { value: "", label: "Selecione" },
              ...clientes.map((cliente) => ({
                value: cliente.id,
                label: cliente.nome || cliente.razaoSocial || "Sem nome",
              })),
            ]}
            required
          />
          <Select
            label="Status"
            value={form.status_id}
            onChange={(event) => setField("status_id", event.target.value)}
            error={errors.status_id}
            options={[
              { value: "", label: "Selecione" },
              ...statuses
                .filter((status) => status.ativo)
                .map((status) => ({ value: status.id, label: status.nome })),
            ]}
            required
          />
          <Select
            label="Tribunal"
            value={form.tribunal}
            onChange={(event) => setField("tribunal", event.target.value)}
            options={[
              { value: "", label: "Selecione o tribunal" },
              ...TRIBUNAIS.map((tribunal) => ({
                value: tribunal,
                label: tribunal,
              })),
            ]}
          />
          <Select
            label="Comarca"
            value={form.comarca}
            onChange={(event) => setField("comarca", event.target.value)}
            options={[
              { value: "", label: "Selecione a comarca" },
              ...comarcas.map((comarca) => ({ value: comarca, label: comarca })),
            ]}
            disabled={!form.tribunal}
          />
          <Select
            label="Vara"
            value={form.vara}
            onChange={(event) => setField("vara", event.target.value)}
            options={[
              { value: "", label: "Selecione a vara" },
              ...varas.map((vara) => ({ value: vara, label: vara })),
            ]}
            disabled={!form.comarca}
          />
          <Select
            label="Área jurídica"
            value={form.area_juridica}
            onChange={(event) => setField("area_juridica", event.target.value)}
            options={[
              { value: "", label: "Selecione a área jurídica" },
              ...AREAS_JURIDICAS.map((area) => ({ value: area, label: area })),
            ]}
          />
          <Select
            label="Tipo de ação"
            value={form.tipo_acao}
            onChange={(event) => setField("tipo_acao", event.target.value)}
            options={[
              { value: "", label: "Selecione o tipo de ação" },
              ...tiposAcao.map((tipo) => ({ value: tipo, label: tipo })),
            ]}
            disabled={!form.area_juridica}
          />
          <Input
            label="Assunto"
            value={form.assunto}
            onChange={(event) => setField("assunto", event.target.value)}
          />
          <div className="relative w-full space-y-1.5 text-left">
            <div className="flex items-center gap-1">
              <label
                htmlFor="data-distribuicao"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Data de distribuição
              </label>
              <Tooltip
                content="Data em que o processo foi protocolado e distribuído oficialmente ao tribunal."
                position="bottom"
              >
                <button
                  type="button"
                  aria-label="Ajuda sobre a data de distribuição"
                  title="Ajuda sobre a data de distribuição"
                  className="rounded-sm text-slate-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onFocus={() => setDistributionHelpVisible(true)}
                  onBlur={() => setDistributionHelpVisible(false)}
                >
                  <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </Tooltip>
            </div>
            {distributionHelpVisible && (
              <span
                role="tooltip"
                className="absolute left-0 top-5 z-50 max-w-64 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-md dark:bg-slate-800"
              >
                Data em que o processo foi protocolado e distribuído oficialmente ao tribunal.
              </span>
            )}
            <Input
              id="data-distribuicao"
              type="date"
              value={form.data_distribuicao}
              onChange={(event) =>
                setField("data_distribuicao", event.target.value)
              }
            />
          </div>
          <Input
            label="Data de abertura"
            type="date"
            value={form.data_abertura}
            onChange={(event) => setField("data_abertura", event.target.value)}
          />
          <Input
            label="Valor da causa"
            type="number"
            value={form.valor_causa}
            onChange={(event) => setField("valor_causa", event.target.value)}
          />
          <Input
            label="Honorários"
            type="number"
            value={form.valor_honorarios}
            onChange={(event) =>
              setField("valor_honorarios", event.target.value)
            }
          />
          {linkControls(
            "advogados",
            advogados,
            "Advogados vinculados",
            "principal",
          )}
          {linkControls(
            "responsaveis",
            users,
            "Responsáveis vinculados",
            "principal",
          )}
        </form>
      </Modal>
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Detalhes do Processo"
        description={selected?.numeroProcesso}
        width="xl"
      >
        <Tabs
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: "resumo", label: "Resumo" },
            { id: "movimentacoes", label: "Movimentações" },
            { id: "prazos", label: "Prazos" },
          ]}
        />
        {selected && (
          <div className="pt-4">
            {tab === "resumo" && (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-500">{selected.titulo}</p>
                  <Badge className="mt-2" variant="indigo" size="sm">
                    {selected.status?.nome || "Sem status"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    [
                      "Cliente",
                      selected.cliente?.nome ||
                        selected.cliente?.razaoSocial ||
                        "-",
                    ],
                    ["Tribunal", selected.tribunal || "-"],
                    [
                      "Advogados",
                      (selected.advogados ?? [])
                        .map((item) => item.nome)
                        .join(", ") || "-",
                    ],
                    [
                      "Responsáveis",
                      (selected.responsaveis ?? [])
                        .map((item) => item.nome)
                        .join(", ") || "-",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
                    >
                      <p className="text-[10px] text-slate-500">{label}</p>
                      <p className="mt-1 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "movimentacoes" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  {can("processos.movimentacoes.create") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNested("movimentacoes")}
                    >
                      Adicionar
                    </Button>
                  )}
                </div>
                {movimentacoes.length ? (
                  movimentacoes.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-slate-100 pb-3 text-xs dark:border-slate-800"
                    >
                      <p className="font-semibold">{item.titulo}</p>
                      <p className="text-slate-500">
                        {item.tipo} ·{" "}
                        {new Date(item.dataMovimentacao).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-500">
                    Nenhuma movimentação registrada.
                  </p>
                )}
              </div>
            )}
            {tab === "prazos" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  {can("processos.prazos.create") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNested("prazos")}
                    >
                      Adicionar
                    </Button>
                  )}
                </div>
                {prazos.length ? (
                  prazos.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between border-b border-slate-100 pb-3 text-xs dark:border-slate-800"
                    >
                      <div>
                        <p className="font-semibold">{item.titulo}</p>
                        <p className="text-slate-500">
                          {item.prioridade || "Média"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === "concluido" ? "success" : "warning"
                        }
                        size="sm"
                      >
                        {new Date(item.dataVencimento).toLocaleDateString(
                          "pt-BR",
                        )}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-500">
                    Nenhum prazo registrado.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        title="Excluir processo"
        message="Esta ação removerá o processo da listagem."
        confirmText="Excluir"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};
