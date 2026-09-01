import React, { useId, useRef, useState } from 'react';
import { AlertCircle, FileText, Upload, X } from 'lucide-react';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export interface DocumentFileInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export const DocumentFileInput: React.FC<DocumentFileInputProps> = ({ value, onChange, error, disabled = false, id }) => {
  const generatedId = useId();
  const inputId = id ?? `document-file-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const message = error ?? localError;

  const selectFile = (file: File | null) => {
    setLocalError(undefined);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setLocalError('O arquivo deve ter no máximo 20 MB.');
      return;
    }
    onChange(file);
  };

  const removeFile = () => {
    if (inputRef.current) inputRef.current.value = '';
    setLocalError(undefined);
    onChange(null);
  };

  return <div className="space-y-1.5 text-left sm:col-span-2"><span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Documento</span><input ref={inputRef} id={inputId} type="file" accept={ACCEPTED_TYPES} disabled={disabled} className="sr-only" aria-describedby={message ? `${inputId}-error` : `${inputId}-helper`} onChange={(event) => selectFile(event.target.files?.[0] ?? null)} /><div className={`flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between ${message ? 'border-rose-400 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/60'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>{value ? <div className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{value.name}</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{formatFileSize(value.size)}</p></div></div> : <div><p className="text-xs font-medium text-slate-700 dark:text-slate-200">PDF, Office ou imagem</p><p id={`${inputId}-helper`} className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Até 20 MB</p></div>}<div className="flex shrink-0 items-center gap-2"><label htmlFor={inputId} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 ${disabled ? 'pointer-events-none' : ''}`}><Upload className="h-3.5 w-3.5" aria-hidden="true" />Selecionar documento</label>{value && <button type="button" onClick={removeFile} disabled={disabled} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed dark:hover:bg-rose-950/40" aria-label="Remover documento" title="Remover documento"><X className="h-4 w-4" aria-hidden="true" /></button>}</div></div>{message && <p id={`${inputId}-error`} className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{message}</p>}</div>;
};