'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-xs px-4">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
        success: { bg: 'var(--bg-secondary)', border: 'var(--success)', icon: '✓' },
        error: { bg: 'var(--bg-secondary)', border: 'var(--danger)', icon: '✕' },
        info: { bg: 'var(--bg-secondary)', border: 'var(--accent)', icon: 'ℹ' },
    };

    const c = colors[toast.type];

    return (
        <div
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-2 fade-in duration-200"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: 'var(--text-primary)',
            }}
        >
            <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: c.border }}
            >
                {c.icon}
            </span>
            <span className="text-sm">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-auto text-xs opacity-50 hover:opacity-100 shrink-0"
                style={{ color: 'var(--text-muted)' }}
            >
                ✕
            </button>
        </div>
    );
};
