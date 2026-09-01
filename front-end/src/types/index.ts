export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Permission {
  id: string;
  name: string; // e.g. 'users.view'
  label: string; // e.g. 'Visualizar Usuários'
  module: string; // e.g. 'users'
  description: string;
}

export interface Role {
  id: string;
  name: string; // e.g. 'admin'
  label: string; // e.g. 'Administrador'
  description: string;
  isSystem?: boolean;
  permissions: string[]; // array of permission names
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  escritorioId?: string | null;
  name: string;
  email: string;
  data_nascimento?: string | null;
  status: UserStatus;
  avatar?: string;
  roles: string[]; // array of role IDs or names
  roleIds?: string[];
  rolesDetails?: Role[];
  permissions?: string[]; // aggregated permissions
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  emailVerifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'status_changed' | 'password_reset' | 'permission_modified' | string;
  module: 'auth' | 'users' | 'roles' | 'permissions' | 'settings' | 'system' | string;
  description: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  details?: Record<string, any>;
  createdAt: string;
}

export type AuditLog = ActivityLog;

export interface AuthSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SystemSettings {
  appName: string;
  companyName: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  sessionLifetimeMinutes: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireTwoFactorForAdmins: boolean;
  enableAuditLogging: boolean;
  rateLimitPerMinute: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  recentLoginsCount: number;
  usersGrowthPercentage: number;
  activePercentage: number;
  registrationsOverTime: { date: string; users: number; active: number }[];
  usersByRole: { role: string; count: number; color: string }[];
  activityByModule: { module: string; count: number }[];
  recentUsers: User[];
  recentActivities: ActivityLog[];
}

export type ClienteTipoPessoa = 'PF' | 'PJ';
export type ClienteStatus = 'active' | 'inactive';

export interface Cliente {
  id: string;
  tipoPessoa: ClienteTipoPessoa;
  nome: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  dataNascimento: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  whatsapp: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  status: ClienteStatus;
  processosCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Advogado {
  id: string;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  celular?: string | null;
  oabNumero?: string | null;
  oabUf?: string | null;
  especialidade?: string | null;
  status?: string;
  observacoes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface StatusProcesso {
  id: string;
  nome: string;
  descricao?: string | null;
  cor?: string | null;
  ordem?: number;
  ativo: boolean;
}

export interface Notificacao {
  id: string;
  type: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProcessoVinculo {
  id: string;
  nome: string;
  tipo?: string;
  principal?: boolean;
}

export interface Processo {
  id: string;
  numeroProcesso: string;
  titulo: string;
  descricao?: string | null;
  tribunal?: string | null;
  comarca?: string | null;
  vara?: string | null;
  tipoAcao?: string | null;
  areaJuridica?: string | null;
  assunto?: string | null;
  dataDistribuicao?: string | null;
  dataAbertura?: string | null;
  dataEncerramento?: string | null;
  valorCausa?: number | string | null;
  valorHonorarios?: number | string | null;
  observacoes?: string | null;
  cliente?: Cliente;
  status?: StatusProcesso;
  advogados?: ProcessoVinculo[];
  responsaveis?: ProcessoVinculo[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcessoMovimentacao {
  id: string;
  dataMovimentacao: string;
  tipo: string;
  titulo: string;
  descricao?: string | null;
  origem?: string | null;
  responsavel?: Pick<User, 'id' | 'name'>;
}

export interface ProcessoPrazo {
  id: string;
  titulo: string;
  descricao?: string | null;
  dataInicio?: string | null;
  dataVencimento: string;
  status?: string | null;
  prioridade?: string | null;
  responsavel?: Pick<User, 'id' | 'name'>;
}

export interface DashboardJuridicoMetrics {
  clientesAtivos: number;
  processosPorStatus: Record<string, number>;
  prazos: { hoje: number; proximos: number; vencidos: number };
  tarefasPendentes: number;
  agendaProxima: { id: string; titulo: string; tipo: string; data_inicio: string }[];
  valores: { a_receber: number; em_atraso: number };
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente' | null;
  status?: 'a_fazer' | 'em_andamento' | 'concluida' | 'cancelada' | null;
  dataInicio?: string | null;
  dataVencimento?: string | null;
  observacoes?: string | null;
  processo?: Processo;
  cliente?: Cliente;
  responsavel?: Pick<User, 'id' | 'name'>;
}

export interface AgendaEvento {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: string;
  dataInicio: string;
  dataFim?: string | null;
  local?: string | null;
  status?: 'agendado' | 'realizado' | 'cancelado' | null;
  processo?: Processo;
  cliente?: Cliente;
  responsavel?: Pick<User, 'id' | 'name'>;
}

export interface Documento {
  id: string;
  nome: string;
  nomeOriginal: string;
  tipo: string;
  categoria: string;
  mimeType: string;
  tamanho: number;
  descricao?: string | null;
  downloadUrl: string;
  cliente?: Cliente;
  processo?: Processo;
  contrato?: Contrato;
}

export interface Contrato {
  id: string;
  numero: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  valorTotal: number | string;
  formaPagamento: string;
  status?: string | null;
  observacoes?: string | null;
  cliente?: Cliente;
  processo?: Processo;
  parcelas?: Parcela[];
}

export interface Parcela {
  id: string;
  numero: number;
  descricao?: string | null;
  valor: number | string;
  dataVencimento: string;
  dataPagamento?: string | null;
  status?: string | null;
  formaPagamento?: string | null;
  observacoes?: string | null;
  contrato?: Contrato;
  pagamentos?: Pagamento[];
}

export interface Pagamento {
  id: string;
  valor: number | string;
  dataPagamento: string;
  formaPagamento: string;
  observacoes?: string | null;
  parcela?: Parcela;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: NonNullable<ApiResponse['meta']>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
  errors?: Record<string, string[]>;
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  abilities: string[];
  createdAt: string;
}
