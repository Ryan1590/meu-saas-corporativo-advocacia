import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  CircleHelp,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Cliente,
  ClienteStatus,
  ClienteTipoPessoa,
  Contrato,
  Documento,
  PaginatedResponse,
  Parcela,
  Processo,
} from "../types";
import { Column, Table, Pagination } from "../components/design-system/Table";
import { Button } from "../components/design-system/Button";
import { Input, Select, Switch } from "../components/design-system/Input";
import { Badge } from "../components/design-system/Badge";
import { ConfirmationDialog } from "../components/design-system/ConfirmationDialog";
import { Drawer, Modal } from "../components/design-system/Modal";
import { Tabs } from "../components/design-system/Tabs";
import { Tooltip } from "../components/design-system/Dropdown";
import { DocumentFileInput } from "../components/design-system/DocumentFileInput";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ForbiddenShield } from "./ForbiddenView";
import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhoneBR,
  formatRg,
} from "../utils/formatters";
import { AuthenticatedDocumentImage } from "../components/design-system/AuthenticatedDocumentImage";

type ClienteForm = {
  tipo_pessoa: ClienteTipoPessoa;
  nome: string;
  razao_social: string;
  nome_fantasia: string;
  cpf: string;
  cnpj: string;
  rg: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  celular: string;
  whatsapp: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
  status: ClienteStatus;
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

const DOCUMENT_CATEGORY_OPTIONS = [
  { value: "", label: "Selecione a categoria" },
  { value: "Identificação", label: "Identificação" },
  { value: "Contrato", label: "Contrato" },
  { value: "Procuração", label: "Procuração" },
  { value: "Processo", label: "Processo" },
  { value: "Financeiro", label: "Financeiro" },
  { value: "Cobrança", label: "Cobrança" },
  { value: "Comercial", label: "Comercial" },
  { value: "Outros", label: "Outros" },
];

const estadosBrasileiros = [
  { value: "", label: "Selecione a UF", disabled: true },
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
];

const emptyForm = (): ClienteForm => ({
  tipo_pessoa: "PF",
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  cpf: "",
  cnpj: "",
  rg: "",
  data_nascimento: "",
  email: "",
  telefone: "",
  celular: "",
  whatsapp: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
  status: "active",
});
const clientName = (cliente: Cliente) =>
  cliente.tipoPessoa === "PJ"
    ? cliente.razaoSocial || cliente.nomeFantasia || "Sem razão social"
    : cliente.nome || "Sem nome";
const documentLabel = (cliente: Cliente) =>
  cliente.tipoPessoa === "PJ" ? cliente.cnpj : cliente.cpf;

const ChildList = <T extends { id: string }>({
  loading,
  items,
  empty,
  render,
}: {
  loading: boolean;
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
}) =>
  loading ? (
    <p className="py-6 text-center text-xs text-slate-500">Carregando...</p>
  ) : items.length ? (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="border-b border-slate-100 pb-3 text-xs dark:border-slate-800"
        >
          {render(item)}
        </div>
      ))}
    </div>
  ) : (
    <p className="py-6 text-center text-xs text-slate-500">{empty}</p>
  );

