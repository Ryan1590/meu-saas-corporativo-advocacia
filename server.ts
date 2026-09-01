import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Seed Data & In-Memory Store ---

interface Permission {
  id: string;
  name: string;
  label: string;
  module: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  isSystem?: boolean;
  permissions: string[];
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  escritorioId?: string | null;
  name: string;
  email: string;
  password?: string;
  data_nascimento?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  roles: string[];
  roleIds?: string[];
  rolesDetails?: Role[];
  permissions?: string[];
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  emailVerifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

const permissionsList: Permission[] = [
  { id: 'perm-1', name: 'infos-user.view', label: 'Visualizar Infos User', module: 'infos-user', description: 'Permite visualizar o dashboard de informações de usuário' },
  { id: 'perm-2', name: 'users.view', label: 'Visualizar Usuários', module: 'users', description: 'Permite listar usuários' },
  { id: 'perm-3', name: 'users.create', label: 'Criar Usuários', module: 'users', description: 'Permite cadastrar novos usuários' },
  { id: 'perm-4', name: 'users.edit', label: 'Editar Usuários', module: 'users', description: 'Permite alterar dados de usuários' },
  { id: 'perm-5', name: 'users.delete', label: 'Excluir Usuários', module: 'users', description: 'Permite excluir usuários' },
  { id: 'perm-6', name: 'users.status', label: 'Alterar Status de Usuários', module: 'users', description: 'Permite alterar status ativo/inativo' },
  { id: 'perm-7', name: 'roles.view', label: 'Visualizar Perfis', module: 'roles', description: 'Permite visualizar perfis' },
  { id: 'perm-8', name: 'roles.create', label: 'Criar Perfis', module: 'roles', description: 'Permite criar novos perfis' },
  { id: 'perm-9', name: 'roles.edit', label: 'Editar Perfis', module: 'roles', description: 'Permite editar perfis' },
  { id: 'perm-10', name: 'roles.delete', label: 'Excluir Perfis', module: 'roles', description: 'Permite excluir perfis' },
  { id: 'perm-11', name: 'permissions.view', label: 'Visualizar Permissões', module: 'permissions', description: 'Permite visualizar matriz de permissões' },
  { id: 'perm-12', name: 'reports.view', label: 'Visualizar Relatórios', module: 'reports', description: 'Permite visualizar tela de relatórios' },
  { id: 'perm-13', name: 'reports.export', label: 'Exportar Relatórios', module: 'reports', description: 'Permite exportar relatórios para XLSX/CSV' },
  { id: 'perm-14', name: 'dashboard-juridico.view', label: 'Visualizar Dashboard Jurídico', module: 'dashboard-juridico', description: 'Permite visualizar métricas jurídicas' },
  { id: 'perm-15', name: 'logs.view', label: 'Visualizar Logs de Auditoria', module: 'logs', description: 'Permite visualizar trilha de auditoria' },
  { id: 'perm-16', name: 'settings.view', label: 'Visualizar Configurações', module: 'settings', description: 'Permite ver configurações do sistema' },
  { id: 'perm-17', name: 'settings.edit', label: 'Editar Configurações', module: 'settings', description: 'Permite alterar configurações do sistema' },
  { id: 'perm-18', name: 'api.view', label: 'Visualizar API Tester', module: 'api', description: 'Permite acessar o playground da API' },
  { id: 'perm-19', name: 'design-system.view', label: 'Visualizar Design System', module: 'design-system', description: 'Permite ver catálogo de componentes' },
  { id: 'perm-20', name: 'documentation.view', label: 'Visualizar Documentação', module: 'documentation', description: 'Permite ver documentação' },
  { id: 'perm-21', name: 'birthdays.view', label: 'Visualizar Aniversariantes', module: 'birthdays', description: 'Permite visualizar aniversariantes do mês' },
  { id: 'perm-22', name: 'clientes.view', label: 'Visualizar Clientes', module: 'clientes', description: 'Permite listar e consultar clientes' },
  { id: 'perm-23', name: 'clientes.create', label: 'Criar Clientes', module: 'clientes', description: 'Permite cadastrar clientes' },
  { id: 'perm-24', name: 'clientes.update', label: 'Editar Clientes', module: 'clientes', description: 'Permite editar clientes' },
  { id: 'perm-25', name: 'clientes.delete', label: 'Excluir Clientes', module: 'clientes', description: 'Permite excluir clientes' },
  { id: 'perm-26', name: 'clientes.restore', label: 'Restaurar Clientes', module: 'clientes', description: 'Permite restaurar clientes excluídos' },
  { id: 'perm-27', name: 'clientes.export', label: 'Exportar Clientes', module: 'clientes', description: 'Permite exportar lista de clientes' },
  { id: 'perm-28', name: 'advogados.view', label: 'Visualizar Advogados', module: 'advogados', description: 'Permite listar advogados' },
  { id: 'perm-29', name: 'advogados.create', label: 'Criar Advogados', module: 'advogados', description: 'Permite cadastrar advogados' },
  { id: 'perm-30', name: 'advogados.update', label: 'Editar Advogados', module: 'advogados', description: 'Permite editar advogados' },
  { id: 'perm-31', name: 'advogados.delete', label: 'Excluir Advogados', module: 'advogados', description: 'Permite excluir advogados' },
  { id: 'perm-32', name: 'status-processos.view', label: 'Visualizar Status de Processos', module: 'status-processos', description: 'Permite ver status cadastrados' },
  { id: 'perm-33', name: 'status-processos.create', label: 'Criar Status de Processos', module: 'status-processos', description: 'Permite criar status' },
  { id: 'perm-34', name: 'status-processos.update', label: 'Editar Status de Processos', module: 'status-processos', description: 'Permite editar status' },
  { id: 'perm-35', name: 'status-processos.delete', label: 'Excluir Status de Processos', module: 'status-processos', description: 'Permite excluir status' },
  { id: 'perm-36', name: 'processos.view', label: 'Visualizar Processos', module: 'processos', description: 'Permite listar e consultar processos' },
  { id: 'perm-37', name: 'processos.create', label: 'Criar Processos', module: 'processos', description: 'Permite cadastrar processos' },
  { id: 'perm-38', name: 'processos.update', label: 'Editar Processos', module: 'processos', description: 'Permite atualizar processos' },
  { id: 'perm-39', name: 'processos.delete', label: 'Excluir Processos', module: 'processos', description: 'Permite excluir processos' },
  { id: 'perm-40', name: 'processos.export', label: 'Exportar Processos', module: 'processos', description: 'Permite exportar dados de processos' },
  { id: 'perm-41', name: 'processo-movimentacoes.view', label: 'Visualizar Movimentações', module: 'processo-movimentacoes', description: 'Permite ver andamentos' },
  { id: 'perm-42', name: 'processo-movimentacoes.create', label: 'Criar Movimentações', module: 'processo-movimentacoes', description: 'Permite lançar andamentos' },
  { id: 'perm-43', name: 'processo-prazos.view', label: 'Visualizar Prazos', module: 'processo-prazos', description: 'Permite ver prazos de processos' },
  { id: 'perm-44', name: 'processo-prazos.create', label: 'Criar Prazos', module: 'processo-prazos', description: 'Permite agendar novos prazos' },
  { id: 'perm-45', name: 'contratos.view', label: 'Visualizar Contratos', module: 'contratos', description: 'Permite ver contratos e parcelas' },
  { id: 'perm-46', name: 'contratos.create', label: 'Criar Contratos', module: 'contratos', description: 'Permite cadastrar novos contratos' },
  { id: 'perm-47', name: 'contratos.update', label: 'Editar Contratos', module: 'contratos', description: 'Permite alterar contratos' },
  { id: 'perm-48', name: 'contratos.delete', label: 'Excluir Contratos', module: 'contratos', description: 'Permite excluir contratos' },
  { id: 'perm-49', name: 'pagamentos.view', label: 'Visualizar Pagamentos', module: 'pagamentos', description: 'Permite ver pagamentos' },
  { id: 'perm-50', name: 'pagamentos.create', label: 'Registrar Pagamentos', module: 'pagamentos', description: 'Permite registrar e quitar parcelas' },
  { id: 'perm-51', name: 'pagamentos.delete', label: 'Cancelar Pagamentos', module: 'pagamentos', description: 'Permite cancelar pagamentos' },
  { id: 'perm-52', name: 'documentos.view', label: 'Visualizar Documentos', module: 'documentos', description: 'Permite ver documentos' },
  { id: 'perm-53', name: 'documentos.create', label: 'Enviar Documentos', module: 'documentos', description: 'Permite fazer upload de anexos' },
  { id: 'perm-54', name: 'documentos.delete', label: 'Excluir Documentos', module: 'documentos', description: 'Permite excluir documentos' },
  { id: 'perm-55', name: 'tarefas.view', label: 'Visualizar Tarefas', module: 'tarefas', description: 'Permite ver tarefas' },
  { id: 'perm-56', name: 'tarefas.create', label: 'Criar Tarefas', module: 'tarefas', description: 'Permite cadastrar tarefas' },
  { id: 'perm-57', name: 'tarefas.update', label: 'Editar Tarefas', module: 'tarefas', description: 'Permite alterar tarefas' },
  { id: 'perm-58', name: 'tarefas.delete', label: 'Excluir Tarefas', module: 'tarefas', description: 'Permite excluir tarefas' },
  { id: 'perm-59', name: 'agenda.view', label: 'Visualizar Agenda', module: 'agenda', description: 'Permite ver eventos na agenda' },
  { id: 'perm-60', name: 'agenda.create', label: 'Criar Eventos na Agenda', module: 'agenda', description: 'Permite agendar reuniões e audiências' },
  { id: 'perm-61', name: 'agenda.update', label: 'Editar Eventos', module: 'agenda', description: 'Permite atualizar compromissos' },
  { id: 'perm-62', name: 'agenda.delete', label: 'Excluir Eventos', module: 'agenda', description: 'Permite excluir compromissos' },
  { id: 'perm-63', name: 'notifications.view', label: 'Visualizar Notificações', module: 'notifications', description: 'Permite ver notificações' },
  { id: 'perm-64', name: 'escritorios.view', label: 'Visualizar Escritório', module: 'escritorio', description: 'Permite ver dados do escritório' },
  { id: 'perm-65', name: 'escritorios.edit', label: 'Editar Escritório', module: 'escritorio', description: 'Permite editar dados do escritório' },
];

const allPermNames = permissionsList.map(p => p.name);

let rolesList: Role[] = [
  {
    id: 'role-admin',
    name: 'admin',
    label: 'Administrador',
    description: 'Acesso irrestrito a todas as áreas e módulos do sistema.',
    isSystem: true,
    permissions: allPermNames,
    usersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-manager',
    name: 'manager',
    label: 'Gerente Operacional / Sócio',
    description: 'Gerenciamento operacional pleno de usuários, clientes, processos, financeiro e relatórios.',
    isSystem: false,
    permissions: [
      'infos-user.view', 'users.view', 'users.create', 'users.edit', 'users.status',
      'clientes.view', 'clientes.create', 'clientes.update', 'clientes.export',
      'advogados.view', 'advogados.create', 'advogados.update',
      'processos.view', 'processos.create', 'processos.update', 'processos.export',
      'processo-movimentacoes.view', 'processo-movimentacoes.create',
      'processo-prazos.view', 'processo-prazos.create',
      'contratos.view', 'contratos.create', 'contratos.update',
      'pagamentos.view', 'pagamentos.create',
      'documentos.view', 'documentos.create', 'documentos.delete',
      'tarefas.view', 'tarefas.create', 'tarefas.update', 'tarefas.delete',
      'agenda.view', 'agenda.create', 'agenda.update', 'agenda.delete',
      'dashboard-juridico.view', 'reports.view', 'reports.export', 'logs.view',
      'birthdays.view', 'notifications.view', 'escritorios.view'
    ],
    usersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-operator',
    name: 'operator',
    label: 'Advogado / Analista Jurídico',
    description: 'Acesso operacional a clientes, processos, prazos, tarefas, agenda e documentos.',
    isSystem: false,
    permissions: [
      'infos-user.view', 'clientes.view', 'clientes.create', 'clientes.update',
      'advogados.view', 'processos.view', 'processos.create', 'processos.update',
      'processo-movimentacoes.view', 'processo-movimentacoes.create',
      'processo-prazos.view', 'processo-prazos.create',
      'contratos.view', 'documentos.view', 'documentos.create',
      'tarefas.view', 'tarefas.create', 'tarefas.update',
      'agenda.view', 'agenda.create', 'agenda.update',
      'reports.view', 'dashboard-juridico.view', 'birthdays.view', 'notifications.view'
    ],
    usersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-financial',
    name: 'financial',
    label: 'Financeiro',
    description: 'Gestão exclusiva de contratos, parcelas, quitações, emissão de recibos e relatórios contábeis.',
    isSystem: false,
    permissions: [
      'infos-user.view', 'clientes.view', 'processos.view',
      'contratos.view', 'contratos.create', 'contratos.update', 'contratos.delete',
      'pagamentos.view', 'pagamentos.create', 'pagamentos.delete',
      'documentos.view', 'reports.view', 'reports.export',
      'dashboard-juridico.view', 'notifications.view'
    ],
    usersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-assistant',
    name: 'assistant',
    label: 'Assistente / Estagiário',
    description: 'Consulta de clientes e processos, controle de tarefas, agenda e envio de documentos.',
    isSystem: false,
    permissions: [
      'infos-user.view', 'clientes.view', 'processos.view',
      'processo-movimentacoes.view', 'processo-prazos.view',
      'documentos.view', 'documentos.create',
      'tarefas.view', 'tarefas.create', 'tarefas.update',
      'agenda.view', 'agenda.create', 'birthdays.view', 'notifications.view'
    ],
    usersCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let escritorioData = {
  id: 'escritorio-1',
  nome: 'Escritório de Advocacia Silva & Associados',
  razao_social: 'Silva e Associados Sociedade de Advogados',
  razaoSocial: 'Silva e Associados Sociedade de Advogados',
  cnpj: '12.345.678/0001-90',
  oabNumero: '12345/SP',
  oabUf: 'SP',
  email: 'contato@silvaadvogados.com.br',
  telefone: '(11) 3214-5678',
  celular: '(11) 98765-4321',
  whatsapp: '(11) 98765-4321',
  cep: '01310-100',
  logradouro: 'Av. Paulista',
  numero: '1000',
  complemento: 'Conjunto 101',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let usersList: User[] = [
  {
    id: 'user-admin',
    escritorioId: 'escritorio-1',
    name: 'Administrador do Sistema',
    email: 'admin@empresa.com',
    data_nascimento: '1985-05-15',
    status: 'active',
    roles: ['admin', 'role-admin'],
    roleIds: ['role-admin'],
    rolesDetails: [rolesList[0]],
    permissions: allPermNames,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-manager',
    escritorioId: 'escritorio-1',
    name: 'Dra. Mariana Costa',
    email: 'mariana.costa@empresa.com',
    data_nascimento: '1990-08-22',
    status: 'active',
    roles: ['manager', 'role-manager'],
    roleIds: ['role-manager'],
    rolesDetails: [rolesList[1]],
    permissions: rolesList[1].permissions,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    lastLoginIp: '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-operator',
    escritorioId: 'escritorio-1',
    name: 'Dr. Lucas Ferreira',
    email: 'lucas.ferreira@empresa.com',
    data_nascimento: '1993-11-10',
    status: 'active',
    roles: ['operator', 'role-operator'],
    roleIds: ['role-operator'],
    rolesDetails: [rolesList[2]],
    permissions: rolesList[2].permissions,
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    lastLoginIp: '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-financial',
    escritorioId: 'escritorio-1',
    name: 'Paula Ramos (Financeiro)',
    email: 'paula.financeiro@empresa.com',
    data_nascimento: '1991-04-18',
    status: 'active',
    roles: ['financial', 'role-financial'],
    roleIds: ['role-financial'],
    rolesDetails: [rolesList[3]],
    permissions: rolesList[3].permissions,
    lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
    lastLoginIp: '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: false,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-assistant',
    escritorioId: 'escritorio-1',
    name: 'Bruno Estagiário',
    email: 'bruno.assistente@empresa.com',
    data_nascimento: '2001-09-25',
    status: 'active',
    roles: ['assistant', 'role-assistant'],
    roleIds: ['role-assistant'],
    rolesDetails: [rolesList[4]],
    permissions: rolesList[4].permissions,
    lastLoginAt: new Date(Date.now() - 28800000).toISOString(),
    lastLoginIp: '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let currentAuthUser: User = usersList[0];

// Authorization helper to enforce RBAC directly in server endpoints
function hasPermission(user: User, required: string | string[]): boolean {
  if (user.roles?.includes('admin') || user.roles?.includes('role-admin')) {
    return true;
  }
  const requiredList = Array.isArray(required) ? required : [required];
  const userPerms = user.permissions || [];
  return requiredList.some(reqPerm => {
    if (userPerms.includes(reqPerm)) return true;
    const [mod, act] = reqPerm.split('.');
    if (act === 'edit' && userPerms.includes(`${mod}.update`)) return true;
    if (act === 'update' && userPerms.includes(`${mod}.edit`)) return true;
    return false;
  });
}

function requirePermission(permission: string | string[], moduleName = 'system') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!hasPermission(currentAuthUser, permission)) {
      const permName = Array.isArray(permission) ? permission.join(' ou ') : permission;
      logActivity('unauthorized_access', moduleName, `Acesso não autorizado bloqueado pelo back-end na rota ${req.method} ${req.originalUrl}. Exige permissão: ${permName}`, req);
      return res.status(403).json({
        success: false,
        message: `Acesso não autorizado. Seu perfil de acesso não possui a permissão: ${permName}.`,
      });
    }
    next();
  };
}

let statusProcessosList = [
  { id: 'status-1', nome: 'Novo', descricao: 'Processo recém cadastrado', cor: '#3b82f6', ordem: 1, ativo: true },
  { id: 'status-2', nome: 'Em análise', descricao: 'Análise de documentação inicial', cor: '#eab308', ordem: 2, ativo: true },
  { id: 'status-3', nome: 'Em andamento', descricao: 'Ação protocolada e em tramitação', cor: '#6366f1', ordem: 3, ativo: true },
  { id: 'status-4', nome: 'Aguardando audiência', descricao: 'Audiência agendada', cor: '#8b5cf6', ordem: 4, ativo: true },
  { id: 'status-5', nome: 'Aguardando sentença', descricao: 'Fase conclusa para julgamento', cor: '#ec4899', ordem: 5, ativo: true },
  { id: 'status-6', nome: 'Recurso', descricao: 'Em grau de recurso', cor: '#f97316', ordem: 6, ativo: true },
  { id: 'status-7', nome: 'Encerrado', descricao: 'Processo com trânsito em julgado', cor: '#10b981', ordem: 7, ativo: true },
  { id: 'status-8', nome: 'Arquivado', descricao: 'Processo arquivado definitivamente', cor: '#64748b', ordem: 8, ativo: true },
];

let advogadosList = [
  {
    id: 'adv-1',
    nome: 'Dr. Roberto Silva',
    cpf: '123.456.789-01',
    email: 'roberto.silva@advocacia.com.br',
    telefone: '(11) 3333-4444',
    celular: '(11) 99887-1122',
    oabNumero: '123456',
    oabUf: 'SP',
    especialidade: 'Direito Tributário e Empresarial',
    status: 'active',
    observacoes: 'Sócio fundador',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adv-2',
    nome: 'Dra. Camila Nogueira',
    cpf: '234.567.890-12',
    email: 'camila.nogueira@advocacia.com.br',
    telefone: '(11) 3333-5555',
    celular: '(11) 99776-2233',
    oabNumero: '234567',
    oabUf: 'SP',
    especialidade: 'Direito Civil e Família',
    status: 'active',
    observacoes: 'Especialista em contratos',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adv-3',
    nome: 'Dr. André Martins',
    cpf: '345.678.901-23',
    email: 'andre.martins@advocacia.com.br',
    telefone: '(11) 3333-6666',
    celular: '(11) 99665-3344',
    oabNumero: '345678',
    oabUf: 'SP',
    especialidade: 'Direito Trabalhista e Previdenciário',
    status: 'active',
    observacoes: 'Atuação no TRT-2',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let clientesList = [
  {
    id: 'cli-1',
    tipoPessoa: 'PJ' as const,
    nome: null,
    razaoSocial: 'TechCorp Inovações Digitais S.A.',
    nomeFantasia: 'TechCorp Brasil',
    cpf: null,
    cnpj: '18.234.567/0001-89',
    rg: null,
    dataNascimento: null,
    email: 'juridico@techcorp.com.br',
    telefone: '(11) 3040-5060',
    celular: '(11) 97123-4567',
    whatsapp: '(11) 97123-4567',
    cep: '04571-010',
    logradouro: 'Av. Engenheiro Luís Carlos Berrini',
    numero: '1500',
    complemento: 'Andar 14',
    bairro: 'Brooklin',
    cidade: 'São Paulo',
    estado: 'SP',
    observacoes: 'Contrato mensal de assessoria empresarial e societária.',
    status: 'active' as const,
    processosCount: 3,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    tipoPessoa: 'PF' as const,
    nome: 'Juliana Medeiros Albuquerque',
    razaoSocial: null,
    nomeFantasia: null,
    cpf: '456.789.012-34',
    cnpj: null,
    rg: '29.876.543-2',
    dataNascimento: '1988-03-14',
    email: 'juliana.medeiros@gmail.com',
    telefone: '(11) 2345-6789',
    celular: '(11) 98234-5678',
    whatsapp: '(11) 98234-5678',
    cep: '01419-001',
    logradouro: 'Rua Bela Cintra',
    numero: '750',
    complemento: 'Apto 82',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    estado: 'SP',
    observacoes: 'Ação de inventário e partilha de bens familiares.',
    status: 'active' as const,
    processosCount: 1,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-3',
    tipoPessoa: 'PJ' as const,
    nome: null,
    razaoSocial: 'Logística Expressa Transcontinental Ltda.',
    nomeFantasia: 'TransExpress Log',
    cpf: null,
    cnpj: '24.987.654/0001-32',
    rg: null,
    dataNascimento: null,
    email: 'contato@transexpress.com.br',
    telefone: '(11) 2154-8796',
    celular: '(11) 98901-2345',
    whatsapp: '(11) 98901-2345',
    cep: '07190-100',
    logradouro: 'Rodovia Presidente Dutra',
    numero: 'Km 215',
    complemento: 'Galpão 4',
    bairro: 'Cumbica',
    cidade: 'Guarulhos',
    estado: 'SP',
    observacoes: 'Demandas trabalhistas e cíveis regulatórias.',
    status: 'active' as const,
    processosCount: 2,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let processosList = [
  {
    id: 'proc-1',
    numeroProcesso: '1002345-67.2026.8.26.0100',
    titulo: 'Ação Declaratória de Inexistência de Débito Tributário',
    descricao: 'Discussão sobre compensação de créditos de ICMS-ST e PIS/COFINS',
    tribunal: 'TJSP - Tribunal de Justiça de São Paulo',
    comarca: 'São Paulo - Capital',
    vara: '2ª Vara da Fazenda Pública',
    tipoAcao: 'Ordinária',
    areaJuridica: 'Tributário',
    assunto: 'ICMS / Crédito Tributário',
    dataDistribuicao: '2026-01-15',
    dataAbertura: '2026-01-10',
    dataEncerramento: null,
    valorCausa: 450000.00,
    valorHonorarios: 45000.00,
    observacoes: 'Liminar deferida suspendendo a exigibilidade do crédito tributário.',
    cliente: clientesList[0],
    status: statusProcessosList[2],
    advogados: [{ id: advogadosList[0].id, nome: advogadosList[0].nome, principal: true }],
    responsaveis: [{ id: usersList[0].id, nome: usersList[0].name }],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proc-2',
    numeroProcesso: '0010987-12.2026.5.02.0045',
    titulo: 'Reclamatória Trabalhista - Horas Extras e Equiparação',
    descricao: 'Ação movida por ex-coordenador logístico postulando verbas rescisórias',
    tribunal: 'TRT-2 - São Paulo',
    comarca: 'São Paulo',
    vara: '45ª Vara do Trabalho',
    tipoAcao: 'Trabalhista',
    areaJuridica: 'Trabalhista',
    assunto: 'Horas Extras / Adicional Noturno',
    dataDistribuicao: '2026-02-01',
    dataAbertura: '2026-01-25',
    dataEncerramento: null,
    valorCausa: 120000.00,
    valorHonorarios: 18000.00,
    observacoes: 'Audiência de instrução designada para março de 2026.',
    cliente: clientesList[2],
    status: statusProcessosList[3],
    advogados: [{ id: advogadosList[2].id, nome: advogadosList[2].nome, principal: true }],
    responsaveis: [{ id: usersList[1].id, nome: usersList[1].name }],
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proc-3',
    numeroProcesso: '1014567-89.2026.8.26.0002',
    titulo: 'Ação de Inventário e Partilha Judicial',
    descricao: 'Inventário judicial de espólio com múltiplos imóveis e cotas sociais',
    tribunal: 'TJSP - Foro Regional de Santo Amaro',
    comarca: 'São Paulo',
    vara: '1ª Vara da Família e Sucessões',
    tipoAcao: 'Inventário',
    areaJuridica: 'Família e Sucessões',
    assunto: 'Inventário / Partilha de Bens',
    dataDistribuicao: '2026-01-20',
    dataAbertura: '2026-01-18',
    dataEncerramento: null,
    valorCausa: 1850000.00,
    valorHonorarios: 92500.00,
    observacoes: 'Primeiras declarações protocoladas, aguardando manifestação da Fazenda Estadual.',
    cliente: clientesList[1],
    status: statusProcessosList[2],
    advogados: [{ id: advogadosList[1].id, nome: advogadosList[1].nome, principal: true }],
    responsaveis: [{ id: usersList[2].id, nome: usersList[2].name }],
    createdAt: new Date(Date.now() - 32 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let movimentacoesList = [
  {
    id: 'mov-1',
    processoId: 'proc-1',
    dataMovimentacao: '2026-02-18T14:30:00Z',
    tipo: 'Decisão / Despacho',
    titulo: 'Concessão de Tutela Provisória de Urgência',
    descricao: 'Deferido o pedido liminar para suspender protestos e garantir certidão positiva com efeitos de negativa.',
    origem: 'Juízo da 2ª Vara da Fazenda Pública',
    responsavel: { id: usersList[0].id, name: usersList[0].name },
  },
  {
    id: 'mov-2',
    processoId: 'proc-2',
    dataMovimentacao: '2026-02-25T10:15:00Z',
    tipo: 'Publicação',
    titulo: 'Designação de Audiência Una',
    descricao: 'Intimação das partes para comparecimento em audiência presencial de instrução.',
    origem: 'Secretaria da 45ª Vara do Trabalho',
    responsavel: { id: usersList[1].id, name: usersList[1].name },
  },
];

let prazosList = [
  {
    id: 'prazo-1',
    processoId: 'proc-1',
    titulo: 'Apresentar Réplica à Contestação',
    descricao: 'Impugnar teses defensivas apresentadas pela Procuradoria Geral do Estado.',
    dataInicio: '2026-03-01',
    dataVencimento: '2026-03-15',
    status: 'pendente',
    prioridade: 'alta',
    responsavel: { id: usersList[0].id, name: usersList[0].name },
  },
  {
    id: 'prazo-2',
    processoId: 'proc-2',
    titulo: 'Protocolar Rol de Testemunhas',
    descricao: 'Juntar qualificação completa de duas testemunhas para audiência trabalhista.',
    dataInicio: '2026-03-02',
    dataVencimento: '2026-03-10',
    status: 'pendente',
    prioridade: 'urgente',
    responsavel: { id: usersList[1].id, name: usersList[1].name },
  },
];

let contratosList = [
  {
    id: 'cont-1',
    numero: 'CT-2026/001',
    descricao: 'Prestação de Serviços Jurídicos Contencioso Tributário',
    dataInicio: '2026-01-10',
    dataFim: '2027-01-10',
    valorTotal: 45000.00,
    formaPagamento: 'Parcelado (10x)',
    status: 'vigente',
    observacoes: 'Honorários fixos + 10% de êxito.',
    cliente: clientesList[0],
    processo: processosList[0],
  },
  {
    id: 'cont-2',
    numero: 'CT-2026/002',
    descricao: 'Honorários Advocatícios - Defesa Trabalhista',
    dataInicio: '2026-01-25',
    dataFim: '2026-12-31',
    valorTotal: 18000.00,
    formaPagamento: 'Parcelado (6x)',
    status: 'vigente',
    observacoes: 'Defesa e acompanhamento até sentença de 1º grau.',
    cliente: clientesList[2],
    processo: processosList[1],
  },
];

let parcelasList = [
  {
    id: 'parc-1',
    contratoId: 'cont-1',
    numero: 1,
    descricao: 'Parcela 01/10',
    valor: 4500.00,
    dataVencimento: '2026-02-10',
    dataPagamento: '2026-02-09',
    status: 'pago',
    formaPagamento: 'PIX',
    observacoes: 'Pago com pontualidade',
  },
  {
    id: 'parc-2',
    contratoId: 'cont-1',
    numero: 2,
    descricao: 'Parcela 02/10',
    valor: 4500.00,
    dataVencimento: '2026-03-10',
    dataPagamento: null,
    status: 'aberto',
    formaPagamento: 'Boleto Bancário',
    observacoes: 'Boleto emitido',
  },
  {
    id: 'parc-3',
    contratoId: 'cont-2',
    numero: 1,
    descricao: 'Parcela 01/06',
    valor: 3000.00,
    dataVencimento: '2026-02-28',
    dataPagamento: '2026-02-28',
    status: 'pago',
    formaPagamento: 'Transferência Bancária',
    observacoes: 'Confirmado pelo financeiro',
  },
  {
    id: 'parc-4',
    contratoId: 'cont-2',
    numero: 2,
    descricao: 'Parcela 02/06',
    valor: 3000.00,
    dataVencimento: '2026-03-28',
    dataPagamento: null,
    status: 'aberto',
    formaPagamento: 'Boleto Bancário',
    observacoes: '',
  },
];

let pagamentosList = [
  {
    id: 'pag-1',
    parcelaId: 'parc-1',
    valor: 4500.00,
    dataPagamento: '2026-02-09',
    formaPagamento: 'PIX',
    observacoes: 'Comprovante anexado',
  },
  {
    id: 'pag-2',
    parcelaId: 'parc-3',
    valor: 3000.00,
    dataPagamento: '2026-02-28',
    formaPagamento: 'Transferência TED',
    observacoes: 'Liquidação confirmada',
  },
];

let tarefasList = [
  {
    id: 'tar-1',
    titulo: 'Revisar minuta de embargos à execução fiscal',
    descricao: 'Conferir cálculos anexos de encargos moratórios e jurisprudência do STJ',
    prioridade: 'alta' as const,
    status: 'em_andamento' as const,
    dataInicio: '2026-03-01',
    dataVencimento: '2026-03-05',
    observacoes: 'Atenção ao prazo preclusivo',
    processo: processosList[0],
    cliente: clientesList[0],
    responsavel: { id: usersList[0].id, name: usersList[0].name },
  },
  {
    id: 'tar-2',
    titulo: 'Entrevistar testemunhas da reclamada',
    descricao: 'Alinhar depoimentos e esclarecer pontos controversos da petição inicial',
    prioridade: 'media' as const,
    status: 'a_fazer' as const,
    dataInicio: '2026-03-04',
    dataVencimento: '2026-03-08',
    observacoes: 'Agendar via Google Meet ou presencial',
    processo: processosList[1],
    cliente: clientesList[2],
    responsavel: { id: usersList[1].id, name: usersList[1].name },
  },
  {
    id: 'tar-3',
    titulo: 'Solicitar certidões negativas de débito municipal',
    descricao: 'Emitir CND no portal da Prefeitura para instrução do inventário',
    prioridade: 'baixa' as const,
    status: 'concluida' as const,
    dataInicio: '2026-02-20',
    dataVencimento: '2026-02-26',
    observacoes: 'Certidões salvas na pasta do processo',
    processo: processosList[2],
    cliente: clientesList[1],
    responsavel: { id: usersList[2].id, name: usersList[2].name },
  },
];

let agendaEventosList = [
  {
    id: 'evt-1',
    titulo: 'Audiência de Instrução e Julgamento - TRT-2',
    descricao: 'Audiência telepresencial da Reclamatória Trabalhista',
    tipo: 'Audiência',
    dataInicio: '2026-03-12T14:00:00',
    dataFim: '2026-03-12T15:30:00',
    local: 'Sala Virtual TRT-2 (Zoom/Teams)',
    status: 'agendado' as const,
    processo: processosList[1],
    cliente: clientesList[2],
    responsavel: { id: usersList[1].id, name: usersList[1].name },
  },
  {
    id: 'evt-2',
    titulo: 'Reunião de Alinhamento Tributário com Diretoria Financeira',
    descricao: 'Apresentação do parecer sobre riscos e estratégia de sustentação oral',
    tipo: 'Reunião com Cliente',
    dataInicio: '2026-03-06T10:00:00',
    dataFim: '2026-03-06T11:30:00',
    local: 'Sede da TechCorp - Av. Berrini',
    status: 'agendado' as const,
    processo: processosList[0],
    cliente: clientesList[0],
    responsavel: { id: usersList[0].id, name: usersList[0].name },
  },
];

let documentosList = [
  {
    id: 'doc-1',
    nome: 'Contrato_Social_TechCorp_Consolidado.pdf',
    nomeOriginal: 'Contrato_Social_TechCorp_Consolidado.pdf',
    tipo: 'Contrato Social',
    categoria: 'Societário',
    mimeType: 'application/pdf',
    tamanho: 2450000,
    descricao: 'Última alteração contratual registrada na JUCESP',
    downloadUrl: '/api/v1/documentos/doc-1/download',
    cliente: clientesList[0],
    processo: processosList[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    nome: 'Procuracao_Ad_Judicia_Juliana_Medeiros.pdf',
    nomeOriginal: 'Procuracao_Ad_Judicia_Juliana_Medeiros.pdf',
    tipo: 'Procuração',
    categoria: 'Processual',
    mimeType: 'application/pdf',
    tamanho: 820000,
    descricao: 'Procuração com poderes especiais para inventário',
    downloadUrl: '/api/v1/documentos/doc-2/download',
    cliente: clientesList[1],
    processo: processosList[2],
    createdAt: new Date().toISOString(),
  },
];

let notificacoesList = [
  {
    id: 'notif-1',
    type: 'prazo_proximo',
    data: {
      titulo: 'Prazo processual em 4 dias',
      mensagem: 'Protocolar Rol de Testemunhas no processo 0010987-12.2026.5.02.0045.',
      processoId: 'proc-2',
    },
    readAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    type: 'audiencia_agendada',
    data: {
      titulo: 'Audiência agendada no TRT-2',
      mensagem: 'Audiência designada para 12/03/2026 às 14:00.',
      processoId: 'proc-2',
    },
    readAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let activityLogsList = [
  {
    id: 'log-1',
    userId: usersList[0].id,
    userName: usersList[0].name,
    userEmail: usersList[0].email,
    action: 'login',
    module: 'auth',
    description: 'Usuário realizou autenticação com sucesso no sistema.',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-2',
    userId: usersList[0].id,
    userName: usersList[0].name,
    userEmail: usersList[0].email,
    action: 'created',
    module: 'processos',
    description: 'Cadastrou o processo 1002345-67.2026.8.26.0100 (Ação Tributária).',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'log-3',
    userId: usersList[1].id,
    userName: usersList[1].name,
    userEmail: usersList[1].email,
    action: 'updated',
    module: 'tarefas',
    description: 'Alterou status da tarefa de entrevista para em andamento.',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

let systemSettings = {
  appName: 'Meu SaaS Corporativo Advocacia',
  companyName: 'Silva & Associados Advocacia',
  supportEmail: 'suporte@silvaadvogados.com.br',
  timezone: 'America/Sao_Paulo',
  dateFormat: 'DD/MM/YYYY',
  sessionLifetimeMinutes: 120,
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireTwoFactorForAdmins: false,
  enableAuditLogging: true,
  rateLimitPerMinute: 60,
};

function logActivity(action: string, module: string, description: string, req: express.Request) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: currentAuthUser.id,
    userName: currentAuthUser.name,
    userEmail: currentAuthUser.email,
    action,
    module,
    description,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown Browser',
    createdAt: new Date().toISOString(),
  };
  activityLogsList.unshift(newLog);
  if (activityLogsList.length > 500) activityLogsList.pop();
}

// --- API Router Definition ---
const api = express.Router();

// 1. Auth endpoints
api.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = usersList.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    // If not found, check if it's admin login with demo credentials
    if (email === 'admin@empresa.com') {
      currentAuthUser = usersList[0];
      return res.json({
        success: true,
        data: {
          token: 'demo-token-' + Date.now(),
          user: usersList[0],
        },
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas. Verifique seu e-mail e senha.',
    });
  }

  currentAuthUser = user;
  logActivity('login', 'auth', `Usuário ${user.name} efetuou login no sistema.`, req);

  res.json({
    success: true,
    data: {
      token: 'demo-token-' + user.id + '-' + Date.now(),
      user: {
        ...user,
        rolesDetails: rolesList.filter(r => user.roles.includes(r.name) || user.roles.includes(r.id)),
      },
    },
  });
});

api.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(422).json({
      success: false,
      message: 'Nome e e-mail são obrigatórios para cadastro.',
    });
  }

  const existing = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(422).json({
      success: false,
      message: 'Este e-mail já está cadastrado no sistema.',
    });
  }

  const operatorRole = rolesList.find(r => r.name === 'operator') || rolesList[0];
  const newUser: User = {
    id: `user-${Date.now()}`,
    escritorioId: 'escritorio-1',
    name,
    email,
    data_nascimento: '1995-01-01',
    status: 'active',
    roles: [operatorRole.name, operatorRole.id],
    roleIds: [operatorRole.id],
    rolesDetails: [operatorRole],
    permissions: operatorRole.permissions,
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: req.ip || '127.0.0.1',
    emailVerifiedAt: new Date().toISOString(),
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersList.push(newUser);
  currentAuthUser = newUser;
  logActivity('created', 'auth', `Novo usuário ${name} se cadastrou no sistema.`, req);

  res.status(201).json({
    success: true,
    message: 'Usuário cadastrado com sucesso!',
    data: {
      token: 'token-' + newUser.id,
      user: newUser,
    },
  });
});

api.post('/auth/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Se o e-mail informado estiver cadastrado, as instruções de recuperação foram enviadas.',
  });
});

api.post('/auth/reset-password', (req, res) => {
  res.json({
    success: true,
    message: 'Senha redefinida com sucesso. Faça login com suas novas credenciais.',
  });
});

api.get('/auth/user', (req, res) => {
  const userWithRoles = {
    ...currentAuthUser,
    rolesDetails: rolesList.filter(r => currentAuthUser.roles.includes(r.name) || currentAuthUser.roles.includes(r.id)),
  };
  res.json({
    success: true,
    data: userWithRoles,
  });
});

api.post('/auth/logout', (req, res) => {
  logActivity('logout', 'auth', `Usuário ${currentAuthUser.name} encerrou a sessão.`, req);
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

api.post('/auth/sessions/terminate-others', (req, res) => {
  res.json({ success: true, message: 'Todas as outras sessões foram desconectadas.' });
});

api.post('/auth/switch-demo-user', (req, res) => {
  const { userId } = req.body;
  const targetUser = usersList.find(u => u.id === userId || u.roles.includes(userId));
  if (targetUser) {
    currentAuthUser = targetUser;
    logActivity('switch_user', 'auth', `Alternou para o usuário ${targetUser.name}.`, req);
    return res.json({
      success: true,
      data: {
        ...targetUser,
        rolesDetails: rolesList.filter(r => targetUser.roles.includes(r.name) || targetUser.roles.includes(r.id)),
      },
    });
  }
  res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
});

api.put('/auth/profile', (req, res) => {
  const { name, email, data_nascimento } = req.body;
  if (name) currentAuthUser.name = name;
  if (email) currentAuthUser.email = email;
  if (data_nascimento !== undefined) currentAuthUser.data_nascimento = data_nascimento;
  currentAuthUser.updatedAt = new Date().toISOString();

  // update in usersList
  const idx = usersList.findIndex(u => u.id === currentAuthUser.id);
  if (idx !== -1) usersList[idx] = { ...currentAuthUser };

  logActivity('updated', 'auth', 'Usuário atualizou dados do próprio perfil.', req);
  res.json({ success: true, data: currentAuthUser });
});

// 2. Metrics & Dashboards
api.get('/infos-user/metrics', (req, res) => {
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === 'active').length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalRoles = rolesList.length;

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      recentLoginsCount: 18,
      usersGrowthPercentage: 12.5,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 100,
      registrationsOverTime: [
        { date: 'Jan 2026', users: 1, active: 1 },
        { date: 'Fev 2026', users: 2, active: 2 },
        { date: 'Mar 2026', users: totalUsers, active: activeUsers },
      ],
      usersByRole: rolesList.map((r, i) => ({
        role: r.label,
        count: usersList.filter(u => u.roles.includes(r.name) || u.roles.includes(r.id)).length,
        color: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'][i % 4],
      })),
      activityByModule: [
        { module: 'Processos', count: 42 },
        { module: 'Clientes', count: 28 },
        { module: 'Tarefas', count: 35 },
        { module: 'Agenda', count: 19 },
        { module: 'Financeiro', count: 14 },
      ],
      recentUsers: usersList.slice(0, 5),
      recentActivities: activityLogsList.slice(0, 10),
    },
  });
});

api.get('/dashboard-juridico/metrics', (req, res) => {
  const clientesAtivos = clientesList.filter(c => c.status === 'active').length;
  const processosPorStatus: Record<string, number> = {};
  statusProcessosList.forEach(st => {
    processosPorStatus[st.nome] = processosList.filter(p => p.status?.id === st.id || p.status?.nome === st.nome).length;
  });

  const tarefasPendentes = tarefasList.filter(t => (t.status as string) !== 'concluida' && (t.status as string) !== 'cancelada').length;
  const valoresReceber = parcelasList.filter(p => p.status === 'aberto').reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const valoresAtraso = 0;

  res.json({
    success: true,
    data: {
      clientesAtivos,
      processosPorStatus,
      prazos: {
        hoje: 0,
        proximos: prazosList.length,
        vencidos: 0,
      },
      tarefasPendentes,
      agendaProxima: agendaEventosList.map(ev => ({
        id: ev.id,
        titulo: ev.titulo,
        tipo: ev.tipo,
        data_inicio: ev.dataInicio,
      })),
      valores: {
        a_receber: valoresReceber,
        em_atraso: valoresAtraso,
      },
    },
  });
});

api.get('/birthdays', (req, res) => {
  const usersWithBirthdays = usersList.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    data_nascimento: u.data_nascimento || '1990-05-15',
    roles: u.roles,
  }));
  res.json({ success: true, data: usersWithBirthdays });
});

