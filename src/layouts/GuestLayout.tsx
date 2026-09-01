import React from 'react';
import { CheckCircle2, Lock, Scale, Moon, Shield, Sun, FileText, Users, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface GuestLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const GuestLayout: React.FC<GuestLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={
        isDark
          ? 'min-h-screen flex flex-col justify-center bg-slate-950 text-slate-100 relative overflow-hidden font-sans'
          : 'min-h-screen flex flex-col justify-center bg-slate-100 text-slate-900 relative overflow-hidden font-sans'
      }
    >
      <div
        className={
          theme === 'dark'
            ? 'absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900 to-slate-950'
            : 'absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white'
        }
      />
      <div className="absolute -top-28 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={
            theme === 'dark'
              ? 'p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer'
              : 'p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-colors cursor-pointer'
          }
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-12 gap-8 items-center">
        <div className="hidden lg:flex lg:col-span-6 flex-col text-left space-y-6 pr-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                ADV<span className="text-indigo-600 dark:text-indigo-400">CORP</span>
              </span>
              <p className="text-[11px] font-medium text-slate-400">Gestão Jurídica & Advocacia</p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={
                theme === 'dark'
                  ? 'inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300'
                  : 'inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700'
              }
            >
              <Shield className="w-3.5 h-3.5" />
              SaaS Jurídico Corporativo
            </div>

            <h1 className={theme === 'dark' ? 'text-4xl font-black tracking-tight text-white leading-tight max-w-xl' : 'text-4xl font-black tracking-tight text-slate-900 leading-tight max-w-xl'}>
              Gestão de clientes, processos e honorários de alta performance.
            </h1>

            <p className={theme === 'dark' ? 'text-sm text-slate-300 leading-relaxed max-w-lg' : 'text-sm text-slate-600 leading-relaxed max-w-lg'}>
              Centralize o ciclo completo da sua banca: processos vinculados por cliente, prazos processuais, agenda de audiências, contratos de honorários e controle de equipe.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xl">
            {[
              { icon: Users, label: 'Clientes & Processos' },
              { icon: Calendar, label: 'Prazos & Agenda' },
              { icon: Lock, label: 'Segurança & RBAC' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className={
                  theme === 'dark'
                    ? 'rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 shadow-lg shadow-slate-950/30'
                    : 'rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm shadow-slate-200/60'
                }
              >
                <Icon className={theme === 'dark' ? 'w-4 h-4 text-indigo-400 mb-2' : 'w-4 h-4 text-indigo-600 mb-2'} />
                <span className={theme === 'dark' ? 'text-[11px] font-medium text-slate-200' : 'text-[11px] font-medium text-slate-700'}>{label}</span>
              </div>
            ))}
          </div>

          <div className={theme === 'dark' ? 'pt-4 border-t border-slate-800/80 flex items-start gap-3 text-sm text-slate-300 max-w-lg' : 'pt-4 border-t border-slate-200 flex items-start gap-3 text-sm text-slate-600 max-w-lg'}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>Estrutura completa com árvore de processos vinculados, contratos de honorários e auditoria de atividades.</span>
          </div>
        </div>

        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div
            className={
              theme === 'dark'
                ? 'rounded-3xl border border-slate-800 bg-slate-900/90 shadow-[0_25px_80px_rgba(15,23,42,0.75)] p-6 sm:p-8 backdrop-blur-md'
                : 'rounded-3xl border border-slate-200 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.08)] p-6 sm:p-8 backdrop-blur-md'
            }
          >
            <div className="mb-6 text-left">
              <div
                className={
                  theme === 'dark'
                    ? 'inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300'
                    : 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-700'
                }
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Acesso Seguro
              </div>

              <h2 className={theme === 'dark' ? 'mt-4 text-2xl font-bold text-white tracking-tight' : 'mt-4 text-2xl font-bold text-slate-900 tracking-tight'}>{title}</h2>
              <p className={theme === 'dark' ? 'text-xs text-slate-400 mt-1' : 'text-xs text-slate-500 mt-1'}>{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