export const ClientesView: React.FC<{
  detailClientId?: string | null;
  onNavigate?: (path: string) => void;
}> = ({ detailClientId, onNavigate }) => {
  const { can, token } = useAuth();
  const { success, error: toastError } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Documento | null>(
    null,
  );
  const [isDocumentDeleteOpen, setIsDocumentDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<ClienteForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [detailTab, setDetailTab] = useState("resumo");
  const [childItems, setChildItems] = useState<
    (Processo | Documento | Contrato | Parcela)[]
  >([]);
  const [documentFilterCategory, setDocumentFilterCategory] = useState("all");
  const [childLoading, setChildLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState("");
  const [previewDocument, setPreviewDocument] = useState<Documento | null>(
    null,
  );
  const [contractOpen, setContractOpen] = useState(false);
  const [contractProcesses, setContractProcesses] = useState<Processo[]>([]);
  const [contractForm, setContractForm] = useState({
    processo_id: "",
    numero: "",
    data_inicio: "",
    valor_total: "",
    forma_pagamento: "",
  });
  const requestedCepsRef = useRef(new Set<string>());

  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        tipoPessoa: tipoPessoaFilter,
        status: statusFilter,
        sortColumn,
        sortDirection,
        page: String(currentPage),
        perPage: String(perPage),
      });
      const response = await fetch(`/api/v1/clientes?${params}`);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message);
      const result = json as PaginatedResponse<Cliente> & { success: boolean };
      setClientes(result.data);
      setTotalPages(result.meta.lastPage);
      setTotalItems(result.meta.total);
    } catch {
      toastError("Erro ao buscar clientes do servidor.", "Erro");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    perPage,
    search,
    sortColumn,
    sortDirection,
    statusFilter,
    tipoPessoaFilter,
    toastError,
  ]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);
  useEffect(() => {
    if (
      !selectedCliente ||
      !(detailClientId || isDrawerOpen) ||
      !["processos", "documentos", "contratos", "financeiro"].includes(
        detailTab,
      )
    )
      return;
    setChildLoading(true);
    fetch(`/api/v1/clientes/${selectedCliente.id}/${detailTab}?perPage=20`)
      .then((response) => response.json())
      .then((json) => {
        if (!json.success) throw new Error();
        setChildItems(json.data ?? []);
      })
      .catch(() => toastError("Não foi possível carregar os dados vinculados."))
      .finally(() => setChildLoading(false));
  }, [detailClientId, detailTab, isDrawerOpen, selectedCliente, toastError]);

  useEffect(() => {
    if (!detailClientId) return;
    const existingClient = clientes.find(
      (cliente) => cliente.id === detailClientId,
    );
    if (existingClient) {
      setSelectedCliente(existingClient);
      return;
    }

    let isMounted = true;
    fetch(`/api/v1/clientes/${detailClientId}`)
      .then((response) => response.json())
      .then((json) => {
        if (!isMounted || !json.success) return;
        setSelectedCliente(json.data ?? null);
      })
      .catch(() => {
        if (isMounted)
          toastError("Não foi possível carregar a ficha do cliente.");
      });

    return () => {
      isMounted = false;
    };
  }, [clientes, detailClientId, toastError]);
  const uploadClientDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCliente || !documentFile)
      return toastError("Selecione um arquivo para envio.");
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("arquivo", documentFile);
      data.append("cliente_id", selectedCliente.id);
      data.append("categoria", documentCategory || "Cliente");
      const response = await fetch("/api/v1/documentos", {
        method: "POST",
        body: data,
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      success(json.message || "Documento enviado com sucesso.");
      setDocumentFile(null);
      setDocumentCategory("");
      setDetailTab("documentos");
    } catch {
      toastError("Não foi possível enviar o documento.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const saveContract = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCliente) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contractForm,
          cliente_id: selectedCliente.id,
          valor_total: contractForm.valor_total
            .replace(/[^\d,]/g, "")
            .replace(",", "."),
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error();
      success(json.message || "Contrato cadastrado com sucesso.");
      setContractOpen(false);
      setDetailTab("contratos");
    } catch {
      toastError("Não foi possível cadastrar o contrato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    setSelectedCliente(null);
    setFormData(emptyForm());
    setFormErrors({});
    setIsFormOpen(true);
  };

  const isImageDocument = (item: Documento) => {
    const mime = (item.mimeType || item.tipo || "").toLowerCase();
    return (
      mime.startsWith("image/") ||
      /(png|jpe?g|gif|webp|bmp|svg)/i.test(item.tipo || "")
    );
  };

  const exportClienteDocuments = () => {
    if (!selectedCliente) return;

    const payload = {
      cliente: {
        id: selectedCliente.id,
        nome: clientName(selectedCliente),
        tipoPessoa: selectedCliente.tipoPessoa,
        email: selectedCliente.email,
        documento: documentLabel(selectedCliente),
      },
      exportadoEm: new Date().toISOString(),
      documentos: (childItems as Documento[]).map((item) => ({
        id: item.id,
        nome: item.nome,
        nomeOriginal: item.nomeOriginal,
        categoria: item.categoria,
        tipo: item.tipo,
        mimeType: item.mimeType,
        tamanho: item.tamanho,
        downloadUrl: item.downloadUrl,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cliente-${selectedCliente.id}-documentos.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openClienteDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    if (onNavigate) {
      onNavigate(`/clientes/${cliente.id}`);
      return;
    }
    setIsDrawerOpen(true);
  };
  const openEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      tipo_pessoa: cliente.tipoPessoa,
      nome: cliente.nome || "",
      razao_social: cliente.razaoSocial || "",
      nome_fantasia: cliente.nomeFantasia || "",
      cpf: formatCpf(cliente.cpf || ""),
      cnpj: formatCnpj(cliente.cnpj || ""),
      rg: formatRg(cliente.rg || ""),
      data_nascimento: cliente.dataNascimento || "",
      email: cliente.email || "",
      telefone: formatPhoneBR(cliente.telefone || ""),
      celular: formatPhoneBR(cliente.celular || ""),
      whatsapp: formatPhoneBR(cliente.whatsapp || ""),
      cep: formatCep(cliente.cep || ""),
      logradouro: cliente.logradouro || "",
      numero: cliente.numero || "",
      complemento: cliente.complemento || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      observacoes: cliente.observacoes || "",
      status: cliente.status,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };
  const handleSort = (column: string) => {
    if (column === sortColumn)
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  const setField = <K extends keyof ClienteForm>(
    field: K,
    value: ClienteForm[K],
  ) => setFormData((current) => ({ ...current, [field]: value }));

  const lookupCep = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, "");

    if (cep.length !== 8 || requestedCepsRef.current.has(cep)) return;

    requestedCepsRef.current.add(cep);
    setIsCepLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const address = (await response.json()) as ViaCepResponse;

      if (!response.ok || address.erro) {
        toastError(
          "Não foi possível encontrar esse CEP. Confira os números e tente novamente.",
        );
        return;
      }

      setFormData((current) =>
        current.cep.replace(/\D/g, "") === cep
          ? {
              ...current,
              logradouro: address.logradouro ?? "",
              bairro: address.bairro ?? "",
              cidade: address.localidade ?? "",
              estado: address.uf ?? "",
            }
          : current,
      );
    } catch {
      toastError(
        "Não foi possível consultar o CEP agora. Tente novamente em instantes.",
      );
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch(
        selectedCliente
          ? `/api/v1/clientes/${selectedCliente.id}`
          : "/api/v1/clientes",
        {
          method: selectedCliente ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (json.errors)
          setFormErrors(
            Object.fromEntries(
              Object.entries(json.errors).map(([field, messages]) => [
                field,
                (messages as string[])[0],
              ]),
            ),
          );
        toastError(json.message || "Não foi possível salvar o cliente.");
        return;
      }
      success(json.message || "Cliente salvo com sucesso.");
      setIsFormOpen(false);
      fetchClientes();
    } catch {
      toastError("Erro de conexão ao salvar cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/clientes/${selectedCliente.id}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        toastError(json.message || "Não foi possível excluir o cliente.");
        return;
      }
      success(json.message || "Cliente excluído com sucesso.");
      setIsDeleteOpen(false);
      fetchClientes();
    } catch {
      toastError("Erro de conexão ao excluir cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadDocument = async (documento: Documento) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/v1/documentos/${documento.id}/download`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = documento.nomeOriginal || documento.nome || "documento";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      toastError("Não foi possível baixar o documento.");
    }
  };

  // função para baixar documentos
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsSubmitting(true);

    try {
      const currentToken = token || localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/v1/documentos/${documentToDelete.id}`,
        {
          method: "DELETE",
          headers: currentToken
            ? {
                Authorization: `Bearer ${currentToken}`,
                Accept: "application/json",
              }
            : {
                Accept: "application/json",
              },
        },
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.message || "Não foi possível excluir o documento.",
        );
      }

      success(json.message || "Documento excluído com sucesso.");

      // Remove o documento da lista imediatamente
      setChildItems((current) =>
        current.filter((item) => item.id !== documentToDelete.id),
      );

      // Se o documento estava aberto no preview, fecha
      if (previewDocument?.id === documentToDelete.id) {
        setPreviewDocument(null);
      }

      // Fecha confirmação
      setIsDocumentDeleteOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir documento:", error);

      toastError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o documento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can("clientes.view"))
    return (
      <ForbiddenShield
        requiredPermission="clientes.view"
        message="Seu perfil não possui permissão para visualizar clientes."
      />
    );

  if (detailClientId && selectedCliente) {
    const documentRows = (childItems as Documento[]).filter(
      (item) =>
        documentFilterCategory === "all" ||
        item.categoria === documentFilterCategory,
    );

    return (
      <div className="space-y-6 p-1 text-left">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCliente(null);
                if (onNavigate) onNavigate("/clientes");
              }}
            >
              Voltar para clientes
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              {selectedCliente.tipoPessoa === "PJ" ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {clientName(selectedCliente)}
              </h2>
              <p className="text-xs text-slate-500">
                {documentLabel(selectedCliente) || "Sem documento"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                selectedCliente.status === "active" ? "success" : "neutral"
              }
              size="sm"
              dot
            >
              {selectedCliente.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            {can("clientes.edit") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEdit(selectedCliente)}
              >
                Editar cliente
              </Button>
            )}
          </div>
        </div>

        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            { id: "resumo", label: "Resumo" },
            { id: "processos", label: "Processos" },
            { id: "documentos", label: "Documentos" },
            { id: "contratos", label: "Contratos" },
            { id: "financeiro", label: "Financeiro" },
          ]}
        />

        {detailTab === "resumo" && (
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
            {[
              ["E-mail", selectedCliente.email || "Não informado"],
              ["Celular", selectedCliente.celular || "Não informado"],
              ["Telefone", selectedCliente.telefone || "Não informado"],
              ["WhatsApp", selectedCliente.whatsapp || "Não informado"],
              [
                "Endereço",
                [
                  selectedCliente.logradouro,
                  selectedCliente.numero,
                  selectedCliente.bairro,
                  selectedCliente.cidade,
                  selectedCliente.estado,
                ]
                  .filter(Boolean)
                  .join(", ") || "Não informado",
              ],
              ["Observações", selectedCliente.observacoes || "Sem observações"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {detailTab === "processos" && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <ChildList
              loading={childLoading}
              items={childItems as Processo[]}
              empty="Nenhum processo vinculado."
              render={(item) => (
                <>
                  <p className="font-semibold">{item.numeroProcesso}</p>
                  <p className="text-slate-500">{item.titulo}</p>
                </>
              )}
            />
          </div>
        )}

        {detailTab === "documentos" && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="w-full md:max-w-xs">
                <Select
                  label="Categoria"
                  value={documentFilterCategory}
                  onChange={(event) =>
                    setDocumentFilterCategory(event.target.value)
                  }
                  options={[
                    { value: "all", label: "Todas as categorias" },
                    ...DOCUMENT_CATEGORY_OPTIONS.filter(
                      (option) => option.value,
                    ).map((option) => ({
                      value: option.value,
                      label: option.label,
                    })),
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportClienteDocuments}
                >
                  Exportar tudo
                </Button>
                {can("documentos.create") && (
                  <form
                    onSubmit={uploadClientDocument}
                    className="flex flex-col gap-2 md:flex-row md:items-end"
                  >
                    <DocumentFileInput
                      value={documentFile}
                      onChange={setDocumentFile}
                      disabled={isSubmitting}
                    />
                    <Select
                      label="Categoria do arquivo"
                      value={documentCategory}
                      onChange={(event) =>
                        setDocumentCategory(event.target.value)
                      }
                      options={DOCUMENT_CATEGORY_OPTIONS}
                    />
                    <Button type="submit" size="sm" isLoading={isSubmitting}>
                      Enviar
                    </Button>
                  </form>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {documentRows.length ? (
                documentRows.map((item) => {
                  const isImage = isImageDocument(item);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      {isImage ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDocument(item)}
                          className="mb-3 block overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700"
                        >
                          <AuthenticatedDocumentImage
                            url={`/api/v1/documentos/${item.id}/preview`}
                            alt={item.nomeOriginal}
                            className="h-32 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                          />
                        </button>
                      ) : (
                        <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900/40">
                          <span className="text-center text-xs font-semibold uppercase tracking-wide">
                            {item.tipo || "Arquivo"}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.nome}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.categoria || "Sem categoria"} ·{" "}
                            {item.nomeOriginal}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isImage && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setPreviewDocument(item)}
                            >
                              Visualizar
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadDocument(item)}
                          >
                            Baixar
                          </Button>

                          {can("documentos.delete") && (
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setDocumentToDelete(item);
                                setIsDocumentDeleteOpen(true);
                              }}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-xs text-slate-500 md:col-span-2 xl:col-span-3">
                  Nenhum documento nesta categoria.
                </p>
              )}
            </div>
          </div>
        )}

        {detailTab === "contratos" && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <ChildList
              loading={childLoading}
              items={childItems as Contrato[]}
              empty="Nenhum contrato vinculado."
              render={(item) => (
                <>
                  <p className="font-semibold">{item.numero}</p>
                  <p className="text-slate-500">
                    {item.descricao || "Sem descrição"}
                  </p>
                </>
              )}
            />
          </div>
        )}

        {detailTab === "financeiro" && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <ChildList
              loading={childLoading}
              items={childItems as Parcela[]}
              empty="Nenhuma parcela vinculada."
              render={(item) => (
                <>
                  <p className="font-semibold">
                    Parcela {item.numero} · R$ {item.valor}
                  </p>
                  <p className="text-slate-500">
                    {item.contrato?.numero || "Contrato"}
                  </p>
                </>
              )}
            />
          </div>
        )}

        {previewDocument && (
          <Modal
            isOpen={!!previewDocument}
            onClose={() => setPreviewDocument(null)}
            title={previewDocument.nome}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setPreviewDocument(null)}
                >
                  Fechar
                </Button>

                <Button onClick={() => downloadDocument(previewDocument)}>
                  Baixar arquivo
                </Button>
              </>
            }
          >
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
              <AuthenticatedDocumentImage
                url={`/api/v1/documentos/${previewDocument.id}/preview`}
                alt={previewDocument.nomeOriginal}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          </Modal>
        )}

        <ConfirmationDialog
          isOpen={isDocumentDeleteOpen}
          onClose={() => {
            if (!isSubmitting) {
              setIsDocumentDeleteOpen(false);
              setDocumentToDelete(null);
            }
          }}
          onConfirm={handleDeleteDocument}
          title="Excluir documento"
          message={
            <>
              Tem certeza que deseja excluir o documento{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {documentToDelete?.nomeOriginal || documentToDelete?.nome}
              </strong>
              ?
              <br />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                O documento será removido da lista de documentos do cliente.
              </span>
            </>
          }
          confirmText="Excluir documento"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  const columns: Column<Cliente>[] = [
    {
      key: "nome",
      header: "Cliente",
      sortable: true,
      render: (cliente) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            {cliente.tipoPessoa === "PJ" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => openClienteDetail(cliente)}
              className="text-left text-xs font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
            >
              {clientName(cliente)}
            </button>
            <p className="truncate text-[11px] text-slate-400">
              {documentLabel(cliente) || "Documento não informado"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "tipoPessoa",
      header: "Tipo",
      sortable: true,
      render: (cliente) => (
        <Badge
          variant={cliente.tipoPessoa === "PF" ? "indigo" : "purple"}
          size="sm"
        >
          {cliente.tipoPessoa}
        </Badge>
      ),
    },
    {
      key: "email",
      header: "Contato",
      sortable: true,
      render: (cliente) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <p>{cliente.email || "E-mail não informado"}</p>
          <p>
            {cliente.celular || cliente.telefone || "Telefone não informado"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (cliente) => (
        <Badge
          variant={cliente.status === "active" ? "success" : "neutral"}
          size="sm"
          dot
        >
          {cliente.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      render: (cliente) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedCliente(cliente);
              setIsDrawerOpen(true);
            }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Visualizar cliente"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {can("clientes.edit") && (
            <button
              onClick={() => openEdit(cliente)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
              title="Editar cliente"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {can("clientes.delete") && (
            <button
              onClick={() => {
                setSelectedCliente(cliente);
                setIsDeleteOpen(true);
              }}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
              title="Excluir cliente"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const isPessoaJuridica = formData.tipo_pessoa === "PJ";
  const formTitle = selectedCliente ? "Editar Cliente" : "Cadastrar Cliente";
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Tipo de Pessoa"
          value={formData.tipo_pessoa}
          onChange={(event) =>
            setField("tipo_pessoa", event.target.value as ClienteTipoPessoa)
          }
          options={[
            { value: "PF", label: "Pessoa Física" },
            { value: "PJ", label: "Pessoa Jurídica" },
          ]}
          required
        />
        {isPessoaJuridica ? (
          <>
            <Input
              label="Razão Social"
              value={formData.razao_social}
              onChange={(event) => setField("razao_social", event.target.value)}
              error={formErrors.razao_social}
              required
            />
            <Input
              label="Nome Fantasia"
              value={formData.nome_fantasia}
              onChange={(event) =>
                setField("nome_fantasia", event.target.value)
              }
              error={formErrors.nome_fantasia}
              required
            />
            <Input
              label="CNPJ"
              value={formData.cnpj}
              onChange={(event) =>
                setField("cnpj", formatCnpj(event.target.value))
              }
              error={formErrors.cnpj}
              required
            />
          </>
        ) : (
          <>
            <Input
              label="Nome Completo"
              value={formData.nome}
              onChange={(event) => setField("nome", event.target.value)}
              error={formErrors.nome}
              required
            />
            <Input
              label="CPF"
              value={formData.cpf}
              onChange={(event) =>
                setField("cpf", formatCpf(event.target.value))
              }
              error={formErrors.cpf}
              required
            />
            <Input
              label="RG"
              value={formData.rg}
              onChange={(event) => setField("rg", formatRg(event.target.value))}
              error={formErrors.rg}
            />
          </>
        )}
        <Input
          label="E-mail"
          type="email"
          value={formData.email}
          onChange={(event) => setField("email", event.target.value)}
          error={formErrors.email}
        />
        <Input
          label="Celular"
          value={formData.celular}
          onChange={(event) =>
            setField("celular", formatPhoneBR(event.target.value))
          }
          error={formErrors.celular}
        />
        <Input
          label="Telefone"
          value={formData.telefone}
          onChange={(event) =>
            setField("telefone", formatPhoneBR(event.target.value))
          }
          error={formErrors.telefone}
        />
        <Input
          label="WhatsApp"
          value={formData.whatsapp}
          onChange={(event) =>
            setField("whatsapp", formatPhoneBR(event.target.value))
          }
          error={formErrors.whatsapp}
        />
        <Input
          label="CEP"
          value={formData.cep}
          onChange={(event) => {
            const cep = formatCep(event.target.value);
            setField("cep", cep);
            if (cep.replace(/\D/g, "").length === 8) void lookupCep(cep);
          }}
          onBlur={(event) => void lookupCep(event.currentTarget.value)}
          helperText={isCepLoading ? "Buscando CEP..." : undefined}
          error={formErrors.cep}
        />
        <Input
          label="Logradouro"
          value={formData.logradouro}
          onChange={(event) => setField("logradouro", event.target.value)}
          error={formErrors.logradouro}
        />
        <Input
          label="Número"
          value={formData.numero}
          onChange={(event) => setField("numero", event.target.value)}
          error={formErrors.numero}
        />
        <Input
          label="Complemento"
          value={formData.complemento}
          onChange={(event) => setField("complemento", event.target.value)}
          error={formErrors.complemento}
        />
        <Input
          label="Bairro"
          value={formData.bairro}
          onChange={(event) => setField("bairro", event.target.value)}
          error={formErrors.bairro}
        />
        <Input
          label="Cidade"
          value={formData.cidade}
          onChange={(event) => setField("cidade", event.target.value)}
          error={formErrors.cidade}
        />
        <Select
          label="UF"
          value={formData.estado}
          onChange={(event) => setField("estado", event.target.value)}
          options={estadosBrasileiros}
          error={formErrors.estado}
        />
        <Input
          label="Data de Nascimento"
          type="date"
          value={formData.data_nascimento}
          onChange={(event) => setField("data_nascimento", event.target.value)}
          error={formErrors.data_nascimento}
        />
      </div>
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="observacoes"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Observações
        </label>
        <textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(event) => setField("observacoes", event.target.value)}
          className="block min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {formErrors.observacoes && (
          <p className="text-xs text-rose-500">{formErrors.observacoes}</p>
        )}
      </div>
      <Switch
        label="Cliente ativo"
        description="Clientes inativos permanecem no histórico, mas não são selecionáveis em novos registros."
        checked={formData.status === "active"}
        onCheckedChange={(checked) =>
          setField("status", checked ? "active" : "inactive")
        }
      />
    </form>
  );

  return (
    <div className="space-y-5 text-left">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Clientes
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Cadastre e mantenha os dados de pessoas físicas e jurídicas.
          </p>
        </div>
        {can("clientes.create") && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={openCreate}
          >
            Novo Cliente
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <Input
            placeholder="Pesquisar por nome ou documento..."
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
            value={tipoPessoaFilter}
            onChange={(event) => {
              setTipoPessoaFilter(event.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Todos os tipos" },
              { value: "PF", label: "Pessoa Física" },
              { value: "PJ", label: "Pessoa Jurídica" },
            ]}
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
              { value: "all", label: "Todos os status" },
              { value: "active", label: "Ativos" },
              { value: "inactive", label: "Inativos" },
            ]}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={clientes}
        keyExtractor={(cliente) => cliente.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          <div className="space-y-2 py-8 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500">
              Nenhum cliente encontrado com os filtros aplicados.
            </p>
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
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formTitle}
        description="Preencha os dados cadastrais do cliente."
        size="2xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {selectedCliente ? "Atualizar Cliente" : "Salvar Cliente"}
            </Button>
          </>
        }
      >
        {renderForm()}
      </Modal>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Ficha do Cliente"
        description="Dados cadastrais e informações de contato"
        width="lg"
      >
        {selectedCliente && (
          <div className="space-y-6 text-left">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  {selectedCliente.tipoPessoa === "PJ" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {clientName(selectedCliente)}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        selectedCliente.status === "active"
                          ? "success"
                          : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {selectedCliente.status === "active"
                        ? "Ativo"
                        : "Inativo"}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {selectedCliente.tipoPessoa} ·{" "}
                      {documentLabel(selectedCliente) || "Sem documento"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Tabs
              activeTab={detailTab}
              onChange={setDetailTab}
              tabs={[
                { id: "resumo", label: "Resumo" },
                { id: "cadastro", label: "Cadastro" },
                { id: "processos", label: "Processos" },
                { id: "documentos", label: "Documentos" },
                { id: "contratos", label: "Contratos" },
                { id: "financeiro", label: "Financeiro" },
                { id: "historico", label: "Histórico" },
              ]}
            />
            {detailTab === "resumo" && (
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                {[
                  ["E-mail", selectedCliente.email],
                  ["Celular", selectedCliente.celular],
                  ["Telefone", selectedCliente.telefone],
                  ["WhatsApp", selectedCliente.whatsapp],
                  [
                    "Endereço",
                    [
                      selectedCliente.logradouro,
                      selectedCliente.numero,
                      selectedCliente.bairro,
                      selectedCliente.cidade,
                      selectedCliente.estado,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                  [
                    "Processos vinculados",
                    String(selectedCliente.processosCount ?? 0),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <span className="block text-[11px] text-slate-400">
                      {label}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {value || "Não informado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {detailTab === "resumo" && selectedCliente.observacoes && (
              <div>
                <h5 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Observações
                </h5>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedCliente.observacoes}
                </p>
              </div>
            )}
            {detailTab === "cadastro" && (
              <div className="space-y-3 text-xs">
                <p>
                  <span className="text-slate-500">E-mail</span>
                  <br />
                  {selectedCliente.email || "Não informado"}
                </p>
                <p>
                  <span className="text-slate-500">Telefone</span>
                  <br />
                  {selectedCliente.celular ||
                    selectedCliente.telefone ||
                    "Não informado"}
                </p>
                {can("clientes.edit") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(selectedCliente)}
                  >
                    Editar cadastro
                  </Button>
                )}
              </div>
            )}
            {detailTab === "processos" && (
              <ChildList
                loading={childLoading}
                items={childItems as Processo[]}
                empty="Nenhum processo vinculado."
                render={(item) => (
                  <>
                    <p className="font-semibold">{item.numeroProcesso}</p>
                    <p className="text-slate-500">{item.titulo}</p>
                  </>
                )}
              />
            )}
            {detailTab === "documentos" && (
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  Documentos do cliente{" "}
                  <Tooltip content="Arquivos vinculados diretamente a este cliente.">
                    <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                  </Tooltip>
                </div>
                {can("documentos.create") && (
                  <form
                    onSubmit={uploadClientDocument}
                    className="space-y-3 border-b border-slate-200 pb-4 dark:border-slate-800"
                  >
                    <DocumentFileInput
                      value={documentFile}
                      onChange={setDocumentFile}
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Categoria"
                      value={documentCategory}
                      onChange={(event) =>
                        setDocumentCategory(event.target.value)
                      }
                      required
                    />
                    <Button type="submit" size="sm" isLoading={isSubmitting}>
                      Enviar documento
                    </Button>
                  </form>
                )}
                <ChildList
                  loading={childLoading}
                  items={childItems as Documento[]}
                  empty="Nenhum documento vinculado."
                  render={(item) => (
                    <>
                      <p className="font-semibold">{item.nome}</p>
                      <p className="text-slate-500">{item.categoria}</p>
                    </>
                  )}
                />
              </div>
            )}
            {detailTab === "contratos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    Contratos{" "}
                    <Tooltip content="Contratos vinculados a este cliente.">
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                    </Tooltip>
                  </div>
                  {can("contratos.create") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setContractForm({
                          processo_id: "",
                          numero: "",
                          data_inicio: "",
                          valor_total: "",
                          forma_pagamento: "",
                        });
                        fetch(
                          `/api/v1/clientes/${selectedCliente.id}/processos?perPage=100`,
                        )
                          .then((response) => response.json())
                          .then((json) =>
                            setContractProcesses(json.data ?? []),
                          );
                        setContractOpen(true);
                      }}
                    >
                      Novo contrato
                    </Button>
                  )}
                </div>
                <ChildList
                  loading={childLoading}
                  items={childItems as Contrato[]}
                  empty="Nenhum contrato vinculado."
                  render={(item) => (
                    <>
                      <p className="font-semibold">{item.numero}</p>
                      <p className="text-slate-500">
                        {item.descricao || "Sem descrição"}
                      </p>
                    </>
                  )}
                />
              </div>
            )}
            {detailTab === "financeiro" && (
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  Financeiro{" "}
                  <Tooltip content="Parcelas vinculadas aos contratos deste cliente.">
                    <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                  </Tooltip>
                </div>
                <ChildList
                  loading={childLoading}
                  items={childItems as Parcela[]}
                  empty="Nenhuma parcela vinculada."
                  render={(item) => (
                    <>
                      <p className="font-semibold">
                        Parcela {item.numero} · R$ {item.valor}
                      </p>
                      <p className="text-slate-500">
                        {item.contrato?.numero || "Contrato"}
                      </p>
                    </>
                  )}
                />
              </div>
            )}
            {detailTab === "historico" && (
              <p className="py-6 text-center text-xs text-slate-500">
                Não há histórico disponível para este cliente.
              </p>
            )}
          </div>
        )}
      </Drawer>
      <Modal
        isOpen={contractOpen}
        onClose={() => setContractOpen(false)}
        title="Novo contrato"
        description={
          selectedCliente
            ? `Cliente: ${clientName(selectedCliente)}`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setContractOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="client-contract-form"
              isLoading={isSubmitting}
            >
              Salvar contrato
            </Button>
          </>
        }
      >
        <form
          id="client-contract-form"
          onSubmit={saveContract}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Select
            label="Processo"
            value={contractForm.processo_id}
            onChange={(event) =>
              setContractForm({
                ...contractForm,
                processo_id: event.target.value,
              })
            }
            options={[
              { value: "", label: "Sem processo" },
              ...contractProcesses.map((item) => ({
                value: item.id,
                label: item.numeroProcesso,
              })),
            ]}
          />
          <Input
            label="Número"
            value={contractForm.numero}
            onChange={(event) =>
              setContractForm({ ...contractForm, numero: event.target.value })
            }
            required
          />
          <Input
            label="Início"
            type="date"
            value={contractForm.data_inicio}
            onChange={(event) =>
              setContractForm({
                ...contractForm,
                data_inicio: event.target.value,
              })
            }
            required
          />
          <Input
            label="Valor total"
            value={contractForm.valor_total}
            onChange={(event) =>
              setContractForm({
                ...contractForm,
                valor_total: event.target.value,
              })
            }
            required
          />
          <Input
            label="Forma de pagamento"
            value={contractForm.forma_pagamento}
            onChange={(event) =>
              setContractForm({
                ...contractForm,
                forma_pagamento: event.target.value,
              })
            }
            required
          />
        </form>
      </Modal>
    </div>
  );
};