// Helper for pagination & search
function paginate<T>(items: T[], req: express.Request, filterFn?: (item: T) => boolean) {
  let filtered = items;
  if (filterFn) filtered = filtered.filter(filterFn);

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const perPage = Math.max(1, parseInt(req.query.per_page as string) || 5);
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(from + perPage - 1, total);
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  return {
    success: true,
    data,
    meta: {
      currentPage: page,
      lastPage,
      perPage,
      total,
      from,
      to,
    },
  };
}

// 3. Users CRUD
api.get('/users', requirePermission('users.view', 'users'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const status = req.query.status as string;
  const role = req.query.role as string;

  const result = paginate(usersList, req, (u) => {
    if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) return false;
    if (status && status !== 'all' && u.status !== status) return false;
    if (role && role !== 'all' && !u.roles.includes(role)) return false;
    return true;
  });

  res.json(result);
});

api.post('/users', requirePermission('users.create', 'users'), (req, res) => {
  const { name, email, data_nascimento, status, roles, avatar } = req.body;
  if (!name || !email) {
    return res.status(422).json({ success: false, message: 'Nome e E-mail são obrigatórios.' });
  }

  const selectedRoles = rolesList.filter(r => (roles || []).includes(r.id) || (roles || []).includes(r.name));
  const aggregatedPerms = Array.from(new Set(selectedRoles.flatMap(r => r.permissions)));

  const newUser: User = {
    id: `user-${Date.now()}`,
    escritorioId: 'escritorio-1',
    name,
    email,
    data_nascimento: data_nascimento || null,
    status: status || 'active',
    avatar: avatar || undefined,
    roles: roles || ['operator'],
    roleIds: selectedRoles.map(r => r.id),
    rolesDetails: selectedRoles,
    permissions: aggregatedPerms,
    lastLoginAt: null,
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersList.unshift(newUser);
  logActivity('created', 'users', `Cadastrou o usuário ${name} (${email}).`, req);
  res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!', data: newUser });
});

api.get('/users/:id', requirePermission('users.view', 'users'), (req, res) => {
  const u = usersList.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
  res.json({ success: true, data: u });
});

api.put('/users/:id', requirePermission('users.edit', 'users'), (req, res) => {
  const idx = usersList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });

  const { name, email, data_nascimento, status, roles, avatar } = req.body;
  const current = usersList[idx];

  const selectedRoles = rolesList.filter(r => (roles || current.roles).includes(r.id) || (roles || current.roles).includes(r.name));
  const aggregatedPerms = Array.from(new Set(selectedRoles.flatMap(r => r.permissions)));

  usersList[idx] = {
    ...current,
    name: name ?? current.name,
    email: email ?? current.email,
    data_nascimento: data_nascimento !== undefined ? data_nascimento : current.data_nascimento,
    status: status ?? current.status,
    avatar: avatar !== undefined ? avatar : current.avatar,
    roles: roles ?? current.roles,
    rolesDetails: selectedRoles,
    permissions: aggregatedPerms,
    updatedAt: new Date().toISOString(),
  };

  logActivity('updated', 'users', `Atualizou os dados do usuário ${usersList[idx].name}.`, req);
  res.json({ success: true, message: 'Usuário atualizado com sucesso!', data: usersList[idx] });
});

