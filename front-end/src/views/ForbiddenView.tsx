import React from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '../components/design-system/Button';
import { useAuth } from '../context/AuthContext';

export const ForbiddenShield: React.FC<{
  requiredPermission?: string;
  message?: string;
  onGoBack?: () => void;
}> = ({
  requiredPermission = 'users.view',
  message = 'Seu perfil de usuário atual não possui a autorização necessária (Gate/Policy 403 Forbidden) para acessar esta tela.',
  onGoBack,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/20 max-w-2xl mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
        HTTP 403 Forbidden • Acesso Negado
      </span>

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
        Acesso Não Autorizado a Esta Tela
      </h2>

      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Security Context details */}
      <div className="mt-5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-left w-full space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Usuário Conectado:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {user?.name} ({user?.rolesDetails?.[0]?.label || 'Operador'})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Permissão Requerida:</span>
          <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded font-mono text-[11px]">
            {requiredPermission}
          </code>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Validação Real:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Laravel Policy / Gate Middleware (auth:sanctum)
          </span>
        </div>
      </div>

      {onGoBack && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={onGoBack}>
            Voltar ao painel
          </Button>
        </div>
      )}
    </div>
  );
};
