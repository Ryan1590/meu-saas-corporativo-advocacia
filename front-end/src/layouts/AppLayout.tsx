import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Sliders,
  History,
  Palette,
  BookOpen,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Layers,
  Terminal,
  KeyRound,
  MonitorCheck,
  AlertOctagon,
  Search,
  Activity,
  Cake,
  ContactRound,
  BriefcaseBusiness,
  Scale,
  CalendarDays,
  ListTodo,
  Landmark,
  Bell,
  CircleDot,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from '../components/design-system/Badge';
import { Badge } from '../components/design-system/Badge';
import { Dropdown } from '../components/design-system/Dropdown';
import { Tooltip } from '../components/design-system/Dropdown';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  adminOnly?: boolean;
  badge?: React.ReactNode;
  children?: {
    id: string;
    label: string;
    path: string;
    permission?: string;
    badge?: React.ReactNode;
  }[];
}

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { user, logout, can, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Navigation menu with screen-level permission filtering
  const navigationGroups: { title: string; groupId?: string; items: NavItem[] }[] = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Infos User',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/infos-user',
          permission: 'infos-user.view',
        },
        {
          id: 'birthdays',
          label: 'Aniversariantes',
          icon: <Cake className="w-4 h-4" />,
          path: '/birthdays',
          permission: 'birthdays.view',
        },
      ],
    },
    {
      title: 'Controle de Acesso',
      groupId: 'cadastros',
      items: [
        {
          id: 'users',
          label: 'Usuários',
          icon: <Users className="w-4 h-4" />,
          path: '/users',
          permission: 'users.view',
        },
        {
          id: 'roles',
          label: 'Perfis & Roles',
          icon: <ShieldCheck className="w-4 h-4" />,
          path: '/roles',
          permission: 'roles.view',
        },
        {
          id: 'screen-permissions',
          label: 'Acesso por Tela',
          icon: <MonitorCheck className="w-4 h-4" />,
          path: '/screen-permissions',
          permission: 'permissions.view',
          badge: <Badge variant="primary" size="sm">RBAC</Badge>,
        },
        {
          id: 'logs',
          label: 'Logs de Auditoria',
          icon: <History className="w-4 h-4" />,
          path: '/logs',
          permission: 'logs.view',
        },
      ],
    },
    {
      title: 'Dashboard Jurídico',
      groupId: 'dashboard-juridico',
      items: [
        {
          id: 'dashboard-juridico',
          label: 'Dashboard Jurídico',
          icon: <Scale className="w-4 h-4" />,
          path: '/dashboard-juridico',
          permission: 'dashboard-juridico.view',
        },
        { id: 'notifications', label: 'Notificações', icon: <Bell className="w-4 h-4" />, path: '/notifications', permission: 'notifications.view' },
      ],
    },
    {
      title: 'Gestão',
      groupId: 'gestao',
      items: [
        {
          id: 'clientes',
          label: 'Clientes',
          icon: <ContactRound className="w-4 h-4" />,
          path: '/clientes',
          permission: 'clientes.view',
        },
        {
          id: 'processos',
          label: 'Processos',
          icon: <BriefcaseBusiness className="w-4 h-4" />,
          path: '/processos',
          permission: 'processos.view',
        },
        { id: 'advogados', label: 'Advogados', icon: <Users className="w-4 h-4" />, path: '/advogados', permission: 'advogados.view' },
      ],
    },
    {
      title: 'Acompanhamento',
      groupId: 'acompanhamento',
      items: [
        { id: 'tarefas', label: 'Tarefas', icon: <ListTodo className="w-4 h-4" />, path: '/tarefas', permission: 'tarefas.view' },
        { id: 'agenda', label: 'Agenda', icon: <CalendarDays className="w-4 h-4" />, path: '/agenda', permission: 'agenda.view' },
      ],
    },
    {
      title: 'Documentos',
      groupId: 'documentos',
      items: [
        { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" />, path: '/documentos', permission: 'documentos.view' },
        { id: 'contratos', label: 'Contratos', icon: <Landmark className="w-4 h-4" />, path: '/contratos', permission: 'contratos.view' },
      ],
    },
    {
      title: 'Financeiro',
      groupId: 'financeiro',
      items: [
        { id: 'financeiro', label: 'Financeiro', icon: <Landmark className="w-4 h-4" />, path: '/financeiro', permission: 'contratos.view' },
      ],
    },
    {
      title: 'Relatórios',
      groupId: 'relatorios',
      items: [
        { id: 'reports', label: 'Exportar relatórios', icon: <FileSpreadsheet className="w-4 h-4" />, path: '/reports', permission: 'reports.view' },
      ],
    },
    {
      title: 'Configurações',
      groupId: 'configuracoes-juridicas',
      items: [
        { id: 'escritorio', label: 'Escritório', icon: <Building2 className="w-4 h-4" />, path: '/escritorio', permission: 'escritorios.view' },
        { id: 'status-processos', label: 'Status de processos', icon: <CircleDot className="w-4 h-4" />, path: '/status-processos', permission: 'status-processos.view' },
      ],
    },
    {
      title: 'Configurações & Dev',
      groupId: 'ferramentas',
      items: [
        {
          id: 'settings',
          label: 'Configurações & API',
          icon: <Sliders className="w-4 h-4" />,
          path: '/settings',
          permission: 'settings.view',
        },
        {
          id: 'api-playground',
          label: 'API Tester (Sanctum)',
          icon: <Terminal className="w-4 h-4" />,
          path: '/api-playground',
          permission: 'api.view',
          badge: <Badge variant="indigo" size="sm">REST</Badge>,
        },
        
        {
          id: 'design-system',
          label: 'Design System',
          icon: <Palette className="w-4 h-4" />,
          path: '/design-system',
          permission: 'design-system.view',
        },
        {
          id: 'documentation',
          label: 'Documentação / Guia',
          icon: <BookOpen className="w-4 h-4" />,
          path: '/documentation',
          permission: 'documentation.view',
        },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/infos-user': return 'Infos User';
      case '/birthdays': return 'Aniversariantes';
      case '/users': return 'Usuários';
      case '/clientes': return 'Clientes';
      case '/advogados': return 'Advogados';
      case '/status-processos': return 'Status de Processos';
      case '/processos': return 'Processos';
      case '/tarefas': return 'Tarefas';
      case '/agenda': return 'Agenda';
      case '/documentos': return 'Documentos';
      case '/contratos': return 'Contratos';
      case '/financeiro': return 'Financeiro';
      case '/dashboard-juridico': return 'Dashboard Jurídico';
      case '/reports': return 'Relatórios';
      case '/notifications': return 'Notificações';
      case '/roles': return 'Perfis & Roles';
      case '/screen-permissions': return 'Acesso por Tela';
      case '/logs': return 'Logs de Auditoria';
      case '/escritorio': return 'Escritório';
      case '/settings': return 'Configurações do Sistema';
      case '/api-playground': return 'API Playground';
      case '/design-system': return 'Design System';
      case '/documentation': return 'Documentação Técnica';
      default: return 'Portal';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* High Density Sleek Slate-900 SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A] border-r border-slate-800 text-slate-300 transition-all duration-300 lg:static ${
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="flex flex-col text-left">
                <span className="font-bold text-base text-white tracking-tight leading-tight">
                  Meu SaaS Corporativo
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Laravel 11 + React Base
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navigationGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter(
              (item) => (!item.permission || can(item.permission)) && (!item.adminOnly || hasRole('admin'))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {(isSidebarOpen || isMobileMenuOpen) && group.title && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {group.title}
                  </p>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = currentPath === item.path;

                    if (!isSidebarOpen && !isMobileMenuOpen) {
                      return (
                        <Tooltip key={item.id} content={item.label} position="right">
                          <button
                            onClick={() => handleNavClick(item.path)}
                            className={`flex h-10 w-full items-center justify-center rounded-md transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            {item.icon}
                          </button>
                        </Tooltip>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.path)}
                        className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`${
                              isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && <div className="shrink-0">{item.badge}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card in Sidebar Bottom */}
        <div className="mt-auto p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <Avatar
              name={user?.name || 'Admin User'}
              src={user?.avatar}
              size="sm"
              status="online"
            />
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'admin@enterprise.com'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-gray-200 cursor-pointer transition-colors"
              title="Expandir/Recolher Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              <span>Portal</span>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
              <span className="text-gray-900 dark:text-slate-100 font-medium">
                {getPageTitle(currentPath)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
           
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Alternar Tema Claro/Escuro"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Menu */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 transition-all cursor-pointer">
                  <Avatar
                    name={user?.name || 'Admin'}
                    src={user?.avatar}
                    size="sm"
                    status="online"
                  />
                </button>
              }
              items={[
                {
                  key: 'profile-header',
                  label: (
                    <div className="pb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                  ),
                  disabled: true,
                },
                { key: 'div1', label: '', divider: true },
                {
                  key: 'settings',
                  label: 'Configurações de Segurança',
                  icon: <Sliders className="w-3.5 h-3.5" />,
                  onClick: () => onNavigate('/settings'),
                },
                {
                  key: 'docs',
                  label: 'Guia do Starter Kit',
                  icon: <BookOpen className="w-3.5 h-3.5" />,
                  onClick: () => onNavigate('/documentation'),
                },
                { key: 'div2', label: '', divider: true },
                {
                  key: 'logout',
                  label: 'Sair do Sistema (Logout)',
                  icon: <LogOut className="w-3.5 h-3.5" />,
                  danger: true,
                  onClick: logout,
                },
              ]}
            />
          </div>
        </header>

        {/* VIEWPORT CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F9FAFB] dark:bg-slate-950">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* HIGH DENSITY FOOTER / STATUS BAR */}
        <footer className="h-8 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center px-4 sm:px-6 lg:px-8 text-[11px] text-gray-500 dark:text-slate-400 font-medium justify-between shrink-0">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-gray-700 dark:text-slate-300">Sistememas</span>
            </span>
            <span className="hidden sm:inline text-gray-400 dark:text-slate-500">|</span>
            <span className="hidden sm:inline">Server: Laravel 11 / Sanctum API (v2.4.1)</span>
          </div>
          <div className="flex gap-3 text-[10px] text-gray-400 dark:text-slate-500 font-mono">
            <span>Sistememas</span>
           
          </div>
        </footer>
      </div>
    </div>
  );
};