api.delete('/users/:id', requirePermission('users.delete', 'users'), (req, res) => {
  const idx = usersList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
  const deleted = usersList.splice(idx, 1)[0];
  logActivity('deleted', 'users', `Excluiu o usuário ${deleted.name}.`, req);
  res.json({ success: true, message: 'Usuário excluído com sucesso.' });
});

api.patch('/users/:id/status', requirePermission('users.status', 'users'), (req, res) => {
  const u = usersList.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
  const { status } = req.body;
  u.status = status;
  u.updatedAt = new Date().toISOString();
  logActivity('status_changed', 'users', `Alterou o status do usuário ${u.name} para ${status}.`, req);
  res.json({ success: true, message: `Status alterado para ${status}.`, data: u });
});

api.post('/users/:id/reset-password', requirePermission('users.edit', 'users'), (req, res) => {
  const u = usersList.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
  logActivity('password_reset', 'users', `Enviou redefinição de senha para ${u.email}.`, req);
  res.json({ success: true, message: `E-mail de redefinição enviado para ${u.email}.` });
});

// 4. Clientes CRUD
api.get('/clientes', requirePermission('clientes.view', 'clientes'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const status = req.query.status as string;
  const tipo = req.query.tipo as string;

  const result = paginate(clientesList, req, (c) => {
    if (search) {
      const matchNome = (c.nome || '').toLowerCase().includes(search);
      const matchRazao = (c.razaoSocial || '').toLowerCase().includes(search);
      const matchCpf = (c.cpf || '').includes(search);
      const matchCnpj = (c.cnpj || '').includes(search);
      if (!matchNome && !matchRazao && !matchCpf && !matchCnpj) return false;
    }
    if (status && status !== 'all' && c.status !== status) return false;
    if (tipo && tipo !== 'all' && c.tipoPessoa !== tipo) return false;
    return true;
  });

  res.json(result);
});

