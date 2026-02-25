import React from 'react';
import { useLocale } from './LocaleProvider';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  const { t } = useLocale();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--accent)' }}>
          <AlertTriangle size={24} />
          <h3 className="text-lg font-serif font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            {t.confirm.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
            }}
          >
            {t.confirm.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
