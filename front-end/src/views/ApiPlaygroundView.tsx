import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Send,
  Lock,
  Layers,
  Code2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, Badge } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { Input, Select } from '../components/design-system/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ApiPlaygroundView: React.FC = () => {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();

  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [endpoint, setEndpoint] = useState('/api/v1/dashboard/metrics');
  const [requestBody, setRequestBody] = useState('{\n  "name": "Novo Usuário",\n  "email": "teste@empresa.com",\n  "password": "Password123!",\n  "roles": ["role-operator"],\n  "status": "active"\n}');
  const [bearerToken, setBearerToken] = useState('1|sanctum_enterprise_token_demo');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const predefinedEndpoints = [
    { label: 'GET /api/v1/dashboard/metrics', method: 'GET', path: '/api/v1/dashboard/metrics', body: '' },
    { label: 'GET /api/v1/users', method: 'GET', path: '/api/v1/users?page=1&perPage=5', body: '' },
    { label: 'POST /api/v1/users (Criar Usuário)', method: 'POST', path: '/api/v1/users', body: '{\n  "name": "Carlos Eduardo",\n  "email": "carlos.novo@empresa.com",\n  "password": "Password@2026",\n  "roles": ["role-operator"],\n  "status": "active"\n}' },
    { label: 'GET /api/v1/roles', method: 'GET', path: '/api/v1/roles', body: '' },
    { label: 'GET /api/v1/permissions', method: 'GET', path: '/api/v1/permissions', body: '' },
    { label: 'GET /api/v1/logs', method: 'GET', path: '/api/v1/logs?perPage=5', body: '' },
    { label: 'GET /api/v1/auth/user (Me)', method: 'GET', path: '/api/v1/auth/user', body: '' },
  ];

  const handleSelectPredefined = (item: (typeof predefinedEndpoints)[0]) => {
    setMethod(item.method as any);
    setEndpoint(item.path);
    if (item.body) {
      setRequestBody(item.body);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(endpoint, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const headersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      setResponseHeaders(headersObj);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));

      if (res.ok) {
        success(`Requisição HTTP ${res.status} concluída com sucesso!`);
      } else {
        toastError(`Resposta da API: HTTP ${res.status}`);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message || 'Falha na requisição' }, null, 2));
      toastError('Erro ao executar chamada na API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCurl = () => {
    let curl = `curl -X ${method} "${window.location.origin}${endpoint}" \\\n  -H "Authorization: Bearer ${bearerToken}" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json"`;
    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
      curl += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Comando cURL copiado!');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              API Playground & Sanctum Tester
            </h2>
            <Badge variant="indigo" size="sm">
              REST v1
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ambiente interativo para testar endpoints protegidos, autenticação Bearer token e validações FormRequest
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          onClick={handleCopyCurl}
        >
          {copied ? 'cURL Copiado' : 'Copiar cURL'}
        </Button>
      </div>

      {/* Predefined Quick Selectors */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-400 self-center mr-1">
          Exemplos Rápidos:
        </span>
        {predefinedEndpoints.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPredefined(item)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Request Configuration Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="Parâmetros da Requisição HTTP">
            <div className="space-y-4 pt-2">
              {/* Method + URL Input */}
              <div className="flex gap-2">
                <div className="w-32 shrink-0">
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'PATCH', label: 'PATCH' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/v1/..."
                  />
                </div>
              </div>

              {/* Bearer Token Header */}
              <Input
                label="Authorization (Bearer Token Sanctum)"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              />

              {/* JSON Body (for POST/PUT/PATCH) */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Corpo da Requisição (JSON Body)
                  </label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
                onClick={handleExecute}
              >
                Enviar Requisição
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Response Output */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Resposta do Servidor (Response)"
            action={
              responseStatus && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      responseStatus >= 200 && responseStatus < 300
                        ? 'success'
                        : responseStatus === 403
                        ? 'danger'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    HTTP {responseStatus}
                  </Badge>
                  {responseTime && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {responseTime}ms
                    </span>
                  )}
                </div>
              )
            }
          >
            {responseBody ? (
              <div className="space-y-3 pt-2">
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
                    {responseBody}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(responseBody);
                      success('JSON copiado!');
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copiar JSON"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs">
                  Configure os parâmetros à esquerda e clique em{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    Enviar Requisição
                  </strong>{' '}
                  para inspecionar a resposta.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