api.post('/clientes', requirePermission('clientes.create', 'clientes'), (req, res) => {
  const body = req.body;
  const newCliente = {
    id: `cli-${Date.now()}`,
    tipoPessoa: body.tipoPessoa || 'PF',
    nome: body.nome || null,
    razaoSocial: body.razaoSocial || null,
    nomeFantasia: body.nomeFantasia || null,
    cpf: body.cpf || null,
    cnpj: body.cnpj || null,
    rg: body.rg || null,
    dataNascimento: body.dataNascimento || null,
    email: body.email || null,
    telefone: body.telefone || null,
    celular: body.celular || null,
    whatsapp: body.whatsapp || null,
    cep: body.cep || null,
    logradouro: body.logradouro || null,
    numero: body.numero || null,
    complemento: body.complemento || null,
    bairro: body.bairro || null,
    cidade: body.cidade || null,
    estado: body.estado || null,
    observacoes: body.observacoes || null,
    status: body.status || 'active',
    processosCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clientesList.unshift(newCliente);
  logActivity('created', 'clientes', `Cadastrou o cliente ${newCliente.nome || newCliente.razaoSocial}.`, req);
  res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso!', data: newCliente });
});

api.get('/clientes/:id', requirePermission('clientes.view', 'clientes'), (req, res) => {
  const c = clientesList.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
  res.json({ success: true, data: c });
});

api.put('/clientes/:id', requirePermission('clientes.update', 'clientes'), (req, res) => {
  const idx = clientesList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });

  clientesList[idx] = {
    ...clientesList[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  logActivity('updated', 'clientes', `Atualizou o cliente ${clientesList[idx].nome || clientesList[idx].razaoSocial}.`, req);
  res.json({ success: true, message: 'Cliente atualizado com sucesso!', data: clientesList[idx] });
});

api.delete('/clientes/:id', requirePermission('clientes.delete', 'clientes'), (req, res) => {
  const idx = clientesList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
  const c = clientesList.splice(idx, 1)[0];
  logActivity('deleted', 'clientes', `Excluiu o cliente ${c.nome || c.razaoSocial}.`, req);
  res.json({ success: true, message: 'Cliente excluído com sucesso.' });
});

api.post('/clientes/:id/restore', requirePermission('clientes.restore', 'clientes'), (req, res) => {
  res.json({ success: true, message: 'Cliente restaurado com sucesso.' });
});

api.get('/clientes/:id/processos', requirePermission('processos.view', 'clientes'), (req, res) => {
  const procs = processosList.filter(p => p.cliente?.id === req.params.id);
  res.json({ success: true, data: procs });
});

api.get('/clientes/:id/documentos', requirePermission('documentos.view', 'clientes'), (req, res) => {
  const docs = documentosList.filter(d => d.cliente?.id === req.params.id);
  res.json({ success: true, data: docs });
});

api.get('/clientes/:id/contratos', requirePermission('contratos.view', 'clientes'), (req, res) => {
  const conts = contratosList.filter(c => c.cliente?.id === req.params.id);
  res.json({ success: true, data: conts });
});

api.get('/clientes/:id/financeiro', requirePermission('contratos.view', 'clientes'), (req, res) => {
  const conts = contratosList.filter(c => c.cliente?.id === req.params.id || (c as any).clienteId === req.params.id);
  const contIds = new Set(conts.map(c => c.id));
  const parcs = parcelasList.filter(p => contIds.has(p.contratoId) || contIds.has((p as any).contrato?.id));
  const parcIds = new Set(parcs.map(p => p.id));
  const pags = pagamentosList.filter(pg => parcIds.has(pg.parcelaId));

  const totalContratado = conts.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0);
  const totalPago = pags.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const totalPendente = Math.max(0, totalContratado - totalPago);

  res.json({
    success: true,
    data: {
      contratos: conts,
      parcelas: parcs,
      pagamentos: pags,
      totalContratado,
      totalPago,
      totalPendente,
    },
  });
});

