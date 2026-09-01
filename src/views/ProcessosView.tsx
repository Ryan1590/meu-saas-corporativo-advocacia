import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock,
  DollarSign,
  Download,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Advogado,
  Cliente,
  Contrato,
  Documento,
  PaginatedResponse,
  Parcela,
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
import { DocumentFileInput } from "../components/design-system/DocumentFileInput";
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
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentCategory, setDocumentCategory] = useState("");

  // Estados de automação jurídica avançada
  const [isConsultingCnj, setIsConsultingCnj] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Documento | null>(null);
  const [docToDelete, setDocToDelete] = useState<Documento | null>(null);
  const [minutaModalData, setMinutaModalData] = useState<any | null>(null);
  const [reciboModalData, setReciboModalData] = useState<any | null>(null);
  const [quitarModalData, setQuitarModalData] = useState<{
    parcela: Parcela;
    dataPagamento: string;
    formaPagamento: string;
    valor: string;
    observacoes: string;
  } | null>(null);
  const [financeiroMetrics, setFinanceiroMetrics] = useState<{
    totalContratado: number;
    totalPago: number;
    totalPendente: number;
  } | null>(null);
  const [novoContratoOpen, setNovoContratoOpen] = useState(false);
  const [novoContratoForm, setNovoContratoForm] = useState({
    descricao: "Prestação de Serviços Jurídicos e Honorários",
    valorTotal: "",
    formaPagamento: "Boleto",
    numParcelas: 1,
    dataInicio: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

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
      const [detail, mov, prazo, docRes, contRes, finRes] = await Promise.all([
        fetch(`/api/v1/processos/${processo.id}`),
        fetch(`/api/v1/processos/${processo.id}/movimentacoes?perPage=50`),
        fetch(`/api/v1/processos/${processo.id}/prazos?perPage=50`),
        fetch(`/api/v1/processos/${processo.id}/documentos`),
        fetch(`/api/v1/processos/${processo.id}/contratos`),
        fetch(`/api/v1/processos/${processo.id}/financeiro`),
      ]);
      const [detailJson, movJson, prazoJson, docJson, contJson, finJson] = await Promise.all([
        detail.json(),
        mov.json(),
        prazo.json(),
        docRes.json(),
        contRes.json(),
        finRes.json(),
      ]);
      if (!detail.ok || !detailJson.success) throw new Error();
      setSelected(detailJson.data);
      setMovimentacoes(movJson.data ?? []);
      setPrazos(prazoJson.data ?? []);
      setDocumentos(docJson.data ?? []);
      setContratos(contJson.data ?? []);
      if (finJson.success && finJson.data) {
        setParcelas(finJson.data.parcelas ?? []);
        setFinanceiroMetrics({
          totalContratado: finJson.data.totalContratado ?? 0,
          totalPago: finJson.data.totalPago ?? 0,
          totalPendente: finJson.data.totalPendente ?? 0,
        });
      }
      setTab("resumo");
      setDrawerOpen(true);
    } catch {
      toast.error("Não foi possível carregar os detalhes do processo.", "Erro");
    }
  };

  const refreshProcessData = async (procId: string) => {
    try {
      const [docRes, contRes, finRes] = await Promise.all([
        fetch(`/api/v1/processos/${procId}/documentos`),
        fetch(`/api/v1/processos/${procId}/contratos`),
        fetch(`/api/v1/processos/${procId}/financeiro`),
      ]);
      const [docJson, contJson, finJson] = await Promise.all([
        docRes.json(),
        contRes.json(),
        finRes.json(),
      ]);
      if (docJson.success) setDocumentos(docJson.data ?? []);
      if (contJson.success) setContratos(contJson.data ?? []);
      if (finJson.success && finJson.data) {
        setParcelas(finJson.data.parcelas ?? []);
        setFinanceiroMetrics({
          totalContratado: finJson.data.totalContratado ?? 0,
          totalPago: finJson.data.totalPago ?? 0,
          totalPendente: finJson.data.totalPendente ?? 0,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!selected || !drawerOpen) return;
    refreshProcessData(selected.id);
  }, [drawerOpen, selected]);

  // Automação: Consulta inteligente de dados pelo CNJ
  const handleConsultarCnj = async () => {
    const cnjDigits = form.numero_processo.replace(/\D/g, "");
    if (cnjDigits.length !== 20) {
      toast.error(
        "Informe um número CNJ com 20 dígitos para consulta (ex: 0010987-12.2026.5.02.0045).",
        "CNJ Inválido",
      );
      return;
    }

    setIsConsultingCnj(true);
    try {
      const res = await fetch(`/api/v1/processos/consultar-cnj?cnj=${encodeURIComponent(cnjDigits)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Não foi possível localizar o processo no tribunal.", "Consulta CNJ");
        return;
      }

      const d = json.data;
      setForm((prev) => ({
        ...prev,
        numero_processo: formatCnj(d.numeroProcesso),
        tribunal: d.tribunal || prev.tribunal,
        comarca: d.comarca || prev.comarca,
        vara: d.vara || prev.vara,
        area_juridica: d.areaJuridica || prev.area_juridica,
        tipo_acao: d.tipoAcao || prev.tipo_acao,
        assunto: d.assunto || prev.assunto,
        titulo: prev.titulo && prev.titulo.trim().length > 0 ? prev.titulo : d.titulo,
        descricao: prev.descricao && prev.descricao.trim().length > 0 ? prev.descricao : d.descricao,
        data_distribuicao: d.dataDistribuicao || prev.data_distribuicao,
        data_abertura: d.dataAbertura || prev.data_abertura,
        valor_causa: d.valorCausa ? formatBrlDecimal(d.valorCausa) : prev.valor_causa,
      }));

      toast.success(
        json.message || `Dados do ${d.tribunal} importados com sucesso! Tribunal, Comarca, Vara e Ação preenchidos.`,
        "Sucesso",
      );
    } catch {
      toast.error("Falha ao comunicar com serviço de consulta CNJ.", "Erro");
    } finally {
      setIsConsultingCnj(false);
    }
  };

  const uploadDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !documentFile) return toast.error("Selecione um arquivo para envio.");

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("arquivo", documentFile);
      data.append("processo_id", selected.id);
      if (selected.cliente?.id) {
        data.append("cliente_id", selected.cliente.id);
      }
      if (documentName) data.append("nome", documentName);
      if (documentCategory) data.append("categoria", documentCategory);
      const response = await fetch("/api/v1/documentos", { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      toast.success(json.message || "Documento anexado com sucesso ao processo e ao cliente!");
      setDocumentFile(null);
      setDocumentName("");
      setDocumentCategory("");
      refreshProcessData(selected.id);
    } catch {
      toast.error("Não foi possível enviar o documento.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadDocument = async (doc: Documento) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/v1/documentos/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.nomeOriginal || doc.nome || "documento.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Download de "${doc.nome}" iniciado.`);
    } catch {
      toast.error("Não foi possível baixar o documento.");
    }
  };

  const confirmDeleteDoc = async () => {
    if (!docToDelete || !selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/documentos/${docToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      toast.success("Documento excluído com sucesso.");
      setDocToDelete(null);
      refreshProcessData(selected.id);
    } catch {
      toast.error("Não foi possível excluir o documento.");
    } finally {
      setSubmitting(false);
    }
  };

  const viewMinutaContrato = async (contratoId: string) => {
    try {
      const res = await fetch(`/api/v1/contratos/${contratoId}/minuta`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      setMinutaModalData(json.data);
    } catch {
      toast.error("Não foi possível carregar a minuta do contrato.");
    }
  };

  const viewReciboParcela = async (parcelaId: string) => {
    try {
      const res = await fetch(`/api/v1/parcelas/${parcelaId}/recibo`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      setReciboModalData(json.data);
    } catch {
      toast.error("Não foi possível emitir o recibo da parcela.");
    }
  };

  const openQuitarModal = (parcela: Parcela) => {
    setQuitarModalData({
      parcela,
      dataPagamento: new Date().toISOString().split("T")[0],
      formaPagamento: parcela.formaPagamento || "PIX",
      valor: String(parcela.valor),
      observacoes: "",
    });
  };

  const submitQuitarParcela = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quitarModalData || !selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/parcelas/${quitarModalData.parcela.id}/quitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataPagamento: quitarModalData.dataPagamento,
          formaPagamento: quitarModalData.formaPagamento,
          valor: Number(quitarModalData.valor),
          observacoes: quitarModalData.observacoes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      toast.success(json.message || "Parcela quitada com sucesso!");
      setQuitarModalData(null);
      refreshProcessData(selected.id);
    } catch {
      toast.error("Erro ao quitar parcela.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSalvarNovoContrato = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processoId: selected.id,
          clienteId: selected.cliente?.id,
          descricao: novoContratoForm.descricao,
          valorTotal: brlToDecimal(novoContratoForm.valorTotal),
          formaPagamento: novoContratoForm.formaPagamento,
          numParcelas: novoContratoForm.numParcelas,
          dataInicio: novoContratoForm.dataInicio,
          observacoes: novoContratoForm.observacoes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      toast.success(json.message || "Contrato e parcelas criados com sucesso!");
      setNovoContratoOpen(false);
      refreshProcessData(selected.id);
    } catch {
      toast.error("Não foi possível cadastrar o contrato de honorários.");
    } finally {
      setSubmitting(false);
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
          className="space-y-6"
        >
          <section className="border-b border-slate-200 pb-5 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Vínculo e identificação do processo
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      label="Número CNJ (20 dígitos)"
                      placeholder="0010987-12.2026.5.02.0045"
                      value={form.numero_processo}
                      onChange={(event) =>
                        setField("numero_processo", event.target.value)
                      }
                      error={errors.numero_processo}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleConsultarCnj}
                    isLoading={isConsultingCnj}
                    leftIcon={<Sparkles className="h-4 w-4 text-indigo-600" />}
                    className="mb-[1px] whitespace-nowrap"
                    title="Buscar dados no tribunal e autopreencher"
                  >
                    Consultar CNJ / Autopreencher
                  </Button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Informe os 20 dígitos do CNJ e clique em <strong>Consultar CNJ</strong> para identificar Tribunal, Comarca, Vara e sugestão de ação.
                </p>
              </div>

              <Input
                label="Título do processo"
                placeholder="Ex: Reclamatória Trabalhista - Horas Extras"
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
                  { value: "", label: "Selecione o cliente" },
                  ...clientes.map((cliente) => ({
                    value: cliente.id,
                    label: cliente.nome || cliente.razaoSocial || "Sem nome",
                  })),
                ]}
                required
              />
              {linkControls("advogados", advogados, "Advogados vinculados", "principal")}
              {linkControls("responsaveis", users, "Responsáveis vinculados", "principal")}
            </div>
          </section>
          <section className="border-b border-slate-200 pb-5 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Identificação judicial
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </section>
          <section className="border-b border-slate-200 pb-5 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Classificação
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Datas e valores
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </section>
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
            { id: "documentos", label: "Documentos" },
            { id: "contratos", label: "Contratos" },
            { id: "financeiro", label: "Financeiro" },
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
            {tab === "documentos" && (
              <div className="space-y-4">
                {can("documentos.create") && (
                  <form onSubmit={uploadDocument} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Anexar Documento ao Processo e Cliente</p>
                    <DocumentFileInput value={documentFile} onChange={setDocumentFile} disabled={submitting} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Nome de Identificação"
                        placeholder="Ex: Petição Inicial, Procuração, etc."
                        value={documentName}
                        onChange={(event) => setDocumentName(event.target.value)}
                      />
                      <Select
                        label="Categoria do Documento"
                        value={documentCategory}
                        onChange={(event) => setDocumentCategory(event.target.value)}
                        options={[
                          { value: "", label: "Selecione uma categoria" },
                          { value: "Petições", label: "Petições" },
                          { value: "Procurações", label: "Procurações" },
                          { value: "Contratos", label: "Contratos" },
                          { value: "Provas e Documentos Pessoais", label: "Provas e Documentos Pessoais" },
                          { value: "Decisões e Sentenças", label: "Decisões e Sentenças" },
                          { value: "Comprovantes de Pagamento", label: "Comprovantes de Pagamento" },
                          { value: "Outros", label: "Outros" },
                        ]}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" isLoading={submitting} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Enviar e Vincular
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Documentos Anexados ({documentos.length})
                    </p>
                  </div>

                  {documentos.length ? (
                    documentos.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.nome}</p>
                            <p className="text-[11px] text-slate-500">
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.categoria || "Geral"}</span>
                              {" · "}{item.nomeOriginal || "arquivo.pdf"}
                              {item.tamanhoFormatado ? ` (${item.tamanhoFormatado})` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewDoc(item)}
                            title="Visualizar documento"
                            leftIcon={<Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
                          >
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadDocument(item)}
                            title="Baixar arquivo"
                            leftIcon={<Download className="h-3.5 w-3.5 text-indigo-600" />}
                          >
                            Baixar
                          </Button>
                          {can("documentos.delete") && (
                            <button
                              type="button"
                              onClick={() => setDocToDelete(item)}
                              title="Excluir documento"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
                      <FileText className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
                      Nenhum documento anexado a este processo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "contratos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Contratos de Prestação de Serviços & Honorários
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Contratos formalizados com o cliente vinculados a este processo.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setNovoContratoForm({
                        descricao: `Honorários Advocatícios - Processo ${selected.numeroProcesso}`,
                        valorTotal: selected.valorHonorarios ? formatBrlDecimal(Number(selected.valorHonorarios)) : "R$ 5.000,00",
                        formaPagamento: "Boleto Bancário",
                        numParcelas: 3,
                        dataInicio: new Date().toISOString().split("T")[0],
                        observacoes: "Contrato padrão com cláusula ad exitum e parcelamento mensal.",
                      });
                      setNovoContratoOpen(true);
                    }}
                  >
                    Novo Contrato
                  </Button>
                </div>

                {contratos.length ? (
                  <div className="space-y-3">
                    {contratos.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                              <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{item.numero}</span>
                                <Badge variant={item.status === "ativo" ? "success" : "neutral"} size="sm">
                                  {item.status || "Ativo"}
                                </Badge>
                              </div>
                              <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                                {item.descricao || "Prestação de Serviços Jurídicos"}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Forma: <strong className="text-slate-700 dark:text-slate-300">{item.formaPagamento || "Parcelado"}</strong>
                                {item.dataInicio ? ` · Início: ${new Date(item.dataInicio).toLocaleDateString("pt-BR")}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {formatBrlDecimal(item.valorTotal)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewMinutaContrato(item.id)}
                              leftIcon={<FileText className="h-3.5 w-3.5 text-indigo-600" />}
                            >
                              Visualizar Minuta
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
                    <FileCheck className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
                    Nenhum contrato formalizado para este processo.
                  </div>
                )}
              </div>
            )}

            {tab === "financeiro" && (
              <div className="space-y-5">
                {/* Resumo Financeiro / Indicadores Automáticos */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-[11px] font-medium text-slate-500">Total Contratado</p>
                    <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                      {formatBrlDecimal(
                        financeiroMetrics?.totalContratado ??
                          contratos.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Total Recebido (Quitado)</p>
                    <p className="mt-1 text-base font-bold text-emerald-700 dark:text-emerald-300">
                      {formatBrlDecimal(
                        financeiroMetrics?.totalPago ??
                          parcelas
                            .filter((p) => p.status === "pago")
                            .reduce((acc, p) => acc + Number(p.valor || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Saldo a Receber</p>
                    <p className="mt-1 text-base font-bold text-amber-700 dark:text-amber-300">
                      {formatBrlDecimal(
                        financeiroMetrics?.totalPendente ??
                          parcelas
                            .filter((p) => p.status !== "pago")
                            .reduce((acc, p) => acc + Number(p.valor || 0), 0)
                      )}
                    </p>
                  </div>
                </div>

                {/* Listagem de Parcelas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Parcelas e Honorários ({parcelas.length})
                    </p>
                    {parcelas.length === 0 && contratos.length > 0 && (
                      <span className="text-[11px] text-slate-500">
                        Clique em Novo Contrato para gerar automaticamente as parcelas.
                      </span>
                    )}
                  </div>

                  {parcelas.length ? (
                    <div className="space-y-2.5">
                      {parcelas.map((item) => {
                        const isPago = item.status === "pago";
                        const isAtrasado = item.status === "atrasado" || (!isPago && new Date(item.dataVencimento) < new Date());

                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-2 rounded-xl border p-3.5 text-xs transition-colors sm:flex-row sm:items-center sm:justify-between ${
                              isPago
                                ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10"
                                : isAtrasado
                                ? "border-rose-200 bg-rose-50/20 dark:border-rose-900/30 dark:bg-rose-950/10"
                                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 rounded-full p-1.5 ${
                                  isPago
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                    : isAtrasado
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                }`}
                              >
                                {isPago ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : isAtrasado ? (
                                  <AlertCircle className="h-4 w-4" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-slate-100">
                                    Parcela {String(item.numero).padStart(2, "0")}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {item.contrato?.numero || "Contrato"}
                                  </span>
                                  <Badge
                                    variant={isPago ? "success" : isAtrasado ? "danger" : "warning"}
                                    size="sm"
                                  >
                                    {isPago ? "Quitado" : isAtrasado ? "Atrasado" : "Em Aberto"}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500">
                                  Vencimento: <strong className="text-slate-700 dark:text-slate-300">{new Date(item.dataVencimento).toLocaleDateString("pt-BR")}</strong>
                                  {isPago && item.dataPagamento ? (
                                    <>
                                      {" · "}Pago em: <strong className="text-emerald-700 dark:text-emerald-400">{new Date(item.dataPagamento).toLocaleDateString("pt-BR")}</strong>
                                      {item.formaPagamento ? ` (${item.formaPagamento})` : ""}
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {formatBrlDecimal(item.valor)}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {isPago ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewReciboParcela(item.id)}
                                    leftIcon={<Receipt className="h-3.5 w-3.5 text-emerald-600" />}
                                  >
                                    Recibo
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => openQuitarModal(item)}
                                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                  >
                                    Dar Baixa
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
                      <DollarSign className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
                      Nenhuma parcela de honorários gerada para este processo.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal: Preview do Documento */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.nome || "Visualização do Documento"}
        size="2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-slate-500">
              {previewDoc?.categoria || "Documento Jurídico"} · {previewDoc?.tamanhoFormatado || ""}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPreviewDoc(null)}>
                Fechar
              </Button>
              {previewDoc && (
                <Button
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => downloadDocument(previewDoc)}
                >
                  Baixar Documento
                </Button>
              )}
            </div>
          </div>
        }
      >
        {previewDoc && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{previewDoc.nome}</h4>
                  <p className="text-slate-500">
                    Arquivo: {previewDoc.nomeOriginal || "documento.pdf"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Enviado em {previewDoc.createdAt ? new Date(previewDoc.createdAt).toLocaleDateString("pt-BR") : "Data de cadastro"} · Tipo MIME: {previewDoc.mimeType || "application/pdf"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileCheck className="mb-2 h-10 w-10 text-emerald-600" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Documento armazenado com integridade no repositório seguro
              </p>
              <p className="mt-1 max-w-md text-[11px] text-slate-500">
                O arquivo está devidamente indexado ao processo judicial nº <strong>{selected?.numeroProcesso}</strong> e ao prontuário do cliente.
              </p>
              <Button
                size="sm"
                className="mt-4"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => downloadDocument(previewDoc)}
              >
                Fazer Download Completo
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Minuta de Contrato Formatada */}
      <Modal
        isOpen={!!minutaModalData}
        onClose={() => setMinutaModalData(null)}
        title="Minuta do Contrato de Honorários"
        size="2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-slate-500">Contrato Formal Jurídico</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setMinutaModalData(null)}>
                Fechar
              </Button>
              <Button
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Imprimir / Salvar PDF
              </Button>
            </div>
          </div>
        }
      >
        {minutaModalData && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-800 shadow-inner dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <div className="border-b border-slate-200 pb-4 text-center dark:border-slate-800">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
              <h3 className="text-base font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                Contrato de Prestação de Serviços Advocatícios
              </h3>
              <p className="text-[11px] font-semibold text-slate-500">
                Instrumento Particular nº {minutaModalData.contrato?.numero}
              </p>
            </div>

            <div className="space-y-3 leading-relaxed">
              <p>
                <strong>CONTRATANTE:</strong> {minutaModalData.cliente?.nome || minutaModalData.cliente?.razaoSocial || "Cliente"}, inscrito(a) no CPF/CNPJ sob o nº {minutaModalData.cliente?.cpf || minutaModalData.cliente?.cnpj || "—"}.
              </p>
              <p>
                <strong>CONTRATADO:</strong> Sociedade de Advogados e Corpo Jurídico devidamente inscritos na Ordem dos Advogados do Brasil.
              </p>
              <p>
                <strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> O presente instrumento tem como objeto a prestação de serviços jurídicos contenciosos/consultivos no âmbito do Processo Judicial nº <strong>{minutaModalData.processo?.numeroProcesso}</strong> ({minutaModalData.processo?.titulo}).
              </p>
              <p>
                <strong>CLÁUSULA SEGUNDA - DOS HONORÁRIOS:</strong> Pelos serviços ora contratados, o CONTRATANTE pagará ao CONTRATADO a quantia total líquida de <strong>{formatBrlDecimal(minutaModalData.contrato?.valorTotal)}</strong>, na modalidade de <strong>{minutaModalData.contrato?.formaPagamento}</strong>.
              </p>
              <p>
                <strong>CLÁUSULA TERCEIRA - DO FORO:</strong> As partes elegem a Comarca local para dirimir eventuais controvérsias oriundas deste contrato.
              </p>
            </div>

            <div className="mt-8 flex justify-between pt-6 text-center">
              <div className="w-48 border-t border-slate-400 pt-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">CONTRATANTE</p>
                <p className="text-[10px] text-slate-500">{minutaModalData.cliente?.nome || "Cliente"}</p>
              </div>
              <div className="w-48 border-t border-slate-400 pt-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">ADVOGADO RESPONSÁVEL</p>
                <p className="text-[10px] text-slate-500">OAB/SP</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Recibo de Pagamento */}
      <Modal
        isOpen={!!reciboModalData}
        onClose={() => setReciboModalData(null)}
        title="Recibo de Quitação de Honorários"
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-slate-500">Comprovante de Quitação</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setReciboModalData(null)}>
                Fechar
              </Button>
              <Button
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Imprimir Recibo
              </Button>
            </div>
          </div>
        }
      >
        {reciboModalData && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <Receipt className="h-5 w-5" />
                <span className="font-bold uppercase tracking-wide">Recibo de Pagamento</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">{reciboModalData.numeroRecibo}</span>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Valor Quitado</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {formatBrlDecimal(reciboModalData.valor)}
              </p>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              Recebemos de <strong>{reciboModalData.cliente}</strong> a importância acima referenciada referente à <strong>Parcela {reciboModalData.parcelaNumero}</strong> do Contrato <strong>{reciboModalData.contratoNumero}</strong>, referente ao Processo Judicial nº <strong>{reciboModalData.processoNumero}</strong>, quitada via <strong>{reciboModalData.formaPagamento}</strong> em <strong>{new Date(reciboModalData.dataPagamento).toLocaleDateString("pt-BR")}</strong>.
            </p>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Departamento Financeiro Jurídico</p>
              <p className="text-[10px] text-slate-500">Quitação irrevogável da referida parcela.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Quitar Parcela */}
      <Modal
        isOpen={!!quitarModalData}
        onClose={() => setQuitarModalData(null)}
        title="Confirmar Baixa / Quitação de Parcela"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuitarModalData(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                (document.getElementById("quitar-form") as HTMLFormElement | null)?.requestSubmit()
              }
              isLoading={submitting}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Confirmar Quitação
            </Button>
          </>
        }
      >
        {quitarModalData && (
          <form id="quitar-form" onSubmit={submitQuitarParcela} className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
              <p className="text-slate-500">Parcela Selecionada:</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                Parcela {String(quitarModalData.parcela.numero).padStart(2, "0")} · Vencimento: {new Date(quitarModalData.parcela.dataVencimento).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <Input
              label="Data do Pagamento"
              type="date"
              value={quitarModalData.dataPagamento}
              onChange={(e) => setQuitarModalData({ ...quitarModalData, dataPagamento: e.target.value })}
              required
            />

            <Select
              label="Forma de Pagamento"
              value={quitarModalData.formaPagamento}
              onChange={(e) => setQuitarModalData({ ...quitarModalData, formaPagamento: e.target.value })}
              options={[
                { value: "PIX", label: "PIX" },
                { value: "Boleto Bancário", label: "Boleto Bancário" },
                { value: "Transferência Bancária (TED/DOC)", label: "Transferência Bancária (TED/DOC)" },
                { value: "Cartão de Crédito", label: "Cartão de Crédito" },
                { value: "Dinheiro / Espécie", label: "Dinheiro / Espécie" },
                { value: "Depósito em Conta", label: "Depósito em Conta" },
              ]}
              required
            />

            <Input
              label="Valor Efetivamente Pago (R$)"
              type="number"
              value={quitarModalData.valor}
              onChange={(e) => setQuitarModalData({ ...quitarModalData, valor: e.target.value })}
              required
            />

            <Input
              label="Observações / Comprovante"
              placeholder="Ex: Comprovante autenticado no banco"
              value={quitarModalData.observacoes}
              onChange={(e) => setQuitarModalData({ ...quitarModalData, observacoes: e.target.value })}
            />
          </form>
        )}
      </Modal>

      {/* Modal: Novo Contrato de Honorários */}
      <Modal
        isOpen={novoContratoOpen}
        onClose={() => setNovoContratoOpen(false)}
        title="Cadastrar Contrato de Honorários"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNovoContratoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                (document.getElementById("novo-contrato-form") as HTMLFormElement | null)?.requestSubmit()
              }
              isLoading={submitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Gerar Contrato & Parcelas
            </Button>
          </>
        }
      >
        <form id="novo-contrato-form" onSubmit={handleSalvarNovoContrato} className="space-y-4">
          <Input
            label="Descrição do Contrato"
            value={novoContratoForm.descricao}
            onChange={(e) => setNovoContratoForm({ ...novoContratoForm, descricao: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Valor Total dos Honorários"
              placeholder="R$ 10.000,00"
              value={novoContratoForm.valorTotal}
              onChange={(e) => setNovoContratoForm({ ...novoContratoForm, valorTotal: formatBrlInput(e.target.value) })}
              required
            />

            <Select
              label="Forma de Pagamento"
              value={novoContratoForm.formaPagamento}
              onChange={(e) => setNovoContratoForm({ ...novoContratoForm, formaPagamento: e.target.value })}
              options={[
                { value: "Boleto Bancário", label: "Boleto Bancário" },
                { value: "PIX", label: "PIX" },
                { value: "Transferência Bancária", label: "Transferência Bancária" },
                { value: "Cartão de Crédito", label: "Cartão de Crédito" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Condição de Parcelamento"
              value={String(novoContratoForm.numParcelas)}
              onChange={(e) => setNovoContratoForm({ ...novoContratoForm, numParcelas: Number(e.target.value) })}
              options={[
                { value: "1", label: "1x (À Vista)" },
                { value: "2", label: "2 Parcelas Mensais" },
                { value: "3", label: "3 Parcelas Mensais" },
                { value: "4", label: "4 Parcelas Mensais" },
                { value: "5", label: "5 Parcelas Mensais" },
                { value: "6", label: "6 Parcelas Mensais" },
                { value: "10", label: "10 Parcelas Mensais" },
                { value: "12", label: "12 Parcelas Mensais" },
              ]}
            />

            <Input
              label="Data de Início / 1ª Parcela"
              type="date"
              value={novoContratoForm.dataInicio}
              onChange={(e) => setNovoContratoForm({ ...novoContratoForm, dataInicio: e.target.value })}
              required
            />
          </div>

          <Input
            label="Observações do Contrato"
            placeholder="Ex: Cláusula de sucesso 20% ao final"
            value={novoContratoForm.observacoes}
            onChange={(e) => setNovoContratoForm({ ...novoContratoForm, observacoes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Confirmation: Excluir Documento */}
      <ConfirmationDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={confirmDeleteDoc}
        title="Excluir Documento"
        message={`Deseja realmente remover o documento "${docToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
        isLoading={submitting}
      />

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
