'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  addTeaAction,
  deleteTeaAction,
  addSessionAction,
  updateUserAvatarAction,
  analyzeTeaImageAction,
} from './../actions';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import { useVibration } from './useVibration';
import { LocaleProvider, useLocale } from './LocaleProvider';

import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Home,
  History,
  Droplets,
  Clock,
  Leaf,
  ChevronRight,
  Search,
  X,
  Pencil,
  Save,
  Trash2,
  AlertTriangle,
  Star,
  User,
  LogOut,
  Settings,
  Camera,
  RefreshCw,
  Calendar,
  Sparkles,
  Upload,
  Palette,
  Sun,
  Moon,
  Paintbrush,
  Smartphone,
} from 'lucide-react';

// --- NavButton з вібрацією ---
const NavButton = ({
  tab,
  icon,
  label,
  activeTab,
  setActiveTab,
}: {
  tab: string;
  icon: React.ReactNode;
  label: string;
  activeTab: string;
  setActiveTab: (t: any) => void;
}) => {
  const { tap } = useVibration();
  return (
    <button
      onClick={() => {
        tap();
        setActiveTab(tab);
      }}
      className="flex flex-col items-center gap-1 p-2 transition-colors"
      style={{ color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

// --- ТИПИ ---
type Tea = {
  id: string;
  name: string;
  type: string;
  color?: string | null;
  year: number;
  origin: string;
  total: number;
  remaining: number;
};

type Session = {
  id: string;
  tea?: { name: string; type: string };
  date: Date;
  duration: number;
  steeps: number;
  volume: number;
  rating: number;
};

// --- ДОПОМІЖНІ КОМПОНЕНТИ ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  const { t } = useLocale();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
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

// --- МОДАЛКА ВИБОРУ АВАТАРА ---
const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
  const { locale } = useLocale();
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [style, setStyle] = useState('notionists');
  const [tab, setTab] = useState<'generate' | 'upload'>('generate');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'notionists', name: 'Sketch' },
    { id: 'adventurer', name: 'Adventurer' },
    { id: 'fun-emoji', name: 'Emoji' },
    { id: 'bottts', name: 'Robot' },
  ];

  const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        // Crop to square from center
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;

        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await compressAvatar(file);
      setUploadPreview(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (tab === 'upload' && uploadPreview) {
      onSelect(uploadPreview);
    } else {
      onSelect(avatarUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3
          className="text-xl font-serif mb-4 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {locale === 'uk' ? 'Виберіть образ' : 'Choose avatar'}
        </h3>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-tertiary)' }}>
          <button
            onClick={() => setTab('generate')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={
              tab === 'generate'
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-secondary)' }
            }
          >
            🎲 {locale === 'uk' ? 'Генерувати' : 'Generate'}
          </button>
          <button
            onClick={() => setTab('upload')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={
              tab === 'upload'
                ? { background: 'var(--accent)', color: 'white' }
                : { color: 'var(--text-secondary)' }
            }
          >
            📷 {locale === 'uk' ? 'Своє фото' : 'Upload photo'}
          </button>
        </div>

        {tab === 'generate' && (
          <>
            <div className="flex justify-center mb-8">
              <div
                className="w-32 h-32 rounded-full border-4 overflow-hidden relative group"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-border)' }}
              >
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSeed(Math.random().toString(36).substring(7))}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RefreshCw className="text-white" size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {styles.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className="py-2 px-1 rounded-lg text-xs font-medium transition-colors"
                  style={
                    style === s.id
                      ? { background: 'var(--accent)', color: 'white' }
                      : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSeed(Math.random().toString(36).substring(7))}
                className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={16} />
                {locale === 'uk' ? 'Випадковий' : 'Random'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl text-white font-medium transition-colors"
                style={{ background: 'var(--accent)' }}
              >
                {locale === 'uk' ? 'Зберегти' : 'Save'}
              </button>
            </div>
          </>
        )}

        {tab === 'upload' && (
          <>
            <div className="flex justify-center mb-6">
              <div
                className="w-32 h-32 rounded-full border-4 overflow-hidden relative group cursor-pointer"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <img
                    src={uploadPreview}
                    alt="Custom Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {uploading ? (
                      <RefreshCw className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Camera size={28} className="mb-1" />
                        <span className="text-[10px]">Натисніть</span>
                      </>
                    )}
                  </div>
                )}
                {uploadPreview && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              {locale === 'uk'
                ? 'Фото буде обрізане до квадрата і стиснуте автоматично'
                : 'Photo will be cropped to square and compressed automatically'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <Upload size={16} />
                {uploadPreview
                  ? locale === 'uk'
                    ? 'Змінити'
                    : 'Change'
                  : locale === 'uk'
                    ? 'Обрати'
                    : 'Choose'}
              </button>
              <button
                onClick={handleSave}
                disabled={!uploadPreview}
                className="flex-1 py-3 rounded-xl font-medium transition-colors"
                style={
                  uploadPreview
                    ? { background: 'var(--accent)', color: 'white' }
                    : {
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                        cursor: 'not-allowed',
                      }
                }
              >
                {locale === 'uk' ? 'Зберегти' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- МОДАЛКА НАЛАШТУВАНЬ ТЕМИ ---
const ThemeSettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const { enabled: vibrationEnabled, setEnabled: setVibrationEnabled, tap } = useVibration();
  const { locale, setLocale, t } = useLocale();
  const [localColors, setLocalColors] = useState(customColors);

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
    setTheme(preset);
    if (preset === 'custom') {
      setCustomColors(localColors);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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
                className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-200"
                style={{ left: vibrationEnabled ? '24px' : '2px' }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ПРОФІЛЬНЕ МЕНЮ ---
const UserProfileMenu = ({
  user,
  onUserUpdate,
}: {
  user: any;
  onUserUpdate: (newUser: any) => void;
}) => {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const { tap } = useVibration();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleAvatarUpdate = async (url: string) => {
    try {
      // Оптимістичне оновлення локально
      const updatedUser = { ...user, image: url };
      onUserUpdate(updatedUser);

      // Оновлення на сервері
      await updateUserAvatarAction(url);

      // Оновлення даних сесії (soft refresh)
      router.refresh();
    } catch (e) {
      console.error('Avatar update failed', e);
      // Можна додати тост з помилкою
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const Avatar = ({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'lg' }) => {
    if (user?.image) {
      return <img src={user.image} alt={user.name} className={`${className} object-cover`} />;
    }
    return (
      <div
        className={`${className} flex items-center justify-center text-white font-bold ${size === 'lg' ? 'text-xl' : 'text-xs'}`}
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        {getInitials(user?.name)}
      </div>
    );
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 overflow-hidden"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <Avatar className="w-10 h-10" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-12 w-72 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            {/* User info */}
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div className="flex items-center gap-4 mb-2">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                  style={{ borderRadius: '9999px' }}
                >
                  <Avatar className="w-16 h-16 rounded-full border-2 border-current" size="lg" />
                  <div
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--border-primary)' }}
                  >
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium truncate text-lg"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.name || (locale === 'uk' ? 'Користувач' : 'User')}
                  </h4>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="w-full mt-2 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}
              >
                {t.profile.change_avatar}
              </button>
            </div>

            {/* Menu options */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowThemeModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Palette size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium">{t.profile.theme_settings}</span>
              </button>

              {/* Language switcher inline */}
              <div className="flex items-center gap-3 px-3 py-2">
                <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
                <span
                  className="font-medium text-sm flex-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.profile.language}
                </span>
                <div
                  className="flex gap-1 rounded-lg p-0.5"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {(['uk', 'en'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => {
                        tap();
                        setLocale(l);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold transition-all"
                      style={
                        locale === l
                          ? { background: 'var(--accent)', color: 'white' }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {l === 'uk' ? '🇺🇦' : '🇬🇧'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-900/10 transition-colors group"
              >
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="font-medium">{t.profile.logout}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout confirmation modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={locale === 'uk' ? 'Вийти з акаунту?' : 'Sign out?'}
        message={
          locale === 'uk'
            ? 'Ви впевнені, що хочете вийти? Ваші дані будуть збережені.'
            : 'Are you sure you want to sign out? Your data will be saved.'
        }
      />

      {/* Модалка вибору аватара */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarUpdate}
      />

      {/* Модалка налаштувань теми */}
      <ThemeSettingsModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </>
  );
};

// --- МОДАЛЬНЕ ВІКНО ДОДАВАННЯ ЧАЮ (НОВЕ) ---
const AddTeaModal = ({ onClose }: { onClose: () => void }) => {
  const { t, locale } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    type: locale === 'uk' ? 'Пуер' : 'Puer',
    year: String(new Date().getFullYear()),
    origin: '',
    total: '357',
  });

  const [isCustomType, setIsCustomType] = useState(false);
  const [customType, setCustomType] = useState('');
  const [badgeColor, setBadgeColor] = useState('');

  const colorPresets = [
    { hex: '', label: 'Авто' },
    { hex: '#b45309', label: 'Бурштин' },
    { hex: '#15803d', label: 'Зелений' },
    { hex: '#1d4ed8', label: 'Синій' },
    { hex: '#7c3aed', label: 'Фіолет' },
    { hex: '#be123c', label: 'Червоний' },
    { hex: '#0e7490', label: 'Бірюза' },
    { hex: '#a16207', label: 'Золотий' },
  ];

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const count = img.width > img.height ? img.width : img.height;
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;

        if (count > MAX_SIZE) {
          if (img.width > img.height) {
            width = MAX_SIZE;
            height = (img.height * MAX_SIZE) / img.width;
          } else {
            height = MAX_SIZE;
            width = (img.width * MAX_SIZE) / img.height;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject('Canvas error');
          },
          'image/jpeg',
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    setAiData(null);
    setAiError(null);

    try {
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedBlob as Blob);

      const result = await analyzeTeaImageAction(formData);

      if (result && !result.error) {
        setAiData(result);
      } else {
        setAiError(result?.error || 'Не вдалося розпізнати фото');
      }
    } catch (e) {
      console.error(e);
      setAiError('Помилка обробки зображення');
    } finally {
      setAiLoading(false);
      // Reset input to allow selecting same file again
      e.target.value = '';
    }
  };

  const applyAiData = () => {
    if (aiData) {
      setFormData({
        ...formData,
        name: aiData.name || formData.name,
        type: aiData.type || formData.type,
        year: aiData.year || formData.year,
        origin: aiData.origin || formData.origin,
      });
      setAiData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const finalType = isCustomType ? customType || 'Інший' : formData.type;

    await addTeaAction({
      name: formData.name,
      type: finalType,
      color: badgeColor || undefined,
      year: Number(formData.year) || new Date().getFullYear(),
      origin: formData.origin,
      total: Number(formData.total) || 1,
    });
    onClose();
  };

  const inputClass = 'w-full rounded-xl p-3 focus:outline-none transition-colors';
  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
  };
  const labelClass = 'text-[10px] uppercase tracking-widest block mb-1.5 ml-1';
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>
            {t.addTea.title}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* AI SCAN SECTION */}
        <div className="mb-6">
          {!aiLoading && !aiData && (
            <label
              className="w-full rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors group border border-dashed"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Sparkles
                className="group-hover:scale-110 transition-transform"
                size={20}
                style={{ color: 'var(--accent)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t.addTea.ai_analyze}
              </span>
            </label>
          )}

          {aiLoading && (
            <div
              className="w-full rounded-xl p-4 flex items-center justify-center gap-3"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <RefreshCw className="animate-spin" size={20} style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t.addTea.ai_analyzing} 🍵
              </span>
            </div>
          )}

          {aiError && (
            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex items-center gap-3 mb-2 animate-in fade-in">
              <AlertTriangle className="text-red-500" size={20} />
              <span className="text-red-400 text-sm">{aiError}</span>
              <button onClick={() => setAiError(null)} className="ml-auto text-stone-500">
                <X size={16} />
              </button>
            </div>
          )}

          {aiData && (
            <div
              className="rounded-xl p-4 animate-in fade-in zoom-in-95"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {locale === 'uk' ? 'AI знайшов це' : 'AI found this'}
                  </span>
                </div>
                <button onClick={() => setAiData(null)} style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1 mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {locale === 'uk' ? 'Назва' : 'Name'}:
                  </span>{' '}
                  {aiData.name}
                </p>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {locale === 'uk' ? 'Тип' : 'Type'}:
                  </span>{' '}
                  {aiData.type}
                </p>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {locale === 'uk' ? 'Рік' : 'Year'}:
                  </span>{' '}
                  {aiData.year}
                </p>
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {locale === 'uk' ? 'Регіон' : 'Region'}:
                  </span>{' '}
                  {aiData.origin}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={applyAiData}
                  className="flex-1 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--accent)' }}
                >
                  {locale === 'uk' ? 'Заповнити форму' : 'Fill form'}
                </button>
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                {locale === 'uk'
                  ? 'ШІ може помилятись. Перевірте дані.'
                  : 'AI may be inaccurate. Please verify the data.'}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>
              {t.addTea.name_label}
            </label>
            <input
              required
              autoFocus
              className={inputClass}
              style={inputStyle}
              placeholder={t.addTea.name_placeholder}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>
                {t.addTea.type_label}
              </label>
              <select
                className={`${inputClass} appearance-none`}
                style={inputStyle}
                value={isCustomType ? '__custom__' : formData.type}
                onChange={e => {
                  if (e.target.value === '__custom__') {
                    setIsCustomType(true);
                    setCustomType('');
                  } else {
                    setIsCustomType(false);
                    setFormData({ ...formData, type: e.target.value });
                  }
                }}
              >
                <option value="Пуер">{t.addTea.tea_types.puer}</option>
                <option value="Шу Пуер">{t.addTea.tea_types.shu}</option>
                <option value="Шен Пуер">{t.addTea.tea_types.sheng}</option>
                <option value="Улун">{t.addTea.tea_types.oolong}</option>
                <option value="Червоний">{t.addTea.tea_types.red}</option>
                <option value="Зелений">{t.addTea.tea_types.green}</option>
                <option value="Білий">{t.addTea.tea_types.white}</option>
                <option value="Жовтий">{t.addTea.tea_types.yellow}</option>
                <option value="Чорний">{t.addTea.tea_types.black}</option>
                <option value="GABA">{t.addTea.tea_types.gaba}</option>
                <option value="Хей Ча">{t.addTea.tea_types.dark}</option>
                <option value="__custom__">{t.addTea.tea_types.other}</option>
              </select>
              {isCustomType && (
                <input
                  className={`${inputClass} mt-2`}
                  style={inputStyle}
                  placeholder={t.addTea.custom_type_placeholder}
                  autoFocus
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                {t.addTea.year_label}
              </label>
              <input
                inputMode="numeric"
                className={inputClass}
                style={inputStyle}
                value={formData.year}
                onChange={e =>
                  setFormData({ ...formData, year: e.target.value.replace(/[^0-9]/g, '') })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>
                {t.addTea.region_label}
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder={t.addTea.region_placeholder}
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                {t.addTea.weight_label}
              </label>
              <input
                inputMode="numeric"
                className={inputClass}
                style={inputStyle}
                placeholder="357"
                value={formData.total}
                onChange={e =>
                  setFormData({ ...formData, total: e.target.value.replace(/[^0-9]/g, '') })
                }
              />
            </div>
          </div>

          {/* Color badge */}
          <div>
            <label className={labelClass} style={labelStyle}>
              {t.addTea.color_label}
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {colorPresets.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBadgeColor(c.hex)}
                  className="h-8 px-3 rounded-full text-xs font-medium transition-all border-2"
                  style={{
                    background: c.hex ? c.hex + '22' : 'var(--bg-tertiary)',
                    color: c.hex || 'var(--text-secondary)',
                    borderColor: badgeColor === c.hex ? c.hex || 'var(--accent)' : 'transparent',
                    outline:
                      badgeColor === c.hex ? `2px solid ${c.hex || 'var(--accent)'}` : 'none',
                    outlineOffset: '1px',
                  }}
                >
                  {c.hex && (
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ background: c.hex }}
                    />
                  )}
                  {c.label}
                </button>
              ))}
              {/* Custom color */}
              <label
                className="h-8 w-8 rounded-full overflow-hidden shrink-0 cursor-pointer relative border-2 transition-all"
                style={{
                  borderColor:
                    badgeColor && !colorPresets.some(c => c.hex === badgeColor)
                      ? badgeColor
                      : 'var(--border-primary)',
                  background: badgeColor || 'var(--bg-tertiary)',
                }}
              >
                <input
                  type="color"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={badgeColor || '#b45309'}
                  onChange={e => setBadgeColor(e.target.value)}
                />
              </label>
            </div>
            {/* Preview */}
            {badgeColor && (
              <div
                className="mt-2 flex items-center gap-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{t.addTea.color_preview}</span>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: badgeColor + '22',
                    color: badgeColor,
                    border: `1px solid ${badgeColor}55`,
                  }}
                >
                  {isCustomType ? customType || (locale === 'uk' ? 'Тип' : 'Type') : formData.type}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white font-medium py-4 rounded-xl mt-4 shadow-lg active:scale-95 transition-all"
            style={{ background: 'var(--accent)' }}
          >
            {t.addTea.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ЕКРАН ТАЙМЕРА (GONGFU TIMER) ---
const ActiveSessionView = ({ tea, onClose }: { tea: Tea; onClose: () => void }) => {
  const { t } = useLocale();
  // ─── Режим ───────────────────────────────────────────────
  type TimerMode = 'stopwatch' | 'countdown';
  const [mode, setMode] = useState<TimerMode>('stopwatch');

  // ─── Секундомір ──────────────────────────────────────────
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [steepCount, setSteepCount] = useState(1);

  // ─── Таймер зворотнього відліку ──────────────────────────
  const [targetMinutes, setTargetMinutes] = useState('3');
  const [targetSeconds, setTargetSeconds] = useState('00');
  const [countdown, setCountdown] = useState<number | null>(null); // null = не запущено
  const [countdownDone, setCountdownDone] = useState(false);

  // ─── Загальне ────────────────────────────────────────────
  const [rating, setRating] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [temp, setTemp] = useState(95);
  const [grams, setGrams] = useState(7);
  const [volume, setVolume] = useState(120);

  const { tap, press, success, vibrate } = useVibration();

  // ─── Звук дзвіночка через Web Audio API ─────────────────
  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      // М'який дзвіночок — три ноти
      playTone(880, ctx.currentTime, 1.2, 0.3);
      playTone(1046, ctx.currentTime + 0.3, 1.0, 0.2);
      playTone(1318, ctx.currentTime + 0.6, 1.5, 0.25);
    } catch (e) {
      /* silently fail if audio not supported */
    }
  };

  // ─── Таймер секундоміра ───────────────────────────────────
  useEffect(() => {
    if (mode !== 'stopwatch') return;
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode]);

  // ─── Таймер зворотнього відліку ──────────────────────────
  useEffect(() => {
    if (mode !== 'countdown' || countdown === null || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c === null || c <= 1) {
          clearInterval(interval);
          setCountdownDone(true);
          playBell();
          vibrate([30, 100, 30, 100, 50]);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, mode]);

  // ─── Загальна тривалість (завжди тікає)───────────────────
  useEffect(() => {
    const interval = setInterval(() => setSessionDuration(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFinish = async () => {
    await addSessionAction({
      teaId: tea.id,
      duration: sessionDuration,
      steeps: steepCount,
      grams,
      volume,
      rating,
    });
    onClose();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = () => {
    const total = (Number(targetMinutes) || 0) * 60 + (Number(targetSeconds) || 0);
    if (total <= 0) return;
    setCountdown(total);
    setCountdownDone(false);
    press();
  };

  const resetCountdown = () => {
    setCountdown(null);
    setCountdownDone(false);
    tap();
  };

  const extendCountdown = () => {
    setCountdown(c => (c ?? 0) + 60);
    setCountdownDone(false);
    tap();
  };

  const totalTarget = (Number(targetMinutes) || 0) * 60 + (Number(targetSeconds) || 0);
  const countdownProgress = countdown !== null && totalTarget > 0 ? 1 - countdown / totalTarget : 0;
  const circumference = 2 * Math.PI * 106;

  // ─── Підсумок ─────────────────────────────────────────────
  if (showSummary) {
    return (
      <div
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-200"
        style={{ background: 'var(--bg-primary)' }}
      >
        <h2 className="text-2xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>
          {t.summary.title}
        </h2>
        <p className="mb-6 text-center" style={{ color: 'var(--text-muted)' }}>
          {tea.name} ({tea.year})
        </p>
        <p className="font-mono text-sm mb-8" style={{ color: 'var(--accent)', opacity: 0.6 }}>
          {t.summary.session_time} {formatTime(sessionDuration)}
        </p>

        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => {
                setRating(star);
                tap();
              }}
              className="p-1"
            >
              <Star
                size={36}
                fill={star <= rating ? 'var(--accent)' : 'none'}
                style={{ color: star <= rating ? 'var(--accent)' : 'var(--border-primary)' }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            success();
            handleFinish();
          }}
          className="w-full max-w-xs py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-white"
          style={{ background: 'var(--accent)' }}
        >
          {t.summary.save}
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col h-dvh overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Хедер */}
      <div className="flex justify-between items-center p-6 pt-12">
        <button
          onClick={() => {
            tap();
            onClose();
          }}
          className="flex items-center gap-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronRight className="rotate-180" size={20} /> {t.session.back}
        </button>
        <div className="flex flex-col items-center">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.session.title}
          </span>
          <span
            className="font-mono text-xs mt-0.5"
            style={{ color: 'var(--accent)', opacity: 0.5 }}
          >
            {formatTime(sessionDuration)}
          </span>
        </div>
        <button
          onClick={() => {
            press();
            setShowSummary(true);
          }}
          className="font-bold"
          style={{ color: 'var(--accent)' }}
        >
          {t.session.finish}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2
          className="text-lg font-serif mb-3 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {tea.name}
        </h2>

        {/* ─── Перемикач режиму ──────────────────────────── */}
        <div
          className="flex rounded-xl p-1 mb-4 gap-1"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        >
          {(['stopwatch', 'countdown'] as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => {
                tap();
                setMode(m);
                setIsActive(false);
                setSeconds(0);
                resetCountdown();
              }}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                mode === m
                  ? { background: 'var(--accent)', color: 'white' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {m === 'stopwatch' ? t.session.mode_stopwatch : t.session.mode_timer}
            </button>
          ))}
        </div>

        {/* ─── Параметри ─────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
          <div
            className="py-2 px-1 rounded-xl flex flex-col items-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <span className="text-[9px] uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {t.session.water}
            </span>
            <div className="flex items-baseline gap-0.5 font-medium text-sm">
              <input
                inputMode="numeric"
                className="bg-transparent w-8 text-center focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
                value={temp || ''}
                onChange={e => setTemp(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                °C
              </span>
            </div>
          </div>
          <div
            className="py-2 px-1 rounded-xl flex flex-col items-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <span className="text-[9px] uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {t.session.leaf}
            </span>
            <div className="flex items-baseline gap-0.5 font-medium text-sm">
              <input
                inputMode="numeric"
                className="bg-transparent w-6 text-center focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
                value={grams || ''}
                onChange={e => setGrams(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                г
              </span>
            </div>
          </div>
          <div
            className="py-2 px-1 rounded-xl flex flex-col items-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <span className="text-[9px] uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {t.session.vessel}
            </span>
            <div className="flex items-baseline gap-0.5 font-medium text-sm">
              <input
                inputMode="numeric"
                className="bg-transparent w-8 text-center focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
                value={volume || ''}
                onChange={e => setVolume(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                мл
              </span>
            </div>
          </div>
        </div>

        {/* ══════════ РЕЖИМ: СЕКУНДОМІР ══════════ */}
        {mode === 'stopwatch' && (
          <>
            <div className="relative w-44 h-44 flex items-center justify-center mb-5">
              <div
                className="absolute inset-0 border-2 rounded-full transition-all duration-700"
                style={{
                  borderColor: isActive ? 'var(--accent)' : 'var(--border-primary)',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  opacity: isActive ? 0.4 : 1,
                }}
              />
              <div
                className="text-6xl font-light tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {seconds}
                <span className="text-xl" style={{ color: 'var(--text-muted)' }}>
                  s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <button
                onClick={() => {
                  tap();
                  setIsActive(false);
                  setSeconds(0);
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => {
                  press();
                  setIsActive(!isActive);
                }}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
                style={
                  isActive
                    ? {
                        background: 'var(--bg-secondary)',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent-border)',
                      }
                    : { background: 'var(--accent)', color: 'white' }
                }
              >
                {isActive ? (
                  <Pause size={36} fill="currentColor" />
                ) : (
                  <Play size={36} fill="currentColor" className="ml-1" />
                )}
              </button>
              <button
                onClick={() => {
                  tap();
                  setIsActive(false);
                  setSeconds(0);
                  setSteepCount(s => s + 1);
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                #{steepCount}
              </button>
            </div>
          </>
        )}

        {/* ══════════ РЕЖИМ: ТАЙМЕР ══════════ */}
        {mode === 'countdown' && (
          <>
            {/* Кільце прогресу — SVG pointer-none, контент z-10 */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 224 224"
                style={{ pointerEvents: 'none' }}
              >
                <circle
                  cx="112"
                  cy="112"
                  r="106"
                  fill="none"
                  stroke="var(--border-primary)"
                  strokeWidth="3"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="106"
                  fill="none"
                  stroke={countdownDone ? '#ef4444' : 'var(--accent)'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - countdownProgress)}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>

              {/* Контент поверх SVG (z-10 щоб бути клікабельним) */}
              <div className="relative z-10 flex flex-col items-center">
                {countdown === null ? (
                  // ─── Введення часу ───
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col items-center">
                        <span
                          className="text-[9px] uppercase mb-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {t.session.min_label}
                        </span>
                        <input
                          inputMode="numeric"
                          className="w-12 text-3xl font-light text-center rounded-lg focus:outline-none bg-transparent"
                          style={{
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                            caretColor: 'var(--accent)',
                          }}
                          value={targetMinutes}
                          onChange={e =>
                            setTargetMinutes(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                          }
                          placeholder="3"
                        />
                      </div>
                      <span className="text-2xl font-light" style={{ color: 'var(--text-muted)' }}>
                        :
                      </span>
                      <div className="flex flex-col items-center">
                        <span
                          className="text-[9px] uppercase mb-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {t.session.sec_label}
                        </span>
                        <input
                          inputMode="numeric"
                          className="w-12 text-3xl font-light text-center rounded-lg focus:outline-none bg-transparent"
                          style={{
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                            caretColor: 'var(--accent)',
                          }}
                          value={targetSeconds}
                          onChange={e =>
                            setTargetSeconds(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                          }
                          placeholder="00"
                        />
                      </div>
                    </div>
                    {/* Швидкі пресети */}
                    <div className="flex gap-1.5">
                      {[
                        ['1:00', 60],
                        ['2:00', 120],
                        ['3:00', 180],
                        ['5:00', 300],
                      ].map(([label, s]) => (
                        <button
                          key={String(label)}
                          type="button"
                          onClick={() => {
                            tap();
                            setTargetMinutes(String(Math.floor(Number(s) / 60)));
                            setTargetSeconds('00');
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            background: 'var(--bg-primary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // ─── Показ відліку ───
                  <div className="flex flex-col items-center">
                    <div
                      className="text-5xl font-light tabular-nums"
                      style={{ color: countdownDone ? '#ef4444' : 'var(--text-primary)' }}
                    >
                      {formatTime(countdown)}
                    </div>
                    {countdownDone && (
                      <div
                        className="text-xs mt-1 animate-pulse font-medium"
                        style={{ color: '#ef4444' }}
                      >
                        {t.session.time_up}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки таймера */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetCountdown}
                className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <RotateCcw size={18} />
              </button>

              {countdownDone ? (
                <button
                  onClick={extendCountdown}
                  className="h-14 px-7 rounded-full font-bold shadow-2xl active:scale-95 transition-all text-white animate-pulse"
                  style={{ background: 'var(--accent)' }}
                >
                  {t.session.extend}
                </button>
              ) : countdown === null ? (
                <button
                  onClick={startCountdown}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <Play size={30} fill="currentColor" className="ml-1" />
                </button>
              ) : (
                <button
                  disabled
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent)',
                  }}
                >
                  <div className="text-xl font-mono">{countdown}</div>
                </button>
              )}

              <button
                onClick={() => {
                  tap();
                  resetCountdown();
                  setSteepCount(s => s + 1);
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                #{steepCount}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- ГРАФІК АКТИВНОСТІ (GITHUB STYLE) ---
const ContributionGraph = ({ sessions }: { sessions: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to end (today) on mount
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const { grids, totalSessions } = useMemo(() => {
    // We want roughly 52 weeks (1 year) ending today
    const weeks = [];
    const today = new Date();
    const totalSessions = sessions.length;

    // Calculate start date: Today - 52 weeks (approx 364 days)
    // Adjust start date to be a Monday so the grid aligns correctly
    const daysToShow = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow);

    // Adjust startDate back to the nearest Monday
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate.setDate(diff);

    const currentDate = new Date(startDate);
    // Loop until we reach today (or end of this week)
    while (currentDate <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toDateString();
        // Check if there are sessions for this day
        // Note: sessions.date is likely a string or Date object.
        // In the component props it comes as serialized JSON often, passing Dates might need conversion if not strictly typed.
        // Assuming sessions props retain Date objects or ISO strings.
        const count = sessions.filter(s => new Date(s.date).toDateString() === dateStr).length;

        week.push({ date: new Date(currentDate), count });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return { grids: weeks, totalSessions };
  }, [sessions]);

  return (
    <div
      className="p-5 rounded-2xl shadow-sm"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Calendar size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Рік Чаю</span>
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {totalSessions} сесій за рік
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-[3px] min-w-max pl-2">
          {grids.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  className="w-2.5 h-2.5 rounded-sm transition-colors"
                  style={{
                    background:
                      day.count === 0
                        ? 'var(--bg-tertiary)'
                        : day.count === 1
                          ? 'var(--accent-subtle)'
                          : day.count <= 3
                            ? 'var(--accent-border)'
                            : 'var(--accent)',
                    opacity: day.count === 0 ? 0.4 : day.count === 1 ? 0.8 : 1,
                  }}
                  title={`${day.date.toLocaleDateString()}: ${day.count} sessions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        className="flex items-center gap-2 mt-3 text-[10px] justify-end"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>Less</span>
        <div
          className="w-2 h-2 rounded-sm"
          style={{ background: 'var(--bg-tertiary)', opacity: 0.4 }}
        />
        <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--accent)', opacity: 0.3 }} />
        <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--accent)', opacity: 0.6 }} />
        <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--accent)' }} />
        <span>More</span>
      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ ДАШБОРД ---
function TeaDashboardInner({
  initialTeas,
  initialSessions,
  stats,
  user,
}: {
  initialTeas: Tea[];
  initialSessions: any[];
  stats: any;
  user?: any;
}) {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTea, setActiveTea] = useState<Tea | null>(null);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Стан для модалки додавання
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, teaId: '', teaName: '' });

  const filteredTeas = useMemo(() => {
    return initialTeas.filter(
      t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.origin.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialTeas, searchQuery]);

  const confirmDelete = (e: React.MouseEvent, tea: Tea) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, teaId: tea.id, teaName: tea.name });
  };

  return (
    <div
      className="min-h-dvh selection:bg-amber-500/30"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {activeTea && <ActiveSessionView tea={activeTea} onClose={() => setActiveTea(null)} />}

      {/* Підключили модалку додавання */}
      {isAddModalOpen && <AddTeaModal onClose={() => setAddModalOpen(false)} />}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={async () => {
          await deleteTeaAction(deleteModal.teaId);
          setDeleteModal({ ...deleteModal, isOpen: false });
        }}
        title={t.stash.confirm_delete_title}
        message={t.stash.confirm_delete_msg(deleteModal.teaName)}
      />

      <div className="pb-28">
        <header
          className="px-6 pt-12 pb-6 flex justify-between items-end"
          style={{ background: 'linear-gradient(to bottom, var(--bg-secondary), transparent)' }}
        >
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-serif" style={{ color: 'var(--text-primary)' }}>
                Tea Diary
              </h1>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                v1.3
              </span>
            </div>
          </div>
          <UserProfileMenu user={currentUser} onUserUpdate={setCurrentUser} />
        </header>

        <main className="px-6">
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <button
                onClick={() => setActiveTab('stash')}
                className="w-full p-6 rounded-2xl flex items-center justify-between shadow-xl group transition-all"
                style={{ background: 'var(--accent)' }}
              >
                <div className="text-left">
                  <h2 className="text-xl font-medium text-white mb-1">{t.home.start_session}</h2>
                  <p className="text-white/70 text-sm">{t.home.quick_brew}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform text-white">
                  <Play fill="currentColor" size={24} />
                </div>
              </button>

              <ContributionGraph sessions={initialSessions} />

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Droplets
                    className="mb-2"
                    size={20}
                    style={{ color: 'var(--accent)', opacity: 0.6 }}
                  />
                  <div className="text-2xl font-medium">
                    {stats.liters}
                    <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>
                      л
                    </span>
                  </div>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t.home.stats_hours}
                  </p>
                </div>
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Clock
                    className="mb-2"
                    size={20}
                    style={{ color: 'var(--accent)', opacity: 0.6 }}
                  />
                  <div className="text-2xl font-medium">
                    {stats.hours}
                    <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>
                      {locale === 'uk' ? 'год' : 'h'}
                    </span>
                  </div>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t.home.stats_hours}
                  </p>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'uk' ? 'Нещодавні' : 'Recent'}
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--accent)' }}
                  >
                    {locale === 'uk' ? 'Всі' : 'All'}
                  </button>
                </div>
                <div className="space-y-3">
                  {initialSessions.slice(0, 3).map(s => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl flex justify-between items-center"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {s.tea?.name || (locale === 'uk' ? 'Видалений чай' : 'Deleted tea')}
                        </h4>
                        <p
                          className="text-[10px] uppercase mt-0.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {new Date(s.date).toLocaleDateString()} • {s.steeps} {t.history.steeps}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: i < s.rating ? 'var(--accent)' : 'var(--border-primary)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'stash' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="relative">
                <input
                  className="w-full p-3 pl-10 rounded-xl focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={t.stash.search_placeholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-3.5"
                  size={18}
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>

              <div className="space-y-3">
                {filteredTeas.map(tea => {
                  const progress = Math.round((tea.remaining / tea.total) * 100);
                  return (
                    <div
                      key={tea.id}
                      onClick={() => setActiveTea(tea)}
                      className="rounded-2xl p-4 active:scale-98 transition-transform cursor-pointer group"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                          style={
                            tea.color
                              ? {
                                  background: tea.color + '22',
                                  color: tea.color,
                                  border: `1px solid ${tea.color}55`,
                                }
                              : {
                                  border: '1px solid var(--border-primary)',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                }
                          }
                        >
                          {tea.type}
                        </span>
                        <button
                          onClick={e => confirmDelete(e, tea)}
                          className="p-1 transition-colors hover:text-red-400"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex justify-between items-end mb-3">
                        <h3
                          className="font-medium text-lg"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {tea.name}
                        </h3>
                        <span
                          className="text-xs font-mono"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {tea.remaining} / {tea.total}г
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--bg-tertiary)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${progress}%`,
                            background: 'var(--accent)',
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setAddModalOpen(true)}
                className="w-full py-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
              >
                <Plus size={20} /> {t.stash.add_tea}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-serif mb-6">{t.history.title}</h2>
              {initialSessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {session.tea?.name || (locale === 'uk' ? 'Видалений чай' : 'Deleted tea')}
                    </h4>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            background:
                              i < session.rating ? 'var(--accent)' : 'var(--border-primary)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    className="flex justify-between text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span>
                      {session.steeps} {t.history.steeps} • {Math.floor(session.duration / 60)}
                      {t.history.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 backdrop-blur-lg pb-safe pt-2 px-8 flex justify-between items-center z-50"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-primary)',
          opacity: 0.95,
        }}
      >
        <NavButton
          tab="home"
          icon={<Home size={24} />}
          label={t.nav.home}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <NavButton
          tab="stash"
          icon={<Leaf size={24} />}
          label={t.nav.stash}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <NavButton
          tab="history"
          icon={<History size={24} />}
          label={t.nav.history}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </nav>
    </div>
  );
}

export default function TeaDashboard(props: {
  initialTeas: Tea[];
  initialSessions: any[];
  stats: any;
  user?: any;
}) {
  return (
    <LocaleProvider>
      <TeaDashboardInner {...props} />
    </LocaleProvider>
  );
}
