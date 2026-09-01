import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Shield,
  KeyRound,
  CheckCircle,
  XCircle,
  Download,
  MoreVertical,
  RotateCcw,
  Mail,
  Calendar,
  Lock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { User, Role, UserStatus } from '../types';
import { Table, Column, Pagination } from '../components/design-system/Table';
import { Button } from '../components/design-system/Button';
import { Input, Select, Checkbox, Switch } from '../components/design-system/Input';
import { Badge, Avatar } from '../components/design-system/Badge';
import { AvatarUpload } from '../components/design-system/AvatarUpload';
import { Modal, Drawer } from '../components/design-system/Modal';
import { ConfirmationDialog } from '../components/design-system/ConfirmationDialog';
import { Dropdown } from '../components/design-system/Dropdown';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

export const UsersView: React.FC = () => {
  const { user: currentUser, can, hasRole, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    data_nascimento: '',
    avatar: '',
    status: 'active' as UserStatus,
    roles: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdministrator = hasRole('admin');
  const assignableRoles = roles.filter((role) => isAdministrator || role.name !== 'admin');

  // Load available roles
  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetch('/api/v1/roles');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setRoles(json.data);
        }
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    }
    loadRoles();
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        role: roleFilter,
        sortColumn,
        sortDirection,
        page: currentPage.toString(),
        perPage: perPage.toString(),
      });

      const res = await fetch(`/api/v1/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
          if (json.meta) {
            setTotalPages(json.meta.lastPage);
            setTotalItems(json.meta.total);
          }
        }
      }
    } catch (err) {
      toastError('Erro ao buscar usuários do servidor.', 'Erro');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, roleFilter, sortColumn, sortDirection, currentPage, perPage, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      data_nascimento: '',
      avatar: '',
      status: 'active',
      roles: assignableRoles.length > 0 ? [assignableRoles[0].id] : [],
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      data_nascimento: user.data_nascimento || '',
      avatar: user.avatar || '',
      status: user.status,
      roles: user.roleIds || user.rolesDetails?.map((role) => role.id) || [],
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open Details Drawer
  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors) {
          const errObj: Record<string, string> = {};
          Object.keys(json.errors).forEach((k) => (errObj[k] = json.errors[k][0]));
          setFormErrors(errObj);
        }
        toastError(json.message || 'Erro ao criar usuário.');
        return;
      }

      success(json.message || `Convite enviado para "${formData.name}" com sucesso!`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      toastError('Erro de conexão ao criar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors) {
          const errObj: Record<string, string> = {};
          Object.keys(json.errors).forEach((k) => (errObj[k] = json.errors[k][0]));
          setFormErrors(errObj);
        }
        toastError(json.message || 'Erro ao atualizar usuário.');
        return;
      }

      success(`Usuário "${formData.name}" atualizado com sucesso!`);
      setIsEditModalOpen(false);
      if (selectedUser.id === currentUser?.id) {
        await refreshUser();
      }
      fetchUsers();
    } catch (err) {
      toastError('Erro de conexão ao atualizar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/v1/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        success(`Status do usuário "${user.name}" alterado para ${nextStatus}.`);
        fetchUsers();
      } else {
        toastError(json.message || 'Não foi possível alterar o status.');
      }
    } catch (err) {
      toastError('Erro ao comunicar com o servidor.');
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        success(`Usuário "${selectedUser.name}" excluído.`);
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toastError(json.message || 'Erro ao excluir usuário.');
      }
    } catch (err) {
      toastError('Erro ao comunicar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password Action
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        success(`Instruções de redefinição enviadas para ${selectedUser.email}.`);
        setIsResetPassModalOpen(false);
      } else {
        toastError(json.message || 'Erro ao redefinir senha.');
      }
    } catch (err) {
      toastError('Erro ao comunicar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportXLS = () => {
    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const headers = ['ID', 'Nome', 'Email', 'Data de Nascimento', 'Status', 'Perfis', 'Criado em'];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.data_nascimento || '',
      u.status,
      u.rolesDetails?.map((r) => r.label).join(', ') || u.roles.join(', '),
      u.createdAt,
    ]);
    const table = `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
    const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `usuarios_export_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);
    success('Usuários exportados em Excel com sucesso!');
  };

  // Screen-level permission shield
  if (!can('users.view')) {
    return (
      <ForbiddenShield
        requiredPermission="users.view"
        message="Seu perfil de acesso atual não possui permissão para visualizar o módulo de Usuários."
      />
    );
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Usuário',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} src={item.avatar} size="sm" status={item.status === 'active' ? 'online' : 'offline'} />
          <div className="min-w-0">
            <button
              onClick={() => handleOpenDetails(item)}
              className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
            >
              {item.name}
            </button>
            <p className="text-[11px] text-slate-400 truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Perfil / Cargo',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.rolesDetails && item.rolesDetails.length > 0 ? (
            item.rolesDetails.map((r) => (
              <Badge key={r.id} variant={r.name === 'admin' ? 'purple' : 'indigo'} size="sm">
                {r.label}
              </Badge>
            ))
          ) : (
            <Badge variant="indigo" size="sm">
              {item.roles[0] || 'Operador'}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        const isEditable = can('users.status');
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'neutral' : 'danger'}
              size="sm"
              dot
            >
              {item.status === 'active' ? 'Ativo' : item.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
            </Badge>
            {isEditable && (
              <button
                onClick={() => handleToggleStatus(item)}
                className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                {item.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: 'lastLoginAt',
      header: 'Último Acesso',
      sortable: true,
      render: (item) => (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca acessou'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => {
        const canEdit = can('users.edit');
        const canDelete = can('users.delete');

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenDetails(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Visualizar Detalhes"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {canEdit && (
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Editar Usuário"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              }
              items={[
                {
                  key: 'reset',
                  label: 'Resetar Senha',
                  icon: <KeyRound className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setSelectedUser(item);
                    setIsResetPassModalOpen(true);
                  },
                },
                {
                  key: 'del',
                  label: 'Excluir Usuário',
                  icon: <Trash2 className="w-3.5 h-3.5" />,
                  danger: true,
                  disabled: !canDelete || item.id === currentUser?.id,
                  onClick: () => handleOpenDelete(item),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gerenciamento de Usuários
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastre, edite e controle o acesso e permissões dos membros da organização
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportXLS}
          >
            Exportar XLS
          </Button>

          {can('users.create') && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAdd}
            >
              Novo Usuário
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="sm:col-span-6">
          <Input
            placeholder="Pesquisar por nome ou e-mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'active', label: 'Apenas Ativos' },
              { value: 'inactive', label: 'Apenas Inativos' },
              { value: 'suspended', label: 'Suspensos' },
            ]}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Todos os Perfis' },
              ...roles.map((r) => ({ value: r.name, label: r.label })),
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          <div className="py-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>
        }
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

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Novo Usuário"
        description="Preencha os dados de acesso, selecione a foto de perfil e os perfis associados"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Salvar Usuário
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <AvatarUpload
            value={formData.avatar}
            name={formData.name}
            onChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
            label="Foto de Perfil (Avatar)"
          />

          <Input
            label="Nome Completo"
            placeholder="Ex: Ana Paula Martins"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="E-mail Corporativo"
            type="email"
            placeholder="ana.martins@empresa.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
            error={formErrors.data_nascimento}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Perfis de Acesso (Roles) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
              {assignableRoles.map((role) => (
                <Checkbox
                  key={role.id}
                  label={role.label}
                  description={`${role.permissions.length} permissões`}
                  checked={formData.roles.includes(role.id) || formData.roles.includes(role.name)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      roles: checked
                        ? [...prev.roles, role.id]
                        : prev.roles.filter((r) => r !== role.id && r !== role.name),
                    }));
                  }}
                />
              ))}
            </div>
            {formErrors.roles && <p className="text-xs text-rose-500">{formErrors.roles}</p>}
          </div>

          <div className="pt-2">
            <Switch
              label="Status do Usuário"
              description="Usuários inativos não conseguem autenticar no sistema"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
              }
            />
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Dados do Usuário"
        description="Atualize as informações cadastrais, foto de perfil e perfis de permissão"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} isLoading={isSubmitting}>
              Atualizar Dados
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <AvatarUpload
            value={formData.avatar}
            name={formData.name}
            onChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
            label="Foto de Perfil (Avatar)"
          />

          <Input
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="E-mail Corporativo"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
            error={formErrors.data_nascimento}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Perfis de Acesso (Roles)
            </label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
              {assignableRoles.map((role) => (
                <Checkbox
                  key={role.id}
                  label={role.label}
                  description={`${role.permissions.length} permissões`}
                  checked={formData.roles.includes(role.id) || formData.roles.includes(role.name)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      roles: checked
                        ? [...prev.roles, role.id]
                        : prev.roles.filter((r) => r !== role.id && r !== role.name),
                    }));
                  }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Switch
              label="Status do Usuário"
              description="Ative ou desative o acesso instantâneo desta conta"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
              }
            />
          </div>
        </form>
      </Modal>

      {/* USER DETAILS DRAWER */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Ficha do Usuário"
        description="Visualização consolidada de permissões, sessões e histórico"
        width="lg"
      >
        {selectedUser && (
          <div className="space-y-6 text-left">
            {/* Header Profile */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <Avatar name={selectedUser.name} src={selectedUser.avatar} size="lg" status={selectedUser.status === 'active' ? 'online' : 'offline'} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedUser.name}
                </h4>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={selectedUser.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                    {selectedUser.status === 'active' ? 'Conta Ativa' : 'Conta Inativa'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">ID: {selectedUser.id}</span>
                </div>
              </div>
            </div>

            {/* Roles and Permissions Matrix */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Perfis Associados
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedUser.rolesDetails?.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-1 min-w-[200px]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                        {r.label}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {r.permissions.length} perms
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {r.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated Granular Permissions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Permissões Efetivas ({selectedUser.permissions?.length || 0})
              </h5>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                  selectedUser.permissions.map((p) => (
                    <Badge key={p} variant="neutral" size="sm">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Nenhuma permissão específica</span>
                )}
              </div>
            </div>

            {/* Security and Session Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Segurança & Acessos
              </h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Último IP Registrado</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedUser.lastLoginIp || 'Nenhum'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Autenticação 2FA</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedUser.twoFactorEnabled ? 'Ativada (Fortify)' : 'Desativada'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Usuário"
        message={
          <>
            Tem certeza que deseja excluir o usuário{' '}
            <strong className="text-slate-900 dark:text-slate-100">{selectedUser?.name}</strong>?
            Esta ação revogará imediatamente todos os tokens Sanctum e sessões ativas deste usuário.
          </>
        }
        confirmText="Excluir Usuário"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* RESET PASSWORD CONFIRMATION */}
      <Modal
        isOpen={isResetPassModalOpen}
        onClose={() => setIsResetPassModalOpen(false)}
        title="Redefinir Senha do Usuário"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsResetPassModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleResetPassword} isLoading={isSubmitting}>
              Enviar Link de Reset
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
          Um e-mail seguro será disparado para{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">{selectedUser?.email}</strong> contendo o token temporário do Laravel Fortify para criação de nova senha.
        </p>
      </Modal>
    </div>
  );
};
