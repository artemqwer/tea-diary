import React, { useState, useEffect, useTransition } from 'react';
import { useTheme } from './ThemeProvider';
import { useVibration } from './useVibration';
import { useLocale } from './LocaleProvider';
import { X, Palette, Moon, Sun, Leaf, Paintbrush, Smartphone } from 'lucide-react';

export const ThemeSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const { enabled: vibrationEnabled, setEnabled: setVibrationEnabled, tap } = useVibration();
  const { locale, t } = useLocale();
  const [localColors, setLocalColors] = useState(customColors);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalColors(customColors);
  }, [customColors, isOpen]);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'dark' as const,
      name: locale === 'uk' ? 'Темна' : 'Dark',
      accent: '#d97706',
      icon: <Moon size={14} />,
    },
    {
      id: 'light' as const,
      name: locale === 'uk' ? 'Світла' : 'Light',
      accent: '#d97706',
      icon: <Sun size={14} />,
    },
    {
      id: 'green' as const,
      name: locale === 'uk' ? 'Зелений чай' : 'Green',
      accent: '#66bb6a',
      icon: <Leaf size={14} />,
    },
    {
      id: 'purple' as const,
      name: locale === 'uk' ? 'Фіолетовий' : 'Purple',
      accent: '#a855f7',
      icon: <span>✦</span>,
    },
    {
      id: 'red' as const,
      name: locale === 'uk' ? 'Червоний' : 'Red',
      accent: '#f87171',
      icon: <span>✦</span>,
    },
    {
      id: 'blue' as const,
      name: locale === 'uk' ? 'Синій' : 'Blue',
      accent: '#3b82f6',
      icon: <span>✦</span>,
    },
    {
      id: 'custom' as const,
      name: locale === 'uk' ? 'Кастомна' : 'Custom',
      accent: localColors.accent,
      icon: <Paintbrush size={14} />,
    },
  ];

  const colorFields = [
    { key: 'accent' as const, label: 'Акцент', desc: 'Кнопки, активні елементи' },
    { key: 'bgPrimary' as const, label: 'Фон основний', desc: 'Головний фон' },
    { key: 'bgSecondary' as const, label: 'Фон вторинний', desc: 'Картки, панелі' },
    { key: 'bgTertiary' as const, label: 'Фон третинний', desc: 'Ховер, бордери' },
    { key: 'textPrimary' as const, label: 'Текст основний', desc: 'Заголовки' },
    { key: 'textSecondary' as const, label: 'Текст вторинний', desc: 'Підписи' },
    { key: 'borderPrimary' as const, label: 'Бордер', desc: 'Лінії розділу' },
  ];

  const handleColorChange = (key: keyof typeof localColors, value: string) => {
    const next = { ...localColors, [key]: value };
    setLocalColors(next);
    if (theme === 'custom') {
      setCustomColors(next);
    }
  };

  const handlePresetSelect = (
    preset: 'dark' | 'light' | 'green' | 'purple' | 'red' | 'blue' | 'custom'
  ) => {
    tap();
    startTransition(() => {
      setTheme(preset);
      if (preset === 'custom') {
        setCustomColors(localColors);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Palette size={22} style={{ color: 'var(--accent)' }} />
          <h3 className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>
            Тема додатку
          </h3>
        </div>

        {/* Theme presets grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {presets.map(p => {
            const isActive = theme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95"
                style={{
                  background: isActive ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                }}
              >
                {/* Color circle preview */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md"
                  style={{
                    background: p.accent + (p.id === 'light' ? '' : '33'),
                    border: `2px solid ${p.accent}`,
                    color: p.accent,
                  }}
                >
                  {p.icon}
                </div>
                <span
                  className="text-[10px] font-medium leading-tight text-center"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {p.name}
                </span>
                {isActive && <div className="absolute" style={{ display: 'none' }} />}
              </button>
            );
          })}
        </div>

        {/* Custom colors section */}
        {theme === 'custom' && (
          <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Кольори
            </p>
            {colorFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <label
                  className="relative w-10 h-10 rounded-lg overflow-hidden cursor-pointer shrink-0"
                  style={{ border: '2px solid var(--border-primary)' }}
                >
                  <input
                    type="color"
                    value={localColors[field.key]}
                    onChange={e => handleColorChange(field.key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full" style={{ background: localColors[field.key] }} />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {field.label}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {field.desc}
                  </div>
                </div>
                <code className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {localColors[field.key]}
                </code>
              </div>
            ))}
          </div>
        )}

        {/* Vibration toggle */}
        <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: vibrationEnabled ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: vibrationEnabled ? 'white' : 'var(--text-muted)',
                }}
              >
                <Smartphone size={20} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.profile.vibration}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {vibrationEnabled ? t.profile.vibration_on : t.profile.vibration_off}
                </div>
              </div>
            </div>
            <button
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className="w-12 h-7 rounded-full transition-all duration-200 relative"
              style={{
                background: vibrationEnabled ? 'var(--accent)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-all duration-200"
                style={{ left: vibrationEnabled ? '24px' : '2px' }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
