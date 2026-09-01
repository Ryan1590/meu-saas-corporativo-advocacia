import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  User,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Landmark,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Scale,
  Paperclip,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Cliente, Processo, Documento, Contrato, ProcessoMovimentacao, ProcessoPrazo, Tarefa } from '../../types';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';

interface ClienteProcessoTreeProps {
  cliente: Cliente;
  processos: Processo[];
  documentos: Documento[];
  contratos: Contrato[];
  tarefas?: Tarefa[];
  onOpenProcesso?: (processo: Processo) => void;
  onNewProcesso?: () => void;
  onNewDocumento?: () => void;
  onNewContrato?: () => void;
}

export const ClienteProcessoTree: React.FC<ClienteProcessoTreeProps> = ({
  cliente,
  processos,
  documentos,
  contratos,
  tarefas = [],
  onOpenProcesso,
  onNewProcesso,
  onNewDocumento,
  onNewContrato,
}) => {
  const [expandedProcesses, setExpandedProcesses] = useState<Record<string, boolean>>(() => {
    // Expand first process by default if exists
    return processos.length > 0 ? { [processos[0].id]: true } : {};
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    processos: true,
    documentos: true,
    contratos: true,
    tarefas: true,
  });

  const toggleProcess = (id: string) => {
    setExpandedProcesses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clientDisplayName = cliente.tipoPessoa === 'PJ'
    ? (cliente.razaoSocial || cliente.nomeFantasia || 'Cliente Pessoa Jurídica')
    : (cliente.nome || 'Cliente Pessoa Física');

  const formatMoney = (val?: number | string | null) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val ?? 0));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
      {/* Root Node: Cliente */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{clientDisplayName}</h3>
              <Badge variant={cliente.status === 'active' ? 'success' : 'neutral'} size="sm">
                {cliente.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant="indigo" size="sm">
                {cliente.tipoPessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {cliente.tipoPessoa === 'PJ' ? `CNPJ: ${cliente.cnpj || '-'}` : `CPF: ${cliente.cpf || '-'}`}
              {cliente.email && ` • ${cliente.email}`}
              {(cliente.celular || cliente.telefone) && ` • ${cliente.celular || cliente.telefone}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNewProcesso && (
            <Button size="xs" variant="primary" leftIcon={<Plus className="h-3 w-3" />} onClick={onNewProcesso}>
              Novo Processo
            </Button>
          )}
          {onNewDocumento && (
            <Button size="xs" variant="secondary" leftIcon={<Paperclip className="h-3 w-3" />} onClick={onNewDocumento}>
              Anexar Doc
            </Button>
          )}
          {onNewContrato && (
            <Button size="xs" variant="ghost" leftIcon={<Landmark className="h-3 w-3" />} onClick={onNewContrato}>
              Honorários
            </Button>
          )}
        </div>
      </div>

      {/* Tree Structure */}
      <div className="mt-4 space-y-4 text-xs">
        
        {/* RAMO 1: PROCESSOS DO CLIENTE */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <div 
            onClick={() => toggleSection('processos')}
            className="flex cursor-pointer select-none items-center justify-between font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center gap-2">
              {expandedSections.processos ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Processos Vinculados ({processos.length})</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400">
              {expandedSections.processos ? 'Clique para recolher' : 'Clique para expandir'}
            </span>
          </div>

          {expandedSections.processos && (
            <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50 space-y-3">
              {processos.length === 0 ? (
                <div className="py-2 text-slate-400 italic">
                  Nenhum processo vinculado a este cliente até o momento.
                </div>
              ) : (
                processos.map((proc) => {
                  const isProcExpanded = !!expandedProcesses[proc.id];
                  const movs = proc.movimentacoes || [];
                  const prazos = proc.prazos || [];
                  const advogados = proc.advogados || [];

                  return (
                    <div 
                      key={proc.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Process Header */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div 
                          onClick={() => toggleProcess(proc.id)}
                          className="flex cursor-pointer items-start gap-2 select-none"
                        >
                          <button className="mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            {isProcExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {proc.numeroProcesso || 'Processo sem número'}
                              </span>
                              <Badge size="sm" variant={proc.status?.nome === 'Concluído' ? 'success' : 'indigo'}>
                                {proc.status?.nome || 'Em Andamento'}
                              </Badge>
                              {proc.areaJuridica && (
                                <Badge size="sm" variant="neutral">
                                  {proc.areaJuridica}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {proc.titulo || proc.tipoAcao || 'Ação Judicial'}
                              {proc.tribunal && ` • ${proc.tribunal}`}
                              {proc.vara && ` • ${proc.vara}`}
                            </p>
                          </div>
                        </div>

                        {onOpenProcesso && (
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            rightIcon={<ExternalLink className="h-3 w-3" />}
                            onClick={() => onOpenProcesso(proc)}
                          >
                            Ver Ficha
                          </Button>
                        )}
                      </div>

                      {/* Process Sub-Tree */}
                      {isProcExpanded && (
                        <div className="mt-3 ml-2 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                          
                          {/* Advogados Responsáveis */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-500 dark:text-slate-400">Advogado(a):</span>
                            {advogados.length > 0 ? (
                              advogados.map((adv) => (
                                <span key={adv.id} className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {adv.nome} {adv.oabNumero && `(OAB ${adv.oabNumero}/${adv.oabUf})`}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Nenhum advogado específico atribuído</span>
                            )}
                          </div>

                          {/* Prazos Processuais */}
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                              <span>Prazos & Audiências ({prazos.length})</span>
                            </div>
                            {prazos.length === 0 ? (
                              <p className="mt-1 pl-5 text-[11px] text-slate-400 italic">Nenhum prazo pendente</p>
                            ) : (
                              <div className="mt-1.5 pl-5 space-y-1.5">
                                {prazos.slice(0, 3).map((p) => (
                                  <div key={p.id} className="flex items-center justify-between rounded bg-amber-50/60 px-2 py-1 text-[11px] dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                                    <span className="font-medium text-amber-900 dark:text-amber-200">{p.titulo}</span>
                                    <span className="text-amber-700 dark:text-amber-300 font-mono text-[10px]">
                                      {p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Andamentos / Histórico */}
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                              <span>Últimos Andamentos ({movs.length})</span>
                            </div>
                            {movs.length === 0 ? (
                              <p className="mt-1 pl-5 text-[11px] text-slate-400 italic">Sem movimentações registradas</p>
                            ) : (
                              <div className="mt-1.5 pl-5 space-y-1.5">
                                {movs.slice(0, 3).map((m) => (
                                  <div key={m.id} className="border-l-2 border-slate-200 pl-2 text-[11px] dark:border-slate-700">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{m.titulo}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {m.dataMovimentacao ? new Date(m.dataMovimentacao).toLocaleDateString('pt-BR') : '-'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* RAMO 2: DOCUMENTOS E ANEXOS */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <div 
            onClick={() => toggleSection('documentos')}
            className="flex cursor-pointer select-none items-center justify-between font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center gap-2">
              {expandedSections.documentos ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Documentos & Anexos do Cliente ({documentos.length})</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400">
              {expandedSections.documentos ? 'Clique para recolher' : 'Clique para expandir'}
            </span>
          </div>

          {expandedSections.documentos && (
            <div className="mt-3 pl-4 border-l-2 border-emerald-200 dark:border-emerald-900/50">
              {documentos.length === 0 ? (
                <div className="py-2 text-slate-400 italic">
                  Nenhum documento anexado ainda.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {documentos.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.nome || doc.nomeOriginal}</p>
                          <p className="text-[10px] text-slate-400">{doc.categoria || 'Geral'}</p>
                        </div>
                      </div>
                      <Badge size="sm" variant="neutral">
                        {doc.tamanho ? `${(doc.tamanho / 1024).toFixed(0)} KB` : 'Doc'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RAMO 3: HONORÁRIOS & CONTRATOS */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
          <div 
            onClick={() => toggleSection('contratos')}
            className="flex cursor-pointer select-none items-center justify-between font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <div className="flex items-center gap-2">
              {expandedSections.contratos ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Contratos & Honorários ({contratos.length})</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400">
              {expandedSections.contratos ? 'Clique para recolher' : 'Clique para expandir'}
            </span>
          </div>

          {expandedSections.contratos && (
            <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-900/50">
              {contratos.length === 0 ? (
                <div className="py-2 text-slate-400 italic">
                  Nenhum contrato cadastrado para este cliente.
                </div>
              ) : (
                <div className="space-y-2">
                  {contratos.map((ct) => (
                    <div 
                      key={ct.id}
                      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{ct.numero}</span>
                          <Badge size="sm" variant={ct.status === 'ativo' ? 'success' : 'neutral'}>
                            {ct.status || 'Ativo'}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {ct.formaPagamento && `Forma: ${ct.formaPagamento}`}
                          {ct.dataInicio && ` • Início: ${new Date(ct.dataInicio).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="text-right font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatMoney(ct.valorTotal)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
