import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Key,
  Shield,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  Lock,
  Sparkles,
  User,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Avatar } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { Input, Switch, Select } from '../components/design-system/Input';
import { Modal } from '../components/design-system/Modal';
import { AvatarUpload } from '../components/design-system/AvatarUpload';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ForbiddenShield } from './ForbiddenView';

interface ApiToken {
  id: string;
  name: string;
  abilities: string[];
  lastUsedAt: string | null;
  createdAt: string;
  plainTextToken?: string;
}

export const SettingsView: React.FC = () => {
  const { user, can, updateCurrentUser } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'tokens' | 'security'>('profile');

  // User Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profileData if current logged-in user changes (e.g., demo user switch)
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        twoFactorEnabled: user.twoFactorEnabled || false,
      });
    }
  }, [user]);

  // Tokens State
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenAbilities, setNewTokenAbilities] = useState<string[]>(['*']);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    appName: 'CoreBase SaaS Platform',
    sessionLifetime: '120',
    enforce2FA: false,
    maxLoginAttempts: '5',
    lockoutDurationMinutes: '15',
    requireSpecialChars: true,
  });

  useEffect(() => {
    setTokens([
      {
        id: 'tok-1',
        name: 'Mobile App Sanctum Token',
        abilities: ['users:read', 'dashboard:read'],
        lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'tok-2',
        name: 'CI/CD Pipeline Integration',
        abilities: ['*'],
        lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: '2026-08-10T14:30:00Z',
      },
    ]);
  }, []);

  if (!can('settings.view')) {
    return (
      <ForbiddenShield
        requiredPermission="settings.view"
        message="Acesso restrito às Configurações e Gerenciamento de Tokens Sanctum."
      />
    );
  }

  // Handle Profile Update with Photo
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        updateCurrentUser(json.data);
        success('Foto e informações do perfil atualizadas com sucesso!');
      } else {
        toastError(json.message || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      toastError('Erro de comunicação ao salvar perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName) return;

    const fakeSanctumToken = `1|sanctum_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newTok: ApiToken = {
      id: `tok-${Date.now()}`,
      name: newTokenName,
      abilities: newTokenAbilities,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      plainTextToken: fakeSanctumToken,
    };

    setTokens([newTok, ...tokens]);
    setGeneratedToken(fakeSanctumToken);
    success(`Token "${newTokenName}" gerado com sucesso!`);
  };

  const handleDeleteToken = (id: string) => {
    setTokens(tokens.filter((t) => t.id !== id));
    success('Token de API revogado com sucesso.');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Token copiado para a área de transferência!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    success('Configurações de segurança atualizadas com sucesso!');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configurações, Perfil & Preferências
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gerencie sua foto de perfil, preferências de tema visual, credenciais Sanctum e segurança
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Meu Perfil & Foto
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          Tema & Aparência
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'tokens'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" /> Tokens Sanctum
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Políticas & Segurança
        </button>
      </div>

      {/* TAB 1: MEU PERFIL & FOTO */}
      {activeTab === 'profile' && (
        <Card
          title="Informações do Usuário & Foto de Perfil"
          subtitle="Atualize a foto da sua conta (Laravel Jetstream), nome e preferências de autenticação"
        >
          <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
            <AvatarUpload
              value={profileData.avatar}
              name={profileData.name}
              onChange={(newAvatar) => setProfileData({ ...profileData, avatar: newAvatar })}
              label="Sua Foto de Perfil (Avatar)"
              helperText="Faça upload de uma foto, escolha da galeria ou cole um link de imagem"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />

              <Input
                label="E-mail Corporativo"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Segurança do Perfil
              </h4>
              <Switch
                label="Autenticação em Dois Fatores (2FA Fortify)"
                description="Adiciona uma camada extra de segurança utilizando aplicativos TOTP"
                checked={profileData.twoFactorEnabled}
                onCheckedChange={(checked) =>
                  setProfileData({ ...profileData, twoFactorEnabled: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                isLoading={isSavingProfile}
              >
                Salvar Alterações do Perfil
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: TEMA & APARÊNCIA */}
      {activeTab === 'theme' && (
        <Card
          title="Tema e Preferências Visuais"
          subtitle="Escolha entre o modo claro de alta legibilidade ou o modo escuro de alto contraste"
        >
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <div
                onClick={() => setTheme('light')}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Modo Claro (Light)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Fundo branco/cinza claro, ideal para ambientes iluminados
                      </p>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Modo Escuro (Dark)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paleta Slate-950 profunda, excelente para foco e conforto visual
                      </p>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Status Atual do Tema: <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{theme}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  A alteração é persistida automaticamente no navegador via localStorage.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
                leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              >
                Alternar Agora
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: API TOKENS */}
      {activeTab === 'tokens' && (
        <Card
          title="Tokens de Acesso da API (Laravel Sanctum)"
          subtitle="Tokens emitidos para integrações de terceiros ou clientes móveis"
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setGeneratedToken(null);
                setNewTokenName('');
                setIsTokenModalOpen(true);
              }}
            >
              Novo Token Sanctum
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-5 -mb-5">
            {tokens.map((token) => (
              <div key={token.id} className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {token.name}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {token.abilities.join(', ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Criado em: {new Date(token.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>
                      Último uso:{' '}
                      {token.lastUsedAt
                        ? new Date(token.lastUsedAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Nunca utilizado'}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={() => handleDeleteToken(token.id)}
                >
                  Revogar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: POLÍTICAS & SEGURANÇA */}
      {activeTab === 'security' && (
        <Card
          title="Políticas de Segurança e Sessões"
          subtitle="Regras de expiração de sessão e proteção contra ataques de força bruta"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome da Aplicação (APP_NAME)"
                value={systemSettings.appName}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, appName: e.target.value })
                }
              />

              <Select
                label="Tempo de Vida da Sessão (SESSION_LIFETIME)"
                value={systemSettings.sessionLifetime}
                onChange={(e) =>
                  setSystemSettings({ ...systemSettings, sessionLifetime: e.target.value })
                }
                options={[
                  { value: '30', label: '30 Minutos' },
                  { value: '60', label: '1 Hora' },
                  { value: '120', label: '2 Horas (Padrão Laravel)' },
                  { value: '480', label: '8 Horas' },
                  { value: '1440', label: '24 Horas' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Limite de Tentativas de Login (Rate Limiter)"
                type="number"
                value={systemSettings.maxLoginAttempts}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    maxLoginAttempts: e.target.value,
                  })
                }
              />

              <Input
                label="Duração do Bloqueio em Minutos"
                type="number"
                value={systemSettings.lockoutDurationMinutes}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    lockoutDurationMinutes: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-3 pt-2">
              <Switch
                label="Exigir Caracteres Especiais nas Senhas"
                description="Senhas devem conter números, maiúsculas e símbolos especiais"
                checked={systemSettings.requireSpecialChars}
                onCheckedChange={(checked) =>
                  setSystemSettings({ ...systemSettings, requireSpecialChars: checked })
                }
              />

              <Switch
                label="Obrigatoriedade de 2FA para Administradores"
                description="Força a ativação de autenticação em dois fatores com Google Authenticator"
                checked={systemSettings.enforce2FA}
                onCheckedChange={(checked) =>
                  setSystemSettings({ ...systemSettings, enforce2FA: checked })
                }
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Salvar Alterações de Segurança
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* CREATE TOKEN MODAL */}
      <Modal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        title="Emitir Novo Token Sanctum"
        size="md"
        footer={
          generatedToken ? (
            <Button variant="primary" onClick={() => setIsTokenModalOpen(false)}>
              Concluído
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsTokenModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreateToken}>
                Gerar Token
              </Button>
            </>
          )
        }
      >
        {generatedToken ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
              <strong>Token gerado com sucesso!</strong> Copie agora, pois ele não será exibido novamente.
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs break-all">
              <span className="flex-1">{generatedToken}</span>
              <Button
                variant="secondary"
                size="xs"
                leftIcon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                onClick={() => handleCopy(generatedToken)}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateToken} className="space-y-4">
            <Input
              label="Nome do Token"
              placeholder="Ex: Integração ERP"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              required
            />

            <Select
              label="Habilidades (Abilities)"
              value={newTokenAbilities[0]}
              onChange={(e) => setNewTokenAbilities([e.target.value])}
              options={[
                { value: '*', label: 'Acesso Completo (*)' },
                { value: 'users:read', label: 'Somente Leitura (read-only)' },
                { value: 'users:write', label: 'Leitura e Escrita (read/write)' },
              ]}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};
