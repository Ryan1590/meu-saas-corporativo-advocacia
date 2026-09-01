import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Download,
  Mail,
  Lock,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/design-system/Button';
import { Input, Select, Checkbox, Switch } from '../components/design-system/Input';
import { Badge, Avatar, Card } from '../components/design-system/Badge';
import { Tabs, Skeleton } from '../components/design-system/Tabs';
import { Modal } from '../components/design-system/Modal';
import { Dropdown, Tooltip } from '../components/design-system/Dropdown';
import { useToast } from '../context/ToastContext';

export const DesignSystemView: React.FC = () => {
  const { success, error, warning, info } = useToast();

  const [inputVal, setInputVal] = useState('Valor de Exemplo');
  const [selectVal, setSelectVal] = useState('option1');
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [activeTab, setActiveTab] = useState('buttons');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Design System & Componentes UI
          </h2>
          <Badge variant="indigo" size="sm">
            Tailwind CSS + Accessibility
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Biblioteca modular de 22+ componentes reutilizáveis para interfaces SaaS corporativas
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'buttons', label: 'Botões & Ações' },
          { id: 'forms', label: 'Campos de Formulário' },
          { id: 'badges', label: 'Badges, Avatares & Cards' },
          { id: 'feedback', label: 'Feedback, Toasts & Modais' },
        ]}
      />

      {/* TAB: BUTTONS */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <Card title="Variantes de Botões" subtitle="Estilos semânticos para hierarquia de ações">
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md">
                  Botão Primário
                </Button>
                <Button variant="secondary" size="md">
                  Botão Secundário
                </Button>
                <Button variant="outline" size="md">
                  Botão Outline
                </Button>
                <Button variant="danger" size="md">
                  Botão Destrutivo (Danger)
                </Button>
                <Button variant="ghost" size="md">
                  Botão Fantasma (Ghost)
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tamanhos Disponíveis:
                </h5>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="xs">
                    Extra Pequeno (xs)
                  </Button>
                  <Button variant="primary" size="sm">
                    Pequeno (sm)
                  </Button>
                  <Button variant="primary" size="md">
                    Médio (md - Padrão)
                  </Button>
                  <Button variant="primary" size="lg">
                    Grande (lg)
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Estados & Ícones:
                </h5>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Com Ícone à Esquerda
                  </Button>
                  <Button variant="secondary" rightIcon={<Download className="w-4 h-4" />}>
                    Com Ícone à Direita
                  </Button>
                  <Button variant="primary" isLoading>
                    Estado de Carregamento
                  </Button>
                  <Button variant="primary" disabled>
                    Desabilitado
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: FORMS */}
      {activeTab === 'forms' && (
        <div className="space-y-6">
          <Card title="Controles de Entrada" subtitle="Inputs estilizados com suporte a ícones, validação e estados">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                label="Campo de Texto Padrão"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                helperText="Texto de apoio para orientar o usuário"
              />

              <Input
                label="Com Ícone à Esquerda"
                placeholder="seu.email@empresa.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Campo de Senha com Alternância"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Campo com Erro de Validação"
                defaultValue="valor_invalido"
                error="O formato fornecido não é válido para este campo."
              />

              <Select
                label="Caixa de Seleção (Select)"
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                options={[
                  { value: 'option1', label: 'Opção 1 - Produção' },
                  { value: 'option2', label: 'Opção 2 - Homologação' },
                  { value: 'option3', label: 'Opção 3 - Desenvolvimento' },
                ]}
              />

              <div className="space-y-4 pt-2">
                <Checkbox
                  label="Caixa de Seleção (Checkbox)"
                  description="Opção que pode ser ativada ou desativada individualmente"
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                />

                <Switch
                  label="Interruptor (Toggle Switch)"
                  description="Controle booleano para preferências instantâneas"
                  checked={switchVal}
                  onCheckedChange={setSwitchVal}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: BADGES & AVATARS */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <Card title="Badges Semânticos e Avatares">
            <div className="space-y-4 pt-2">
              <div>
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Badges de Status:
                </h5>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" dot>
                    Primário (Indigo)
                  </Badge>
                  <Badge variant="success" dot>
                    Sucesso (Ativo)
                  </Badge>
                  <Badge variant="warning" dot>
                    Aviso (Pendente)
                  </Badge>
                  <Badge variant="danger" dot>
                    Perigo (Bloqueado)
                  </Badge>
                  <Badge variant="purple">
                    Roxo (Sistema)
                  </Badge>
                  <Badge variant="neutral">
                    Neutro
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Avatares com Indicador de Presença:
                </h5>
                <div className="flex items-center gap-4">
                  <Avatar name="Carlos Silva" size="xs" status="online" />
                  <Avatar name="Mariana Rios" size="sm" status="online" />
                  <Avatar name="Lucas Oliveira" size="md" status="busy" />
                  <Avatar name="Beatriz Lima" size="lg" status="offline" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: FEEDBACK & MODALS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <Card title="Disparo de Notificações Toast & Modais">
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => success('Operação realizada com sucesso no servidor!')}
                >
                  Toast Sucesso
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => error('Falha ao processar solicitação (HTTP 500).')}
                >
                  Toast Erro
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => warning('Atenção: sua sessão irá expirar em 5 minutos.')}
                >
                  Toast Aviso
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => info('Uma nova versão do template está disponível.')}
                >
                  Toast Informação
                </Button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="primary" size="md" onClick={() => setIsDemoModalOpen(true)}>
                  Abrir Modal de Demonstração
                </Button>
              </div>
            </div>
          </Card>

          {/* Skeletons preview */}
          <Card title="Estados de Carregamento (Skeletons)">
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      )}

      {/* DEMO MODAL */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Modal de Exemplo do Design System"
        description="Componente modal acessível com foco gerenciado e suporte a ESC"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDemoModalOpen(false)}>
              Fechar
            </Button>
            <Button variant="primary" onClick={() => setIsDemoModalOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
          Este modal é renderizado via portal no DOM, com animações suaves e fundo com backdrop-blur. Pode ser reutilizado em qualquer tela do sistema.
        </p>
      </Modal>
    </div>
  );
};
