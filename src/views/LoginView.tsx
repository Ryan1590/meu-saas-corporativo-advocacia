import React, { useState } from 'react';
import { Mail, Lock, LogIn, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GuestLayout } from '../layouts/GuestLayout';
import { Input, Checkbox } from '../components/design-system/Input';
import { Button } from '../components/design-system/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginViewProps {
  onNavigate: (path: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('Admin@2026!Secure');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.message || 'Falha ao autenticar. Verifique suas credenciais.';
        setErrorMsg(msg);
        toastError(msg, 'Erro de Acesso');
        return;
      }

      success(`Bem-vindo de volta, ${json.data.user.name}!`, 'Autenticado');
      login(json.data.token, json.data.user);
      onNavigate('/infos-user');
    } catch (err) {
      setErrorMsg('Erro de conexão com o servidor. Tente novamente.');
      toastError('Não foi possível conectar ao backend.', 'Erro de Rede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestLayout
      title="Acesse sua conta"
      subtitle="Informe suas credenciais corporativas para entrar no painel"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Input
          label="E-mail Corporativo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@empresa.com"
          leftIcon={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
        />

        <Input
          label="Senha de Acesso"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <Checkbox
            label="Lembrar-me neste dispositivo"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <button
            type="button"
            onClick={() => onNavigate('/forgot-password')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
          className="mt-2"
        >
          Entrar no Sistema
        </Button>

        {/* Quick Demo Access Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Acesso Rápido para Testes (Clique para preencher e entrar):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@empresa.com');
                setPassword('Admin@2026!Secure');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin (Total)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('advogado@empresa.com');
                setPassword('Admin@2026!Secure');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-500" />
              <span>Advogado</span>
            </button>
          </div>
        </div>
      </form>
    </GuestLayout>
  );
};
