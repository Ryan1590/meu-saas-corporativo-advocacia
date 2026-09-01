import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginView } from './views/LoginView';
import { RegisterView, ForgotPasswordView, ResetPasswordView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { BirthdaysView } from './views/BirthdaysView';
import { UsersView } from './views/UsersView';
import { ClientesView } from './views/ClientesView';
import { ProcessosView } from './views/ProcessosView';
import { AdvogadosView } from './views/AdvogadosView';
import { StatusProcessosView } from './views/StatusProcessosView';
import { RelatoriosView } from './views/RelatoriosView';
import { NotificacoesView } from './views/NotificacoesView';
import { AgendaView, FinanceiroView, TarefasView } from './views/OperacoesJuridicasView';
import { DashboardJuridicoView } from './views/DashboardJuridicoView';
import { RolesPermissionsView } from './views/RolesPermissionsView';
import { ScreenPermissionsView } from './views/ScreenPermissionsView';
import { AuditLogsView } from './views/AuditLogsView';
import { EscritorioView } from './views/EscritorioView';
import { SettingsView } from './views/SettingsView';
import { ApiPlaygroundView } from './views/ApiPlaygroundView';
import { DesignSystemView } from './views/DesignSystemView';
import { DocumentationView } from './views/DocumentationView';
import { ForbiddenShield } from './views/ForbiddenView';
import { ROUTE_PERMISSIONS } from './context/AuthContext';

const MainRouter: React.FC = () => {
  const { user, isLoading, canAccessRoute } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname !== '/' ? window.location.pathname : '/infos-user';
  });

  const isClienteDetailRoute = /^\/clientes\//.test(currentPath) && currentPath !== '/clientes';
  const routePermissionPath = isClienteDetailRoute ? '/clientes' : currentPath;

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname !== '/' ? window.location.pathname : '/infos-user');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">Carregando ambiente seguro...</span>
        </div>
      </div>
    );
  }

  // Public guest routes must always be reachable, even with an active session.
  if (currentPath === '/register') {
    return <RegisterView onNavigate={navigate} />;
  }
  if (currentPath === '/forgot-password') {
    return <ForgotPasswordView onNavigate={navigate} />;
  }
  if (currentPath === '/reset-password') {
    return <ResetPasswordView onNavigate={navigate} />;
  }

  // Unauthenticated users are redirected to login for every other route.
  if (!user) {
    return <LoginView onNavigate={navigate} />;
  }

  // Route permission check (Layer 2 of the 5-Layer Security Architecture)
  const isAllowed = canAccessRoute(routePermissionPath);
  const requiredPerm = ROUTE_PERMISSIONS[routePermissionPath];

  // Render view inside AppLayout
  const renderCurrentView = () => {
    if (!isAllowed) {
      return (
        <ForbiddenShield
          requiredPermission={requiredPerm}
          onGoBack={() => navigate('/infos-user')}
        />
      );
    }

    switch (currentPath) {
      case '/infos-user':
        return <DashboardView onNavigate={navigate} />;
      case '/birthdays':
        return <BirthdaysView />;
      case '/users':
      case '/users/create':
      case '/users/edit':
        return <UsersView />;
      case '/clientes':
        return <ClientesView onNavigate={navigate} />;
      case '/advogados':
        return <AdvogadosView />;
      case '/status-processos':
        return <StatusProcessosView />;
      case '/processos':
        return <ProcessosView />;
      case '/tarefas':
        return <TarefasView />;
      case '/agenda':
        return <AgendaView />;
      case '/contratos':
      case '/financeiro':
        return <FinanceiroView />;
      case '/dashboard-juridico':
        return <DashboardJuridicoView />;
      case '/reports':
        return <RelatoriosView />;
      case '/notifications':
        return <NotificacoesView />;
      case '/roles':
      case '/permissions':
        return <RolesPermissionsView />;
      case '/screen-permissions':
        return <ScreenPermissionsView onNavigate={navigate} />;
      case '/logs':
        return <AuditLogsView />;
      case '/escritorio':
        return <EscritorioView />;
      case '/settings':
        return <SettingsView />;
      case '/api-playground':
        return <ApiPlaygroundView />;
      case '/design-system':
        return <DesignSystemView />;
      case '/documentation':
        return <DocumentationView />;
      default:
        if (isClienteDetailRoute) {
          return <ClientesView detailClientId={currentPath.split('/').filter(Boolean).at(-1) ?? null} onNavigate={navigate} />;
        }
        return <DashboardView onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {renderCurrentView()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainRouter />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
