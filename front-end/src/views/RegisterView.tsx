import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { GuestLayout } from '../layouts/GuestLayout';
import { Input, Checkbox } from '../components/design-system/Input';
import { Button } from '../components/design-system/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterViewProps {
  onNavigate: (path: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== passwordConfirmation) {
      setErrors({ passwordConfirmation: 'As senhas não coincidem.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, passwordConfirmation }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors) {
          const errObj: Record<string, string> = {};
          Object.keys(json.errors).forEach((k) => {
            errObj[k] = json.errors[k][0];
          });
          setErrors(errObj);
        }
        toastError(json.message || 'Erro ao realizar cadastro.', 'Erro no Formulário');
        return;
      }

      success('Sua conta foi criada com sucesso!', 'Cadastro Concluído');
      login(json.data.token, json.data.user);
      onNavigate('/dashboard');
    } catch (err) {
      toastError('Falha ao conectar com o servidor.', 'Erro de Rede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestLayout
      title="Crie sua conta corporativa"
      subtitle="Cadastre-se para obter acesso ao workspace e ferramentas"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        <Input
          label="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João da Silva"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name}
          required
        />

        <Input
          label="E-mail Corporativo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="joao.silva@empresa.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email}
          required
        />

        <Input
          label="Senha de Acesso"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password}
          required
        />

        <Input
          label="Confirmar Senha"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Repita a senha"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.passwordConfirmation}
          required
        />

        <Checkbox
          label="Concordo com os Termos de Serviço e Política de Privacidade"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isLoading}
          disabled={!agreeTerms}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="mt-2"
        >
          Finalizar Cadastro
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Já possui uma conta? Voltar ao Login</span>
          </button>
        </div>
      </form>
    </GuestLayout>
  );
};

export const ForgotPasswordView: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toastError(json.message || 'Não foi possível enviar o link de recuperação.', 'Erro');
        return;
      }

      setSent(true);
      success(json.message || `Link de recuperação enviado para ${email}`, 'E-mail Enviado');
    } catch (err) {
      toastError('Falha ao conectar com o servidor.', 'Erro de Rede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestLayout
      title="Recuperação de Senha"
      subtitle="Enviaremos um link seguro para você redefinir sua senha de acesso"
    >
      {sent ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">Verifique seu e-mail</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Se o endereço <span className="text-indigo-400 font-semibold">{email}</span> estiver cadastrado, enviamos as instruções de redefinição.
          </p>
          <Button variant="secondary" size="md" fullWidth onClick={() => onNavigate('/login')}>
            Voltar para o Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="E-mail Cadastrado"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@empresa.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading}>
            Enviar Link de Recuperação
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Login</span>
            </button>
          </div>
        </form>
      )}
    </GuestLayout>
  );
};

export const ResetPasswordView: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { success, error: toastError } = useToast();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Este link de definição de senha é inválido ou está incompleto.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || 'Não foi possível definir a nova senha.');
        return;
      }

      success('Senha definida com sucesso. Faça login para continuar.', 'Senha Atualizada');
      onNavigate('/login');
    } catch (err) {
      toastError('Falha ao conectar com o servidor.', 'Erro de Rede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestLayout
      title="Defina sua senha"
      subtitle="Escolha uma senha segura para concluir o acesso à sua conta"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="E-mail"
          type="email"
          value={email}
          leftIcon={<Mail className="w-4 h-4" />}
          disabled
        />

        <Input
          label="Nova Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirmar Nova Senha"
          type="password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repita a nova senha"
          leftIcon={<Lock className="w-4 h-4" />}
          error={error}
          required
        />

        <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading}>
          Definir Senha
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Login</span>
          </button>
        </div>
      </form>
    </GuestLayout>
  );
};
