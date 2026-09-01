import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Check,
  Lock,
  Search,
  Layers,
  Key,
  Shield,
} from 'lucide-react';
import { Role, Permission } from '../types';
import { Button } from '../components/design-system/Button';
import { Input, Checkbox } from '../components/design-system/Input';
import { Badge } from '../components/design-system/Badge';
import { Card } from '../components/design-system/Badge';
import { Modal } from '../components/design-system/Modal';
import { ConfirmationDialog } from '../components/design-system/ConfirmationDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

export const RolesPermissionsView: React.FC = () => {
  const { can } = useAuth();
  const { success, error: toastError } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    permissions: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resRoles, resPerms] = await Promise.all([
        fetch('/api/v1/roles'),
        fetch('/api/v1/permissions'),
      ]);
      const jsonRoles = await resRoles.json();
      const jsonPerms = await resPerms.json();

      if (jsonRoles.success) setRoles(jsonRoles.data);
      if (jsonPerms.success) setPermissions(jsonPerms.data);
    } catch (err) {
      toastError('Erro ao carregar perfis e permissões.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!can('roles.view')) {
    return (
      <ForbiddenShield
        requiredPermission="roles.view"
        message="Seu perfil de acesso não tem permissão para visualizar a gestão de Perfis e Permissões."
      />
    );
  }

  // Group permissions by module
  const modules: string[] = Array.from(new Set(permissions.map((p) => p.module)));

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      permissions: ['dashboard.view'],
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      label: role.label,
      description: role.description,
      permissions: [...role.permissions],
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/roles', {
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
        toastError(json.message || 'Erro ao criar perfil.');
        return;
      }

      success(`Perfil "${formData.label}" criado com sucesso!`);
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      toastError('Erro ao criar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toastError(json.message || 'Erro ao atualizar perfil.');
        return;
      }

      success(`Perfil "${formData.label}" atualizado com sucesso!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      toastError('Erro ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/roles/${selectedRole.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        success(`Perfil "${selectedRole.label}" excluído com sucesso.`);
        setIsDeleteDialogOpen(false);
        loadData();
      } else {
        toastError(json.message || 'Erro ao excluir perfil.');
      }
    } catch (err) {
      toastError('Erro ao excluir perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAllInModule = (moduleName: string) => {
    const modulePermNames = permissions.filter((p) => p.module === moduleName).map((p) => p.name);
    const allSelected = modulePermNames.every((p) => formData.permissions.includes(p));

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !modulePermNames.includes(p)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...modulePermNames])),
      }));
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Perfis de Acesso & Matriz RBAC
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estrutura de Roles + Permissions para controle granular de acessos e telas
          </p>
        </div>

        {can('roles.create') && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Novo Perfil
          </Button>
        )}
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {role.label}
                    </h3>
                    <code className="text-[10px] text-slate-400 font-mono">
                      name: {role.name}
                    </code>
                  </div>
                </div>

                {role.isSystem ? (
                  <Badge variant="purple" size="sm">
                    Sistema
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Customizado
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed min-h-[36px]">
                {role.description || 'Sem descrição cadastrada'}
              </p>

              {/* Stats badges */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <Badge variant="indigo" size="sm">
                  {role.permissions.length} Permissões
                </Badge>
                <Badge variant="neutral" size="sm">
                  {role.usersCount || 0} Usuários vinculados
                </Badge>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              {can('roles.edit') && (
                <Button
                  variant="secondary"
                  size="xs"
                  leftIcon={<Edit2 className="w-3 h-3" />}
                  onClick={() => handleOpenEdit(role)}
                >
                  Editar Permissões
                </Button>
              )}

              {can('roles.delete') && !role.isSystem && (
                <Button
                  variant="danger"
                  size="xs"
                  leftIcon={<Trash2 className="w-3 h-3" />}
                  onClick={() => {
                    setSelectedRole(role);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Excluir
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Matrix Preview Component */}
      <Card
        title="Catálogo de Permissões por Módulo"
        subtitle="Permissões disponíveis que podem ser associadas aos perfis"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {modules.map((mod) => {
            const modPerms = permissions.filter((p) => p.module === mod);
            return (
              <div
                key={mod}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Módulo: {mod}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {modPerms.length}
                  </Badge>
                </div>

                <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {modPerms.map((p) => (
                    <div key={p.id} className="pt-1.5 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.label}
                      </div>
                      <code className="text-[10px] text-slate-400 font-mono">{p.name}</code>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ADD ROLE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Novo Perfil de Acesso"
        description="Defina o nome do perfil e selecione as permissões granulares"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>
              Criar Perfil
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome de Exibição"
              placeholder="Ex: Auditor Financeiro"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              error={formErrors.label}
              required
            />
            <Input
              label="Identificador Técnico (Slug)"
              placeholder="Ex: financial_auditor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />
          </div>

          <Input
            label="Descrição do Perfil"
            placeholder="Descreva as responsabilidades e nível de acesso"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Granular Permission Checkboxes Grouped by Module */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Permissões Associadas ({formData.permissions.length} selecionadas)
            </label>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {modules.map((mod) => {
                const modPerms = permissions.filter((p) => p.module === mod);
                const allSelected = modPerms.every((p) => formData.permissions.includes(p.name));

                return (
                  <div
                    key={mod}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {mod}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleAllInModule(mod)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                      >
                        {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {modPerms.map((perm) => (
                        <Checkbox
                          key={perm.id}
                          label={perm.label}
                          description={perm.name}
                          checked={formData.permissions.includes(perm.name)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              permissions: checked
                                ? [...prev.permissions, perm.name]
                                : prev.permissions.filter((p) => p !== perm.name),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* EDIT ROLE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Editar Perfil: ${selectedRole?.label}`}
        description="Ajuste as permissões deste perfil de acesso"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} isLoading={isSubmitting}>
              Salvar Alterações
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nome de Exibição"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />

          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Granular Permission Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Permissões Associadas ({formData.permissions.length} selecionadas)
            </label>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {modules.map((mod) => {
                const modPerms = permissions.filter((p) => p.module === mod);
                const allSelected = modPerms.every((p) => formData.permissions.includes(p.name));

                return (
                  <div
                    key={mod}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {mod}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleAllInModule(mod)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                      >
                        {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {modPerms.map((perm) => (
                        <Checkbox
                          key={perm.id}
                          label={perm.label}
                          description={perm.name}
                          checked={formData.permissions.includes(perm.name)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              permissions: checked
                                ? [...prev.permissions, perm.name]
                                : prev.permissions.filter((p) => p !== perm.name),
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Perfil"
        message={`Deseja realmente excluir o perfil "${selectedRole?.label}"? Todos os usuários associados precisarão ter seus perfis reatribuídos.`}
        confirmText="Excluir Perfil"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
