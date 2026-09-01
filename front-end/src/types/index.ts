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
