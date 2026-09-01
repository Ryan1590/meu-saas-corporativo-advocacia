import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Calendar,
  Globe,
  Terminal,
  Download,
  Clock,
  Shield,
} from 'lucide-react';
import { AuditLog } from '../types';
import { Table, Column, Pagination } from '../components/design-system/Table';
import { Button } from '../components/design-system/Button';
import { Input, Select } from '../components/design-system/Input';
import { Badge } from '../components/design-system/Badge';
import { Modal } from '../components/design-system/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

export const AuditLogsView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected Log for JSON payload modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          search,
          module: moduleFilter,
          page: currentPage.toString(),
          perPage: perPage.toString(),
        });
        const res = await fetch(`/api/v1/logs?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLogs(json.data);
            if (json.meta) {
              setTotalPages(json.meta.lastPage);
              setTotalItems(json.meta.total);
            }
          }
        }
      } catch (err) {
        toastError('Erro ao carregar logs de auditoria.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, [search, moduleFilter, currentPage, perPage, toastError]);

  if (!can('logs.view')) {
    return (
      <ForbiddenShield
        requiredPermission="logs.view"
        message="Seu perfil de acesso atual não possui autorização para consultar os Logs de Auditoria do sistema."
      />
    );
  }

  const handleExportXLS = () => {
    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const headers = ['ID', 'Usuário', 'Ação', 'Módulo', 'Descrição', 'IP', 'Data'];
    const rows = logs.map((l) => [
      l.id,
      l.userName,
      l.action,
      l.module,
      l.description,
      l.ipAddress,
      l.createdAt,
    ]);
    const table = `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
    const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
    success('Logs exportados em Excel com sucesso!');
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Data / Hora',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {new Date(item.createdAt).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Usuário Responsável',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {item.userName}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Módulo',
      render: (item) => (
        <Badge variant="indigo" size="sm">
          {item.module}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Operação',
      render: (item) => (
        <Badge
          variant={
            item.action.includes('delete')
              ? 'danger'
              : item.action.includes('create')
              ? 'success'
              : 'neutral'
          }
          size="sm"
        >
          {item.action}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Detalhes da Ação',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">{item.description}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Endereço IP',
      render: (item) => (
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {item.ipAddress}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Payload',
      align: 'right',
      render: (item) => (
        <Button
          variant="ghost"
          size="xs"
          leftIcon={<Eye className="w-3 h-3" />}
          onClick={() => {
            setSelectedLog(item);
            setIsModalOpen(true);
          }}
        >
          JSON
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Logs de Auditoria & Rastreabilidade
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro detalhado e imutável de todas as ações executadas no sistema
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportXLS}
        >
          Exportar Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="sm:col-span-8">
          <Input
            placeholder="Pesquisar por usuário, descrição ou IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="sm:col-span-4">
          <Select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Todos os Módulos' },
              { value: 'auth', label: 'Autenticação (Auth)' },
              { value: 'users', label: 'Usuários (Users)' },
              { value: 'roles', label: 'Perfis (Roles)' },
              { value: 'settings', label: 'Configurações' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={logs}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        totalItems={totalItems}
        onPageChange={(p) => setCurrentPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setCurrentPage(1);
        }}
      />

      {/* JSON PAYLOAD INSPECTOR MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes do Registro de Auditoria"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Fechar
          </Button>
        }
      >
        {selectedLog && (
          <div className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 text-[11px] block">Ação</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Módulo</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedLog.module}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Usuário</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.userName} ({selectedLog.userId})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">User-Agent / IP</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  {selectedLog.ipAddress}
                </span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payload JSON (Dados da Operação):
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 max-h-56">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
