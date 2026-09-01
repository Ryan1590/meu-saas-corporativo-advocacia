import React, { useState } from 'react';
import {
  MonitorCheck,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Lock,
  Layers,
  Eye,
  EyeOff,
  Terminal,
  Shield,
  ArrowRight,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card, Badge, Avatar } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { useAuth, ROUTE_PERMISSIONS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ScreenPermissionsView: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { user, can } = useAuth();
  const { success, error: toastError } = useToast();

  const [simulatedEndpoint, setSimulatedEndpoint] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    status: number;
    message: string;
    allowed: boolean;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Screen specifications matrix
  const screenRules = [
    {
      screen: 'Dashboard Principal',
      path: '/dashboard',
      permission: 'dashboard.view',
      description: 'Métricas executivas, gráficos de cadastros e feed recente.',
      actions: ['Visualizar KPIs', 'Ver Gráficos'],
    },
    {
      screen: 'Listagem de Usuários',
      path: '/users',
      permission: 'users.view',
      description: 'Tabela de membros, filtros por status/cargo e detalhes.',
      actions: ['Listar usuários', 'Pesquisar', 'Visualizar Ficha'],
    },
    {
      screen: 'Cadastro de Usuário',
      path: '/users/create',
      permission: 'users.create',
      description: 'Formulário com validação e criação de novas contas.',
      actions: ['Criar conta', 'Definir senha inicial'],
    },
    {
      screen: 'Edição de Usuário',
      path: '/users/edit',
      permission: 'users.edit',
      description: 'Modificar dados cadastrais e vincular novos perfis.',
      actions: ['Editar cadastro', 'Trocar perfil'],
    },
    {
      screen: 'Exclusão de Usuário',
      path: '/users/delete',
      permission: 'users.delete',
      description: 'Remoção permanente de contas (exceto o próprio usuário).',
      actions: ['Excluir registro', 'Revogar tokens'],
    },
    {
      screen: 'Perfis & Roles (RBAC)',
      path: '/roles',
      permission: 'roles.view',
      description: 'Gestão da matriz de cargos e permissões associadas.',
      actions: ['Listar roles', 'Criar role', 'Editar permissões'],
    },
    {
      screen: 'Logs de Auditoria',
      path: '/logs',
      permission: 'logs.view',
      description: 'Trilha forense de acessos, IPs, ações e payloads JSON.',
      actions: ['Consultar logs', 'Filtrar por IP/módulo'],
    },
    {
      screen: 'Configurações do Sistema & API',
      path: '/settings',
      permission: 'settings.view',
      description: 'Políticas de sessão, tokens Sanctum e segurança.',
      actions: ['Visualizar parâmetros', 'Gerar tokens API'],
    },
  ];

  // Test API authorization live for current active user
  const testApiEndpoint = async (actionName: string, permissionRequired: string, method: string, url: string) => {
    setIsSimulating(true);
    setSimulatedEndpoint(`${method} ${url}`);

    const hasAccess = can(permissionRequired);

    setTimeout(() => {
      if (hasAccess) {
        setSimulationResult({
          status: 200,
          message: `Requisição autorizada pelo Laravel Gate/Policy (permissão: ${permissionRequired})`,
          allowed: true,
        });
        success(`Ação "${actionName}" autorizada com sucesso!`);
      } else {
        setSimulationResult({
          status: 403,
          message: `HTTP 403 Forbidden: O usuário "${user?.name}" não possui a permissão "${permissionRequired}". Bloqueado pelo backend.`,
          allowed: false,
        });
        toastError(`Ação "${actionName}" bloqueada pelo backend (403 Forbidden)`);
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Title & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Controle de Acesso por Tela & Ação
            </h2>
            <Badge variant="indigo" size="sm">
              Multi-Camadas
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl">
            Demonstração em tempo real das 5 camadas de segurança: Ocultamento no menu, Proteção no Router, Policy no Backend Laravel, Bloqueio na API e Tratamento 403.
          </p>
        </div>

        {/* Current Role Indicator */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Avatar name={user?.name || 'Admin'} src={user?.avatar} size="sm" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {user?.name}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Perfil: {user?.rolesDetails?.[0]?.label || 'Operador'}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Security Layers Educational Banner */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { step: '1', title: 'Menu Dinâmico', desc: 'Item desaparece da sidebar se sem permissão' },
          { step: '2', title: 'Router Shield', desc: 'URL manual bloqueada com 403 Shield' },
          { step: '3', title: 'API Bloqueia', desc: 'Express/Laravel rejeita com HTTP 403' },
          { step: '4', title: 'Policy no Backend', desc: 'Laravel UserPolicy valida Gate::allows' },
          { step: '5', title: 'UX Amigável', desc: 'Toast e telas informativas sem stacktrace' },
        ].map((layer, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">
                {layer.step}
              </span>
              <span>{layer.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {layer.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Screen Matrix Table */}
      <Card
        title="Matriz de Acesso das Telas para o Perfil Atual"
        subtitle={`Exibindo status de autorização em tempo real para "${user?.name}"`}
      >
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Tela / Recurso</th>
                <th className="px-5 py-3">Permissão Requerida</th>
                <th className="px-5 py-3 text-center">Visível no Menu?</th>
                <th className="px-5 py-3 text-center">Acesso à URL?</th>
                <th className="px-5 py-3 text-center">Acesso à API?</th>
                <th className="px-5 py-3 text-right">Testar Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {screenRules.map((rule, idx) => {
                const isAllowed = can(rule.permission);

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isAllowed
                        ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                        : 'bg-rose-50/20 dark:bg-rose-950/10'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {rule.screen}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{rule.path}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{rule.description}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <code className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">
                        {rule.permission}
                      </code>
                    </td>

                    {/* Visible in menu */}
                    <td className="px-5 py-3.5 text-center">
                      {isAllowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Sim</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Oculto</span>
                        </span>
                      )}
                    </td>

                    {/* URL Route Access */}
                    <td className="px-5 py-3.5 text-center">
                      {isAllowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Liberado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>403 Shield</span>
                        </span>
                      )}
                    </td>

                    {/* API Access */}
                    <td className="px-5 py-3.5 text-center">
                      {isAllowed ? (
                        <Badge variant="success" size="sm">
                          HTTP 200 OK
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          HTTP 403 Forbidden
                        </Badge>
                      )}
                    </td>

                    {/* Action test */}
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={isAllowed ? 'outline' : 'secondary'}
                        size="xs"
                        onClick={() =>
                          testApiEndpoint(
                            rule.screen,
                            rule.permission,
                            'GET',
                            `/api/v1${rule.path.replace('/', '')}`
                          )
                        }
                      >
                        Simular API
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Simulation Output Console */}
      {simulatedEndpoint && simulationResult && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            simulationResult.allowed
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {simulationResult.allowed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">Resultado da Verificação de Autorização:</span>
                <Badge variant={simulationResult.allowed ? 'success' : 'danger'} size="sm">
                  Status: {simulationResult.status}
                </Badge>
              </div>
              <code className="block font-mono text-[11px] bg-white/70 dark:bg-slate-900/70 p-2 rounded border border-current/20">
                {simulatedEndpoint} → {simulationResult.message}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