// 5. Advogados CRUD
api.get('/advogados', requirePermission('advogados.view', 'advogados'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const result = paginate(advogadosList, req, (a) => {
    if (search && !a.nome.toLowerCase().includes(search) && !(a.oabNumero || '').includes(search)) return false;
    return true;
  });
  res.json(result);
});

api.post('/advogados', requirePermission('advogados.create', 'advogados'), (req, res) => {
  const newAdv = {
    id: `adv-${Date.now()}`,
    ...req.body,
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  advogadosList.unshift(newAdv);
  logActivity('created', 'advogados', `Cadastrou o advogado ${newAdv.nome}.`, req);
  res.status(201).json({ success: true, message: 'Advogado cadastrado com sucesso!', data: newAdv });
});

api.get('/advogados/:id', requirePermission('advogados.view', 'advogados'), (req, res) => {
  const adv = advogadosList.find(x => x.id === req.params.id);
  if (!adv) return res.status(404).json({ success: false, message: 'Advogado não encontrado.' });
  res.json({ success: true, data: adv });
});

api.put('/advogados/:id', requirePermission('advogados.update', 'advogados'), (req, res) => {
  const idx = advogadosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Advogado não encontrado.' });
  advogadosList[idx] = { ...advogadosList[idx], ...req.body, updatedAt: new Date().toISOString() };
  logActivity('updated', 'advogados', `Atualizou o advogado ${advogadosList[idx].nome}.`, req);
  res.json({ success: true, message: 'Advogado atualizado!', data: advogadosList[idx] });
});

api.delete('/advogados/:id', requirePermission('advogados.delete', 'advogados'), (req, res) => {
  const idx = advogadosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Advogado não encontrado.' });
  const a = advogadosList.splice(idx, 1)[0];
  logActivity('deleted', 'advogados', `Excluiu o advogado ${a.nome}.`, req);
  res.json({ success: true, message: 'Advogado excluído com sucesso.' });
});

api.post('/advogados/:id/restore', requirePermission('advogados.create', 'advogados'), (req, res) => {
  res.json({ success: true, message: 'Advogado restaurado com sucesso.' });
});

// 6. Status Processos CRUD
api.get('/status-processos', requirePermission('status-processos.view', 'status-processos'), (req, res) => {
  res.json({ success: true, data: statusProcessosList });
});

api.post('/status-processos', requirePermission('status-processos.create', 'status-processos'), (req, res) => {
  const newSt = {
    id: `status-${Date.now()}`,
    nome: req.body.nome,
    descricao: req.body.descricao || '',
    cor: req.body.cor || '#6366f1',
    ordem: req.body.ordem || statusProcessosList.length + 1,
    ativo: req.body.ativo !== undefined ? req.body.ativo : true,
  };
  statusProcessosList.push(newSt);
  logActivity('created', 'status-processos', `Criou o status ${newSt.nome}.`, req);
  res.status(201).json({ success: true, message: 'Status criado com sucesso!', data: newSt });
});

api.get('/status-processos/:id', requirePermission('status-processos.view', 'status-processos'), (req, res) => {
  const st = statusProcessosList.find(x => x.id === req.params.id);
  if (!st) return res.status(404).json({ success: false, message: 'Status não encontrado.' });
  res.json({ success: true, data: st });
});

api.put('/status-processos/:id', requirePermission('status-processos.update', 'status-processos'), (req, res) => {
  const idx = statusProcessosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Status não encontrado.' });
  statusProcessosList[idx] = { ...statusProcessosList[idx], ...req.body };
  logActivity('updated', 'status-processos', `Atualizou o status ${statusProcessosList[idx].nome}.`, req);
  res.json({ success: true, message: 'Status atualizado com sucesso!', data: statusProcessosList[idx] });
});

api.delete('/status-processos/:id', requirePermission('status-processos.delete', 'status-processos'), (req, res) => {
  const idx = statusProcessosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Status não encontrado.' });
  const st = statusProcessosList.splice(idx, 1)[0];
  logActivity('deleted', 'status-processos', `Excluiu o status ${st.nome}.`, req);
  res.json({ success: true, message: 'Status excluído com sucesso.' });
});

// 7. Processos CRUD & Nested Movimentações & Prazos
api.get('/processos', requirePermission('processos.view', 'processos'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const status = req.query.status as string;

  const result = paginate(processosList, req, (p) => {
    if (search) {
      const matchNum = p.numeroProcesso.toLowerCase().includes(search);
      const matchTit = p.titulo.toLowerCase().includes(search);
      const matchCli = (p.cliente?.nome || p.cliente?.razaoSocial || '').toLowerCase().includes(search);
      if (!matchNum && !matchTit && !matchCli) return false;
    }
    if (status && status !== 'all' && p.status?.id !== status && p.status?.nome !== status) return false;
    return true;
  });

  res.json(result);
});

api.post('/processos', requirePermission('processos.create', 'processos'), (req, res) => {
  const body = req.body;
  const cliente = clientesList.find(c => c.id === body.clienteId || c.id === body.cliente_id) || clientesList[0];
  const status = statusProcessosList.find(s => s.id === body.statusId || s.id === body.status_processo_id) || statusProcessosList[0];

  const newProc = {
    id: `proc-${Date.now()}`,
    numeroProcesso: body.numeroProcesso || body.numero_processo || `100${Math.floor(Math.random()*90000)}-00.2026.8.26.0100`,
    titulo: body.titulo || 'Novo Processo Judicial',
    descricao: body.descricao || '',
    tribunal: body.tribunal || 'TJSP',
    comarca: body.comarca || 'São Paulo',
    vara: body.vara || '1ª Vara Cível',
    tipoAcao: body.tipoAcao || 'Ordinária',
    areaJuridica: body.areaJuridica || 'Cível',
    assunto: body.assunto || 'Indenização',
    dataDistribuicao: body.dataDistribuicao || new Date().toISOString().split('T')[0],
    dataAbertura: body.dataAbertura || new Date().toISOString().split('T')[0],
    dataEncerramento: null,
    valorCausa: body.valorCausa ? Number(body.valorCausa) : 0,
    valorHonorarios: body.valorHonorarios ? Number(body.valorHonorarios) : 0,
    observacoes: body.observacoes || '',
    cliente,
    status,
    advogados: advogadosList.slice(0, 1).map(a => ({ id: a.id, nome: a.nome, principal: true })),
    responsaveis: usersList.slice(0, 1).map(u => ({ id: u.id, nome: u.name })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  processosList.unshift(newProc);
  logActivity('created', 'processos', `Cadastrou o processo ${newProc.numeroProcesso}.`, req);
  res.status(201).json({ success: true, message: 'Processo cadastrado com sucesso!', data: newProc });
});

api.get('/processos/:id', requirePermission('processos.view', 'processos'), (req, res) => {
  const p = processosList.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Processo não encontrado.' });
  res.json({ success: true, data: p });
});

api.put('/processos/:id', requirePermission('processos.update', 'processos'), (req, res) => {
  const idx = processosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Processo não encontrado.' });

  const body = req.body;
  if (body.clienteId) {
    const c = clientesList.find(x => x.id === body.clienteId);
    if (c) body.cliente = c;
  }
  if (body.statusId) {
    const st = statusProcessosList.find(x => x.id === body.statusId);
    if (st) body.status = st;
  }

  processosList[idx] = {
    ...processosList[idx],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  logActivity('updated', 'processos', `Atualizou o processo ${processosList[idx].numeroProcesso}.`, req);
  res.json({ success: true, message: 'Processo atualizado com sucesso!', data: processosList[idx] });
});

api.delete('/processos/:id', requirePermission('processos.delete', 'processos'), (req, res) => {
  const idx = processosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Processo não encontrado.' });
  const p = processosList.splice(idx, 1)[0];
  logActivity('deleted', 'processos', `Excluiu o processo ${p.numeroProcesso}.`, req);
  res.json({ success: true, message: 'Processo excluído com sucesso.' });
});

api.post('/processos/:id/restore', requirePermission('processos.create', 'processos'), (req, res) => {
  res.json({ success: true, message: 'Processo restaurado com sucesso.' });
});

api.get('/processos/:id/advogados', requirePermission('processos.view', 'processos'), (req, res) => {
  const p = processosList.find(x => x.id === req.params.id);
  res.json({ success: true, data: p?.advogados || [] });
});

api.put('/processos/:id/advogados', requirePermission('processos.update', 'processos'), (req, res) => {
  const p = processosList.find(x => x.id === req.params.id);
  if (p && req.body.advogados) {
    p.advogados = req.body.advogados;
  }
  res.json({ success: true, message: 'Advogados vinculados atualizados.', data: p?.advogados });
});

api.get('/processos/:id/responsaveis', requirePermission('processos.view', 'processos'), (req, res) => {
  const p = processosList.find(x => x.id === req.params.id);
  res.json({ success: true, data: p?.responsaveis || [] });
});

api.put('/processos/:id/responsaveis', requirePermission('processos.update', 'processos'), (req, res) => {
  const p = processosList.find(x => x.id === req.params.id);
  if (p && req.body.responsaveis) {
    p.responsaveis = req.body.responsaveis;
  }
  res.json({ success: true, message: 'Responsáveis vinculados atualizados.', data: p?.responsaveis });
});

api.get('/processos/:id/documentos', requirePermission('documentos.view', 'processos'), (req, res) => {
  const docs = documentosList.filter(d => d.processo?.id === req.params.id || (d as any).processoId === req.params.id);
  res.json({ success: true, data: docs });
});

api.get('/processos/:id/contratos', requirePermission('contratos.view', 'processos'), (req, res) => {
  const conts = contratosList.filter(c => c.processo?.id === req.params.id || (c as any).processoId === req.params.id);
  res.json({ success: true, data: conts });
});

api.get('/processos/:id/parcelas', requirePermission('contratos.view', 'processos'), (req, res) => {
  const conts = contratosList.filter(c => c.processo?.id === req.params.id || (c as any).processoId === req.params.id);
  const contIds = new Set(conts.map(c => c.id));
  const parcs = parcelasList.filter(p => contIds.has(p.contratoId) || contIds.has((p as any).contrato?.id));
  res.json({ success: true, data: parcs });
});

api.get('/processos/:id/financeiro', requirePermission('contratos.view', 'processos'), (req, res) => {
  const conts = contratosList.filter(c => c.processo?.id === req.params.id || (c as any).processoId === req.params.id);
  const contIds = new Set(conts.map(c => c.id));
  const parcs = parcelasList.filter(p => contIds.has(p.contratoId) || contIds.has((p as any).contrato?.id));
  const parcIds = new Set(parcs.map(p => p.id));
  const pags = pagamentosList.filter(pg => parcIds.has(pg.parcelaId));
  
  const totalContratado = conts.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0);
  const totalPago = pags.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const totalPendente = Math.max(0, totalContratado - totalPago);

  res.json({
    success: true,
    data: {
      contratos: conts,
      parcelas: parcs,
      pagamentos: pags,
      totalContratado,
      totalPago,
      totalPendente,
    },
  });
});

// Endpoint inteligente para consulta e autopreenchimento de dados via número CNJ
api.get('/processos/consultar-cnj', requirePermission('processos.view', 'processos'), (req, res) => {
  const cnjRaw = (req.query.cnj as string) || '';
  const cnjClean = cnjRaw.replace(/\D/g, '');

  if (cnjClean.length !== 20) {
    return res.status(400).json({
      success: false,
      message: 'Número CNJ inválido. O CNJ deve conter exatamente 20 dígitos no formato NNNNNNN-DD.AAAA.J.TR.OOOO.',
    });
  }

  // Decodifica a estrutura da Resolução 65 do CNJ
  // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
  const seq = cnjClean.substring(0, 7);
  const dv = cnjClean.substring(7, 9);
  const ano = cnjClean.substring(9, 13);
  const j = cnjClean.substring(13, 14); // Ramo da justiça
  const tr = cnjClean.substring(14, 16); // Tribunal
  const oooo = cnjClean.substring(16, 20); // Vara/Origem

  const cnjFormatado = `${seq}-${dv}.${ano}.${j}.${tr}.${oooo}`;

  // 1. Verifica se o processo já existe em nossa base (ativos, suspensos ou arquivados/finalizados)
  const existing = processosList.find(p => {
    const pClean = (p.numeroProcesso || '').replace(/\D/g, '');
    return pClean === cnjClean || p.numeroProcesso === cnjFormatado;
  });

  if (existing) {
    const movs = movimentacoesList.filter(m => m.processoId === existing.id);
    return res.json({
      success: true,
      message: `Processo ${existing.numeroProcesso} localizado na base de dados do escritório (Status: ${existing.status?.nome || 'Cadastrado'})!`,
      data: {
        id: existing.id,
        numeroProcesso: existing.numeroProcesso,
        titulo: existing.titulo,
        descricao: existing.descricao,
        tribunal: existing.tribunal,
        comarca: existing.comarca,
        vara: existing.vara,
        tipoAcao: existing.tipoAcao,
        areaJuridica: existing.areaJuridica,
        assunto: existing.assunto,
        dataDistribuicao: existing.dataDistribuicao,
        dataAbertura: existing.dataAbertura,
        dataEncerramento: existing.dataEncerramento,
        valorCausa: existing.valorCausa,
        valorHonorarios: existing.valorHonorarios,
        clienteId: existing.cliente?.id,
        statusId: existing.status?.id,
        status: existing.status,
        cliente: existing.cliente,
        advogados: existing.advogados,
        responsaveis: existing.responsaveis,
        movimentacoesSugeridas: movs.map(m => ({
          data: m.dataMovimentacao,
          tipo: m.tipo,
          titulo: m.titulo,
          descricao: m.descricao,
        })),
      },
    });
  }

  // Mapeamento de Ramo da Justiça e Tribunal (Caso seja um processo novo a ser importado via DataJud/CNJ)
  let tribunal = 'TJSP';
  let areaJuridica = 'Cível';
  let tipoAcao = 'Ação de Cobrança';
  let comarca = 'São Paulo';
  let vara = '1ª Vara Cível';

  if (j === '5') {
    // Justiça do Trabalho
    areaJuridica = 'Trabalhista';
    tipoAcao = 'Reclamatória Trabalhista';
    if (tr === '02') {
      tribunal = 'TRT-2';
      comarca = 'São Paulo';
      vara = `${parseInt(oooo, 10) % 50 + 1}ª Vara do Trabalho`;
    } else if (tr === '15') {
      tribunal = 'TRT-15';
      comarca = 'Campinas';
      vara = `${parseInt(oooo, 10) % 15 + 1}ª Vara do Trabalho`;
    } else {
      tribunal = `TRT-${tr}`;
      vara = 'Vara do Trabalho';
    }
  } else if (j === '4') {
    // Justiça Federal
    areaJuridica = 'Tributário';
    tipoAcao = 'Execução Fiscal';
    tribunal = tr === '03' ? 'TRF-3' : `TRF-${tr}`;
    comarca = 'São Paulo';
    vara = `${parseInt(oooo, 10) % 20 + 1}ª Vara Cível Federal`;
  } else if (j === '8') {
    // Justiça Estadual
    if (tr === '26') {
      tribunal = 'TJSP';
      comarca = 'São Paulo';
      vara = `${parseInt(oooo, 10) % 30 + 1}ª Vara Cível`;
    } else if (tr === '19') {
      tribunal = 'TJAL';
      comarca = 'Maceió';
      vara = '1ª Vara Cível';
    } else if (tr === '07') {
      tribunal = 'TJDFT';
      comarca = 'Brasília';
      vara = '1ª Vara Cível de Brasília';
    } else {
      tribunal = `TJ (TR ${tr})`;
    }
  }

  const mockData = {
    numeroProcesso: cnjFormatado,
    tribunal,
    areaJuridica,
    tipoAcao,
    comarca,
    vara,
    assunto: `${tipoAcao} - Procedimento Comum (${ano})`,
    titulo: `${tipoAcao} - Autos nº ${cnjFormatado}`,
    dataDistribuicao: `${ano}-02-15`,
    dataAbertura: `${ano}-02-15`,
    valorCausa: 45000.00,
    descricao: `Processo distribuído perante o ${tribunal} (${vara} de ${comarca}). Dados obtidos via consulta processual unificada DataJud/CNJ.`,
    movimentacoesSugeridas: [
      {
        data: `${ano}-02-15T10:00:00Z`,
        tipo: 'Distribuição',
        titulo: 'Processo Distribuído por Sorteio',
        descricao: `Distribuído à ${vara} da Comarca de ${comarca}.`,
      },
      {
        data: `${ano}-02-18T14:30:00Z`,
        tipo: 'Despacho Inicial',
        titulo: 'Citação da Parte Ré e Designação de Prazo',
        descricao: 'Cite-se a parte ré para apresentar resposta no prazo legal.',
      },
    ],
  };

  res.json({
    success: true,
    message: `Dados do processo ${cnjFormatado} localizados com sucesso no ${tribunal}!`,
    data: mockData,
  });
});

api.get('/processos/:processoId/movimentacoes', requirePermission('processos.view', 'processos'), (req, res) => {
  const movs = movimentacoesList.filter(m => m.processoId === String(req.params.processoId));
  res.json({ success: true, data: movs });
});

api.post('/processos/:processoId/movimentacoes', requirePermission('processo-movimentacoes.create', 'processos'), (req, res) => {
  const newMov = {
    id: `mov-${Date.now()}`,
    processoId: String(req.params.processoId),
    dataMovimentacao: req.body.dataMovimentacao || new Date().toISOString(),
    tipo: req.body.tipo || 'Despacho',
    titulo: req.body.titulo || 'Nova Movimentação',
    descricao: req.body.descricao || '',
    origem: req.body.origem || 'Tribunal de Justiça',
    responsavel: { id: currentAuthUser.id, name: currentAuthUser.name },
  };
  movimentacoesList.unshift(newMov);
  res.status(201).json({ success: true, message: 'Movimentação adicionada!', data: newMov });
});

api.get('/processos/:processoId/prazos', requirePermission('prazos.view', 'prazos'), (req, res) => {
  const przs = prazosList.filter(p => p.processoId === String(req.params.processoId));
  res.json({ success: true, data: przs });
});

api.post('/processos/:processoId/prazos', requirePermission('processo-prazos.create', 'prazos'), (req, res) => {
  const newPrazo = {
    id: `prazo-${Date.now()}`,
    processoId: String(req.params.processoId),
    titulo: req.body.titulo || 'Novo Prazo Processual',
    descricao: req.body.descricao || '',
    dataInicio: req.body.dataInicio || new Date().toISOString().split('T')[0],
    dataVencimento: req.body.dataVencimento || new Date().toISOString().split('T')[0],
    status: req.body.status || 'pendente',
    prioridade: req.body.prioridade || 'media',
    responsavel: { id: currentAuthUser.id, name: currentAuthUser.name },
  };
  prazosList.unshift(newPrazo);
  res.status(201).json({ success: true, message: 'Prazo registrado com sucesso!', data: newPrazo });
});

// Helper para gerar número sequencial de contrato: CT-YYYY/XXX (ex: CT-2026/003)
function generateNextContractNumber(): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `CT-${currentYear}/`;
  
  let maxSeq = 0;
  for (const c of contratosList) {
    if (c.numero && c.numero.startsWith(yearPrefix)) {
      const parts = c.numero.split('/');
      if (parts.length === 2) {
        const seq = parseInt(parts[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }
  
  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${yearPrefix}${nextSeq}`;
}

// 8. Contratos, Parcelas, Pagamentos
api.get('/contratos', requirePermission('contratos.view', 'contratos'), (req, res) => {
  res.json(paginate(contratosList, req));
});

api.get('/contratos/proximo-numero', requirePermission('contratos.create', 'contratos'), (req, res) => {
  const proximoNumero = generateNextContractNumber();
  res.json({ success: true, proximoNumero, numero: proximoNumero });
});

api.post('/contratos', requirePermission('contratos.create', 'contratos'), (req, res) => {
  const clienteId = req.body.clienteId || req.body.cliente_id;
  const processoId = req.body.processoId || req.body.processo_id;
  const cliente = clientesList.find(c => c.id === clienteId) || clientesList[0];
  const processo = processosList.find(p => p.id === processoId);
  const valorTotal = Number(req.body.valorTotal || req.body.valor_total || 0);
  const dataInicio = req.body.dataInicio || req.body.data_inicio || new Date().toISOString().split('T')[0];
  const formaPagamento = req.body.formaPagamento || req.body.forma_pagamento || 'Boleto';

  const newCont = {
    id: `cont-${Date.now()}`,
    numero: req.body.numero || generateNextContractNumber(),
    descricao: req.body.descricao || 'Contrato de Prestação de Serviços e Honorários Advocatícios',
    dataInicio,
    dataFim: req.body.dataFim || req.body.data_fim || null,
    valorTotal,
    formaPagamento,
    status: req.body.status || 'vigente',
    observacoes: req.body.observacoes || '',
    cliente,
    processo,
  };
  contratosList.unshift(newCont);

  // Automação: Geração automática de parcelas
  const numParcelasInput = Number(req.body.numParcelas || req.body.num_parcelas);
  let totalParcelas = 1;
  if (numParcelasInput && numParcelasInput > 0) {
    totalParcelas = numParcelasInput;
  } else if (formaPagamento.toLowerCase().includes('parcelado')) {
    const match = formaPagamento.match(/(\d+)\s*x/i);
    if (match && match[1]) {
      totalParcelas = parseInt(match[1], 10);
    }
  }

  if (totalParcelas > 0 && valorTotal > 0) {
    const valorParcela = Number((valorTotal / totalParcelas).toFixed(2));
    const [anoBase, mesBase, diaBase] = dataInicio.split('-').map(Number);

    for (let i = 1; i <= totalParcelas; i++) {
      // Calcula vencimentos mensais consecutivos
      const dateVenc = new Date(anoBase, (mesBase - 1) + (i - 1), diaBase || 10);
      const dataVencimentoStr = dateVenc.toISOString().split('T')[0];

      const newParc = {
        id: `parc-${Date.now()}-${i}`,
        contratoId: newCont.id,
        contrato: newCont,
        numero: i,
        descricao: `Parcela ${String(i).padStart(2, '0')}/${String(totalParcelas).padStart(2, '0')} - Honorários`,
        valor: i === totalParcelas ? Number((valorTotal - (valorParcela * (totalParcelas - 1))).toFixed(2)) : valorParcela,
        dataVencimento: dataVencimentoStr,
        dataPagamento: null,
        status: 'aberto',
        formaPagamento: formaPagamento.includes('PIX') ? 'PIX' : formaPagamento.includes('Boleto') ? 'Boleto Bancário' : 'Transferência',
        observacoes: `Gerada automaticamente para o contrato ${newCont.numero}`,
      };
      parcelasList.push(newParc);
    }
  }

  // Automação: Geração de minuta em documento anexo
  const docNome = `Minuta_Contrato_${newCont.numero.replace('/', '_')}.pdf`;
  const minutaDoc = {
    id: `doc-cont-${Date.now()}`,
    nome: docNome,
    nomeOriginal: docNome,
    tipo: 'Contrato de Honorários',
    categoria: 'Contratual',
    mimeType: 'application/pdf',
    tamanho: 345000,
    descricao: `Minuta de contrato de honorários gerada automaticamente para o cliente ${cliente?.nome || cliente?.razaoSocial}.`,
    downloadUrl: `/api/v1/documentos/doc-cont-${Date.now()}/download`,
    cliente,
    processo,
    contrato: newCont,
    createdAt: new Date().toISOString(),
  };
  documentosList.unshift(minutaDoc);

  logActivity('created', 'contratos', `Cadastrou o contrato ${newCont.numero} com ${totalParcelas} parcelas e minuta vinculada.`, req);
  res.status(201).json({
    success: true,
    message: `Contrato ${newCont.numero} cadastrado com sucesso! ${totalParcelas} parcela(s) e minuta anexada geradas automaticamente.`,
    data: newCont,
  });
});

api.get('/contratos/:id/minuta', requirePermission('contratos.view', 'contratos'), (req, res) => {
  const c = contratosList.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });

  const cliente = c.cliente || clientesList[0];
  const processo = c.processo;
  const parcs = parcelasList.filter(p => p.contratoId === c.id || (p as any).contrato?.id === c.id);

  const minuta = {
    titulo: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS',
    numero: c.numero,
    contratante: {
      nome: cliente.nome || cliente.razaoSocial,
      documento: cliente.cpf || cliente.cnpj || 'CPF/CNPJ Não informado',
      rg: cliente.rg || 'Não informado',
      endereco: `${cliente.logradouro || ''}, ${cliente.numero || 's/n'} - ${cliente.bairro || ''}, ${cliente.cidade || ''}/${cliente.estado || ''}`,
      email: cliente.email || 'Não informado',
      telefone: cliente.celular || cliente.telefone || 'Não informado',
    },
    contratado: {
      escritorio: 'Meu SaaS Corporativo Advocacia & Consultoria Jurídica',
      cnpj: '12.345.678/0001-90',
      oabSociedade: 'OAB/SP 99.888',
      responsavelOab: 'Dr. Roberto Mendonça - OAB/SP 123.456',
      endereco: 'Av. Paulista, 1000, Cj. 142 - Bela Vista, São Paulo/SP - CEP 01310-100',
    },
    objeto: {
      descricao: c.descricao || 'Prestação de assessoria e representação jurídica contenciosa/consultiva.',
      processoReferencia: processo?.numeroProcesso ? `Processo Judicial nº ${processo.numeroProcesso} (${processo.tribunal || 'TJ'} - ${processo.vara || 'Vara Cível'})` : 'Assessoria Jurídica Extrajudicial e Consultoria Estratégica',
    },
    honorarios: {
      valorTotal: c.valorTotal,
      formaPagamento: c.formaPagamento,
      dataInicio: c.dataInicio,
      quantidadeParcelas: parcs.length || 1,
      parcelas: parcs.map(p => ({
        numero: p.numero,
        valor: p.valor,
        dataVencimento: p.dataVencimento,
        status: p.status,
      })),
      observacoes: c.observacoes || 'Honorários ajustados conforme Tabela da OAB/SP.',
    },
    clausulas: [
      {
        titulo: 'CLÁUSULA PRIMEIRA – DO OBJETO',
        texto: `O presente instrumento tem por objeto a prestação de serviços advocatícios pelos CONTRATADOS ao CONTRATANTE, especificamente para acompanhamento do ${processo?.numeroProcesso ? `processo nº ${processo.numeroProcesso}` : 'assunto jurídico supra mencionado'}, praticando todos os atos judiciais e extrajudiciais inerentes à defesa dos direitos e interesses da parte.`,
      },
      {
        titulo: 'CLÁUSULA SEGUNDA – DOS HONORÁRIOS E FORMA DE PAGAMENTO',
        texto: `Pelos serviços ora contratados, o CONTRATANTE pagará aos CONTRATADOS a importância total de R$ ${Number(c.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, a ser quitada na modalidade ${c.formaPagamento}.`,
      },
      {
        titulo: 'CLÁUSULA TERCEIRA – DAS CUSTAS E DESPESAS',
        texto: 'As custas processuais, taxas judiciárias, despesas com viagens, cópias reprográficas, emolumentos de cartórios e pareceres técnicos periciais correrão por conta exclusiva do CONTRATANTE.',
      },
      {
        titulo: 'CLÁUSULA QUARTA – DO FORO',
        texto: 'Para dirimir quaisquer dúvidas decorrentes do presente contrato, as partes elegem o Foro da Comarca da Capital do Estado, com expressa renúncia a qualquer outro, por mais privilegiado que seja.',
      },
    ],
  };

  res.json({ success: true, data: minuta });
});

api.get('/contratos/:id', requirePermission('contratos.view', 'contratos'), (req, res) => {
  const c = contratosList.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  res.json({ success: true, data: c });
});

api.put('/contratos/:id', requirePermission('contratos.update', 'contratos'), (req, res) => {
  const idx = contratosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  contratosList[idx] = { ...contratosList[idx], ...req.body };
  res.json({ success: true, message: 'Contrato atualizado com sucesso!', data: contratosList[idx] });
});

api.delete('/contratos/:id', requirePermission('contratos.delete', 'contratos'), (req, res) => {
  const idx = contratosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  contratosList.splice(idx, 1);
  res.json({ success: true, message: 'Contrato excluído.' });
});

api.get('/parcelas', requirePermission('contratos.view', 'parcelas'), (req, res) => {
  const contratoId = req.query.contratoId || req.query.contrato_id;
  const status = req.query.status as string;
  let list = parcelasList;
  if (contratoId) {
    list = list.filter(p => p.contratoId === contratoId || (p as any).contrato?.id === contratoId);
  }
  if (status && status !== 'all') {
    list = list.filter(p => p.status === status);
  }
  res.json(paginate(list, req));
});

api.post('/parcelas', requirePermission('contratos.create', 'parcelas'), (req, res) => {
  const newParc = {
    id: `parc-${Date.now()}`,
    contratoId: req.body.contratoId || req.body.contrato_id || contratosList[0].id,
    numero: Number(req.body.numero || 1),
    descricao: req.body.descricao || 'Parcela',
    valor: Number(req.body.valor || 0),
    dataVencimento: req.body.dataVencimento || req.body.data_vencimento || new Date().toISOString().split('T')[0],
    dataPagamento: req.body.dataPagamento || req.body.data_pagamento || null,
    status: req.body.status || 'aberto',
    formaPagamento: req.body.formaPagamento || req.body.forma_pagamento || 'PIX',
    observacoes: req.body.observacoes || '',
  };
  parcelasList.push(newParc);
  res.status(201).json({ success: true, message: 'Parcela adicionada com sucesso!', data: newParc });
});

// Endpoint de quitação rápida com 1 clique para advogados
api.post('/parcelas/:id/quitar', requirePermission('pagamentos.create', 'parcelas'), (req, res) => {
  const parc = parcelasList.find(p => p.id === req.params.id);
  if (!parc) return res.status(404).json({ success: false, message: 'Parcela não encontrada.' });

  const dataPagamento = req.body.dataPagamento || new Date().toISOString().split('T')[0];
  const formaPagamento = req.body.formaPagamento || parc.formaPagamento || 'PIX';
  const valorPago = Number(req.body.valor || parc.valor);

  parc.status = 'pago';
  parc.dataPagamento = dataPagamento;
  parc.formaPagamento = formaPagamento;

  const newPag = {
    id: `pag-${Date.now()}`,
    parcelaId: parc.id,
    valor: valorPago,
    dataPagamento,
    formaPagamento,
    observacoes: req.body.observacoes || `Quitação rápida da parcela ${parc.numero}.`,
  };
  pagamentosList.unshift(newPag);

  logActivity('updated', 'parcelas', `Quitou a parcela ${parc.numero} no valor de R$ ${valorPago}.`, req);
  res.json({
    success: true,
    message: `Parcela ${parc.numero} quitada com sucesso! Pagamento registrado.`,
    data: { parcela: parc, pagamento: newPag },
  });
});

// Endpoint de geração de recibo de quitação formal
api.get('/parcelas/:id/recibo', requirePermission('contratos.view', 'parcelas'), (req, res) => {
  const parc = parcelasList.find(p => p.id === req.params.id);
  if (!parc) return res.status(404).json({ success: false, message: 'Parcela não encontrada.' });

  const cont = contratosList.find(c => c.id === parc.contratoId || c.id === (parc as any).contrato?.id) || contratosList[0];
  const cliente = cont.cliente || clientesList[0];
  const valorNum = Number(parc.valor);

  const recibo = {
    numeroRecibo: `REC-${new Date().getFullYear()}/${String(parc.id).replace(/\D/g, '').slice(-4)}`,
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    dataPagamento: parc.dataPagamento ? new Date(parc.dataPagamento).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
    valor: valorNum,
    valorFormatado: `R$ ${valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    formaPagamento: parc.formaPagamento || 'PIX',
    pagador: {
      nome: cliente.nome || cliente.razaoSocial,
      documento: cliente.cpf || cliente.cnpj || 'Não informado',
      endereco: `${cliente.logradouro || ''}, ${cliente.numero || ''} - ${cliente.cidade || ''}/${cliente.estado || ''}`,
    },
    beneficiario: {
      nome: 'Meu SaaS Corporativo Advocacia & Associados',
      cnpj: '12.345.678/0001-90',
      oab: 'OAB/SP 99.888',
      advogadoResponsavel: 'Dr. Roberto Mendonça (OAB/SP 123.456)',
    },
    referencia: {
      contratoNumero: cont.numero,
      descricao: cont.descricao,
      parcelaNumero: parc.numero,
      processoNumero: cont.processo?.numeroProcesso || 'Serviços Extrajudiciais',
    },
    declaracao: `Recebemos de ${cliente.nome || cliente.razaoSocial}, inscrito(a) no CPF/CNPJ sob o nº ${cliente.cpf || cliente.cnpj || 'N/A'}, a importância supra discriminada, referente à quitação da Parcela ${parc.numero} do Contrato de Honorários Advocatícios ${cont.numero}, para os devidos fins de direito.`,
  };

  res.json({ success: true, data: recibo });
});

api.get('/pagamentos', requirePermission('pagamentos.view', 'pagamentos'), (req, res) => {
  res.json(paginate(pagamentosList, req));
});

api.post('/pagamentos', requirePermission('pagamentos.create', 'pagamentos'), (req, res) => {
  const newPag = {
    id: `pag-${Date.now()}`,
    parcelaId: req.body.parcelaId || req.body.parcela_id || parcelasList[0].id,
    valor: Number(req.body.valor || 0),
    dataPagamento: req.body.dataPagamento || req.body.data_pagamento || new Date().toISOString().split('T')[0],
    formaPagamento: req.body.formaPagamento || req.body.forma_pagamento || 'PIX',
    observacoes: req.body.observacoes || '',
  };
  pagamentosList.unshift(newPag);

  // Mark parcela as pago
  const parc = parcelasList.find(p => p.id === newPag.parcelaId);
  if (parc) {
    parc.status = 'pago';
    parc.dataPagamento = newPag.dataPagamento;
  }

  logActivity('created', 'pagamentos', `Registrou pagamento de R$ ${newPag.valor}.`, req);
  res.status(201).json({ success: true, message: 'Pagamento registrado com sucesso!', data: newPag });
});

api.post('/pagamentos/:id/cancelar', requirePermission('pagamentos.delete', 'pagamentos'), (req, res) => {
  const pag = pagamentosList.find(x => x.id === req.params.id);
  if (pag) {
    const parc = parcelasList.find(p => p.id === pag.parcelaId);
    if (parc) parc.status = 'aberto';
  }
  res.json({ success: true, message: 'Pagamento cancelado com sucesso.' });
});

// 9. Documentos CRUD & Downloads
api.get('/documentos', requirePermission('documentos.view', 'documentos'), (req, res) => {
  res.json(paginate(documentosList, req));
});

api.post('/documentos', requirePermission('documentos.create', 'documentos'), (req, res) => {
  const procId = req.body.processoId || req.body.processo_id;
  const proc = processosList.find(p => p.id === procId);
  const clienteId = req.body.clienteId || req.body.cliente_id || proc?.cliente?.id;
  const cliente = clientesList.find(c => c.id === clienteId) || proc?.cliente || clientesList[0];

  const newDoc = {
    id: `doc-${Date.now()}`,
    nome: req.body.nome || (req as any).file?.originalname || 'Documento_Upload.pdf',
    nomeOriginal: (req as any).file?.originalname || req.body.nomeOriginal || req.body.nome || 'Documento_Upload.pdf',
    tipo: req.body.tipo || req.body.categoria || 'Petição',
    categoria: req.body.categoria || 'Processual',
    mimeType: (req as any).file?.mimetype || req.body.mimeType || 'application/pdf',
    tamanho: Number(req.body.tamanho || (req as any).file?.size || 512000),
    descricao: req.body.descricao || '',
    downloadUrl: `/api/v1/documentos/doc-${Date.now()}/download`,
    cliente,
    processo: proc,
    createdAt: new Date().toISOString(),
  };
  documentosList.unshift(newDoc);
  logActivity('created', 'documentos', `Enviou o documento ${newDoc.nome} (Cliente: ${cliente?.nome || cliente?.razaoSocial}).`, req);
  res.status(201).json({ success: true, message: 'Documento enviado com sucesso!', data: newDoc });
});

api.get('/documentos/:id', requirePermission('documentos.view', 'documentos'), (req, res) => {
  const d = documentosList.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Documento não encontrado.' });
  res.json({ success: true, data: d });
});

api.delete('/documentos/:id', requirePermission('documentos.delete', 'documentos'), (req, res) => {
  const idx = documentosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Documento não encontrado.' });
  const d = documentosList.splice(idx, 1)[0];
  logActivity('deleted', 'documentos', `Excluiu o documento ${d.nome}.`, req);
  res.json({ success: true, message: 'Documento excluído com sucesso.' });
});

api.get('/documentos/:id/download', requirePermission('documentos.view', 'documentos'), (req, res) => {
  const d = documentosList.find(x => x.id === req.params.id);
  const filename = d ? d.nome : 'documento.pdf';
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from('%PDF-1.4 Mock Document Content - Meu SaaS Corporativo Advocacia'));
});

api.get('/documentos/:id/preview', requirePermission('documentos.view', 'documentos'), (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from('%PDF-1.4 Mock Document Preview'));
});

// 10. Tarefas CRUD
api.get('/tarefas', requirePermission('tarefas.view', 'tarefas'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const status = req.query.status as string;
  const result = paginate(tarefasList, req, (t) => {
    if (search && !t.titulo.toLowerCase().includes(search)) return false;
    if (status && status !== 'all' && t.status !== status) return false;
    return true;
  });
  res.json(result);
});

api.post('/tarefas', requirePermission('tarefas.create', 'tarefas'), (req, res) => {
  const newTar = {
    id: `tar-${Date.now()}`,
    titulo: req.body.titulo || 'Nova Tarefa',
    descricao: req.body.descricao || '',
    prioridade: req.body.prioridade || 'media',
    status: req.body.status || 'a_fazer',
    dataInicio: req.body.dataInicio || new Date().toISOString().split('T')[0],
    dataVencimento: req.body.dataVencimento || new Date().toISOString().split('T')[0],
    observacoes: req.body.observacoes || '',
    processo: processosList.find(p => p.id === req.body.processoId),
    cliente: clientesList.find(c => c.id === req.body.clienteId),
    responsavel: usersList.find(u => u.id === req.body.responsavelId) || { id: currentAuthUser.id, name: currentAuthUser.name },
  };
  tarefasList.unshift(newTar);
  logActivity('created', 'tarefas', `Criou a tarefa ${newTar.titulo}.`, req);
  res.status(201).json({ success: true, message: 'Tarefa cadastrada com sucesso!', data: newTar });
});

api.get('/tarefas/:id', requirePermission('tarefas.view', 'tarefas'), (req, res) => {
  const t = tarefasList.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
  res.json({ success: true, data: t });
});

api.put('/tarefas/:id', requirePermission('tarefas.update', 'tarefas'), (req, res) => {
  const idx = tarefasList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
  tarefasList[idx] = { ...tarefasList[idx], ...req.body };
  logActivity('updated', 'tarefas', `Atualizou a tarefa ${tarefasList[idx].titulo}.`, req);
  res.json({ success: true, message: 'Tarefa atualizada com sucesso!', data: tarefasList[idx] });
});

api.delete('/tarefas/:id', requirePermission('tarefas.delete', 'tarefas'), (req, res) => {
  const idx = tarefasList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tarefa não encontrada.' });
  const t = tarefasList.splice(idx, 1)[0];
  logActivity('deleted', 'tarefas', `Excluiu a tarefa ${t.titulo}.`, req);
  res.json({ success: true, message: 'Tarefa excluída com sucesso.' });
});

// 11. Agenda Eventos CRUD
api.get('/agenda-eventos', requirePermission('agenda.view', 'agenda'), (req, res) => {
  res.json(paginate(agendaEventosList, req));
});

api.post('/agenda-eventos', requirePermission('agenda.create', 'agenda'), (req, res) => {
  const newEv = {
    id: `evt-${Date.now()}`,
    titulo: req.body.titulo || 'Novo Evento',
    descricao: req.body.descricao || '',
    tipo: req.body.tipo || 'Reunião',
    dataInicio: req.body.dataInicio || new Date().toISOString(),
    dataFim: req.body.dataFim || null,
    local: req.body.local || 'Escritório',
    status: req.body.status || 'agendado',
    processo: processosList.find(p => p.id === req.body.processoId),
    cliente: clientesList.find(c => c.id === req.body.clienteId),
    responsavel: { id: currentAuthUser.id, name: currentAuthUser.name },
  };
  agendaEventosList.unshift(newEv);
  logActivity('created', 'agenda', `Agendou evento: ${newEv.titulo}.`, req);
  res.status(201).json({ success: true, message: 'Evento agendado com sucesso!', data: newEv });
});

api.get('/agenda-eventos/:id', requirePermission('agenda.view', 'agenda'), (req, res) => {
  const ev = agendaEventosList.find(x => x.id === req.params.id);
  if (!ev) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  res.json({ success: true, data: ev });
});

api.put('/agenda-eventos/:id', requirePermission('agenda.update', 'agenda'), (req, res) => {
  const idx = agendaEventosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  agendaEventosList[idx] = { ...agendaEventosList[idx], ...req.body };
  logActivity('updated', 'agenda', `Atualizou evento ${agendaEventosList[idx].titulo}.`, req);
  res.json({ success: true, message: 'Evento atualizado!', data: agendaEventosList[idx] });
});

api.delete('/agenda-eventos/:id', requirePermission('agenda.delete', 'agenda'), (req, res) => {
  const idx = agendaEventosList.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  const ev = agendaEventosList.splice(idx, 1)[0];
  logActivity('deleted', 'agenda', `Cancelou evento ${ev.titulo}.`, req);
  res.json({ success: true, message: 'Evento excluído com sucesso.' });
});

// 12. Escritórios
api.get('/escritorios/:id', (req, res) => {
  res.json({ success: true, data: escritorioData });
});

api.put('/escritorios/:id', requirePermission('settings.edit', 'settings'), (req, res) => {
  escritorioData = { ...escritorioData, ...req.body, updatedAt: new Date().toISOString() };
  logActivity('updated', 'escritorio', `Atualizou os dados do escritório ${escritorioData.nome}.`, req);
  res.json({ success: true, message: 'Dados do escritório atualizados com sucesso!', data: escritorioData });
});

// 13. Notifications
api.get('/notifications', (req, res) => {
  res.json({ success: true, data: notificacoesList });
});

api.patch('/notifications/:id/read', (req, res) => {
  const n = notificacoesList.find(x => x.id === req.params.id);
  if (n) n.readAt = new Date().toISOString();
  res.json({ success: true, data: n });
});

api.patch('/notifications/read-all', (req, res) => {
  notificacoesList.forEach(n => { n.readAt = new Date().toISOString(); });
  res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas.' });
});

// 14. Reports & Exports
api.get('/reports/financeiro/export', requirePermission('reports.view', 'relatorios'), (req, res) => {
  const csvContent = [
    'ID,Contrato,Cliente,Valor Total,Forma Pagamento,Status',
    ...contratosList.map(c => `"${c.id}","${c.numero}","${c.cliente?.nome || c.cliente?.razaoSocial || ''}","${c.valorTotal}","${c.formaPagamento}","${c.status}"`),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="relatorio-financeiro.csv"');
  res.send(csvContent);
});

api.get('/reports/:tipo/export', requirePermission('reports.view', 'relatorios'), (req, res) => {
  const { tipo } = req.params;
  let csvContent = '';

  if (tipo === 'clientes') {
    csvContent = [
      'ID,Tipo,Nome/Razão Social,CPF/CNPJ,E-mail,Telefone,Status',
      ...clientesList.map(c => `"${c.id}","${c.tipoPessoa}","${c.nome || c.razaoSocial || ''}","${c.cpf || c.cnpj || ''}","${c.email || ''}","${c.telefone || c.celular || ''}","${c.status}"`),
    ].join('\n');
  } else if (tipo === 'processos') {
    csvContent = [
      'ID,Numero Processo,Titulo,Tribunal,Area,Valor Causa,Status',
      ...processosList.map(p => `"${p.id}","${p.numeroProcesso}","${p.titulo}","${p.tribunal || ''}","${p.areaJuridica || ''}","${p.valorCausa || 0}","${p.status?.nome || ''}"`),
    ].join('\n');
  } else if (tipo === 'prazos') {
    csvContent = [
      'ID,Processo ID,Titulo,Vencimento,Prioridade,Status',
      ...prazosList.map(p => `"${p.id}","${p.processoId}","${p.titulo}","${p.dataVencimento}","${p.prioridade}","${p.status}"`),
    ].join('\n');
  } else if (tipo === 'tarefas') {
    csvContent = [
      'ID,Titulo,Prioridade,Status,Vencimento,Responsavel',
      ...tarefasList.map(t => `"${t.id}","${t.titulo}","${t.prioridade}","${t.status}","${t.dataVencimento}","${t.responsavel?.name || ''}"`),
    ].join('\n');
  } else {
    csvContent = 'ID,Descricao,Data\n1,Relatorio Geral,' + new Date().toISOString();
  }

  logActivity('export', 'reports', `Exportou relatório do tipo: ${tipo}.`, req);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio-${tipo}.csv"`);
  res.send(csvContent);
});

// 15. Roles & Permissions
api.get('/roles', requirePermission('roles.view', 'roles'), (req, res) => {
  res.json({ success: true, data: rolesList });
});

api.post('/roles', requirePermission('roles.create', 'roles'), (req, res) => {
  const { name, label, description, permissions } = req.body;
  const newRole: Role = {
    id: `role-${Date.now()}`,
    name: name || `role_${Date.now()}`,
    label: label || 'Novo Perfil',
    description: description || '',
    isSystem: false,
    permissions: permissions || [],
    usersCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  rolesList.push(newRole);
  logActivity('created', 'roles', `Criou o perfil de acesso ${newRole.label}.`, req);
  res.status(201).json({ success: true, message: 'Perfil criado com sucesso!', data: newRole });
});

api.get('/roles/:id', requirePermission('roles.view', 'roles'), (req, res) => {
  const r = rolesList.find(x => x.id === req.params.id || x.name === req.params.id);
  if (!r) return res.status(404).json({ success: false, message: 'Perfil não encontrado.' });
  res.json({ success: true, data: r });
});

api.put('/roles/:id', requirePermission('roles.edit', 'roles'), (req, res) => {
  const idx = rolesList.findIndex(x => x.id === req.params.id || x.name === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Perfil não encontrado.' });
  rolesList[idx] = { ...rolesList[idx], ...req.body, updatedAt: new Date().toISOString() };
  logActivity('updated', 'roles', `Atualizou o perfil de acesso ${rolesList[idx].label}.`, req);
  res.json({ success: true, message: 'Perfil atualizado com sucesso!', data: rolesList[idx] });
});

api.delete('/roles/:id', requirePermission('roles.delete', 'roles'), (req, res) => {
  const idx = rolesList.findIndex(x => x.id === req.params.id || x.name === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Perfil não encontrado.' });
  if (rolesList[idx].isSystem) {
    return res.status(403).json({ success: false, message: 'Não é permitido excluir perfis do sistema.' });
  }
  const r = rolesList.splice(idx, 1)[0];
  logActivity('deleted', 'roles', `Excluiu o perfil ${r.label}.`, req);
  res.json({ success: true, message: 'Perfil excluído com sucesso.' });
});

api.get('/permissions', requirePermission('permissions.view', 'permissions'), (req, res) => {
  res.json({ success: true, data: permissionsList });
});

// 16. Audit Logs
api.get('/logs', requirePermission('logs.view', 'logs'), (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();
  const moduleName = req.query.module as string;
  const action = req.query.action as string;

  const result = paginate(activityLogsList, req, (l) => {
    if (search && !l.description.toLowerCase().includes(search) && !l.userName.toLowerCase().includes(search)) return false;
    if (moduleName && moduleName !== 'all' && l.module !== moduleName) return false;
    if (action && action !== 'all' && l.action !== action) return false;
    return true;
  });

  res.json(result);
});

// 17. Settings
api.get('/settings', requirePermission('settings.view', 'settings'), (req, res) => {
  res.json({ success: true, data: systemSettings });
});

api.put('/settings', requirePermission('settings.edit', 'settings'), (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  logActivity('updated', 'settings', 'Atualizou configurações gerais do sistema.', req);
  res.json({ success: true, message: 'Configurações atualizadas com sucesso!', data: systemSettings });
});

// Mount /api and /api/v1 routes
app.use('/api/v1', api);
app.use('/api', api);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
