import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Sparkles, Check } from 'lucide-react';
import { Avatar } from './Badge';
import { Button } from './Button';

export interface AvatarUploadProps {
  value?: string;
  name?: string;
  onChange: (avatarUrl: string) => void;
  label?: string;
  helperText?: string;
}

const PRESET_AVATARS = [
  { id: '1', label: 'Executiva 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: '2', label: 'Executivo 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: '3', label: 'Especialista 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: '4', label: 'Desenvolvedor', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: '5', label: 'Gestora', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: '6', label: 'Designer', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
];

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value = '',
  name = '',
  onChange,
  label = 'Foto de Perfil do Usuário',
  helperText = 'Formatos suportados: JPG, PNG, WEBP ou SVG (máx. 4MB)',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setFileError(null);
    if (!file.type.startsWith('image/')) {
      setFileError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFileError('O arquivo de imagem deve ter no máximo 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        {/* Avatar Display */}
        <div className="relative group shrink-0">
          <Avatar src={value} name={name || 'User'} size="xl" className="w-16 h-16 text-lg shadow-sm" />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-transform transform hover:scale-110 cursor-pointer"
              title="Remover foto"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action tabs & options */}
        <div className="flex-1 w-full space-y-2.5 min-w-0">
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Upload className="w-3 h-3" /> Upload Arquivo
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Galeria / Avatares
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3" /> Link / URL
              </span>
            </button>
          </div>

          {/* TAB: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Clique para selecionar
                  </span>
                  <span>ou arraste uma imagem aqui</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}

          {/* TAB: PRESET AVATARS */}
          {activeTab === 'preset' && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selecione um avatar representativo para este perfil:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChange(preset.url)}
                      className={`relative rounded-full transition-all shrink-0 cursor-pointer p-0.5 ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 scale-105'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      {isSelected && (
                        <span className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: DIRECT URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/avatar.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <Button type="submit" size="xs" variant="primary">
                Aplicar URL
              </Button>
            </form>
          )}

          {fileError && <p className="text-xs text-rose-500">{fileError}</p>}
        </div>
      </div>
    </div>
  );
};
