'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { addTeaAction, deleteTeaAction, addSessionAction, updateUserAvatarAction, analyzeTeaImageAction } from './../actions';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';

import {
  Play, Pause, RotateCcw, Plus, Home, History,
  Droplets, Clock, Leaf, ChevronRight, Search,
  X, Pencil, Save, Trash2, AlertTriangle, Star,
  User, LogOut, Settings, Camera, RefreshCw, Calendar, Sparkles, Upload,
  Palette, Sun, Moon, Paintbrush
} from 'lucide-react';

// --- ТИПИ ---
type Tea = {
  id: string;
  name: string;
  type: string;
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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <AlertTriangle size={24} />
          <h3 className="text-lg font-serif font-bold text-stone-100">{title}</h3>
        </div>
        <p className="text-stone-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium transition-colors hover:bg-stone-700">Скасувати</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-900/30 text-red-400 border border-red-900/50 font-medium transition-colors hover:bg-red-900/40">Підтвердити</button>
        </div>
      </div>
    </div>
  );
};

// --- МОДАЛКА ВИБОРУ АВАТАРА ---
const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
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
    { id: 'bottts', name: 'Robot' }
  ];

  const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target?.result as string; };
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
      <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-stone-500 hover:text-stone-300"><X size={20} /></button>

        <h3 className="text-xl font-serif text-stone-100 mb-4 text-center">Виберіть образ</h3>

        {/* Tabs */}
        <div className="flex bg-stone-800/50 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('generate')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'generate' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-300'}`}
          >
            🎲 Генерувати
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'upload' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-300'}`}
          >
            📷 Своє фото
          </button>
        </div>

        {tab === 'generate' && (
          <>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-stone-800 border-4 border-amber-600/20 overflow-hidden relative group">
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
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors ${style === s.id ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSeed(Math.random().toString(36).substring(7))}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Випадковий
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-500 transition-colors"
              >
                Зберегти
              </button>
            </div>
          </>
        )}

        {tab === 'upload' && (
          <>
            <div className="flex justify-center mb-6">
              <div
                className="w-32 h-32 rounded-full bg-stone-800 border-4 border-amber-600/20 overflow-hidden relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Custom Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-500">
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

            <p className="text-stone-500 text-xs text-center mb-6">
              Фото буде обрізане до квадрата і стиснуте автоматично
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {uploadPreview ? 'Змінити' : 'Обрати'}
              </button>
              <button
                onClick={handleSave}
                disabled={!uploadPreview}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${uploadPreview ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
              >
                Зберегти
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// --- МОДАЛКА НАЛАШТУВАНЬ ТЕМИ ---
const ThemeSettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const [localColors, setLocalColors] = useState(customColors);

  useEffect(() => {
    setLocalColors(customColors);
  }, [customColors, isOpen]);

  if (!isOpen) return null;

  const presets = [
    { id: 'dark' as const, name: 'Темна', icon: <Moon size={20} />, desc: 'Класична темна тема' },
    { id: 'light' as const, name: 'Світла', icon: <Sun size={20} />, desc: 'Легка світла тема' },
    { id: 'custom' as const, name: 'Кастомна', icon: <Paintbrush size={20} />, desc: 'Свої кольори' },
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

  const handlePresetSelect = (preset: 'dark' | 'light' | 'custom') => {
    setTheme(preset);
    if (preset === 'custom') {
      setCustomColors(localColors);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', border: '1px solid var(--border-primary)' }}>
        <button onClick={onClose} className="absolute right-4 top-4" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>

        <div className="flex items-center gap-2 mb-6">
          <Palette size={22} style={{ color: 'var(--accent)' }} />
          <h3 className="text-xl font-serif" style={{ color: 'var(--text-primary)' }}>Тема додатку</h3>
        </div>

        {/* Theme presets */}
        <div className="space-y-2 mb-6">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: theme === p.id ? 'var(--accent-subtle)' : 'transparent',
                border: theme === p.id ? '1px solid var(--accent-border)' : '1px solid transparent',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme === p.id ? 'var(--accent)' : 'var(--bg-tertiary)', color: theme === p.id ? 'white' : 'var(--text-muted)' }}>
                {p.icon}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
              {theme === p.id && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom colors section */}
        {theme === 'custom' && (
          <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Кольори</p>
            {colorFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="relative w-10 h-10 rounded-lg overflow-hidden cursor-pointer shrink-0" style={{ border: '2px solid var(--border-primary)' }}>
                  <input
                    type="color"
                    value={localColors[field.key]}
                    onChange={e => handleColorChange(field.key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full" style={{ background: localColors[field.key] }} />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{field.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{field.desc}</div>
                </div>
                <code className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{localColors[field.key]}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- ПРОФІЛЬНЕ МЕНЮ ---
const UserProfileMenu = ({ user, onUserUpdate }: { user: any, onUserUpdate: (newUser: any) => void }) => {
  const router = useRouter();
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
      console.error("Avatar update failed", e);
      // Можна додати тост з помилкою
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const Avatar = ({ className, size = 'sm' }: { className?: string, size?: 'sm' | 'lg' }) => {
    if (user?.image) {
      return <img src={user.image} alt={user.name} className={`${className} object-cover`} />;
    }
    return (
      <div className={`${className} bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold ${size === 'lg' ? 'text-xl' : 'text-xs'}`}>
        {getInitials(user?.name)}
      </div>
    );
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border-2 border-stone-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 overflow-hidden"
        >
          <Avatar className="w-10 h-10" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 w-72 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
            {/* Інфо про користувача */}
            <div className="p-4 border-b border-stone-800 bg-stone-900/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                  <Avatar className="w-16 h-16 rounded-full border-2 border-stone-700" size="lg" />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-stone-100 truncate text-lg">{user?.name || 'Користувач'}</h4>
                  <p className="text-xs text-stone-500 truncate">{user?.email || 'email@example.com'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="w-full mt-2 py-1.5 text-xs font-medium text-stone-400 bg-stone-800/50 rounded-lg hover:bg-stone-800 transition-colors"
              >
                Змінити аватар
              </button>
            </div>

            {/* Меню опцій */}
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
                <span className="font-medium">Тема додатку</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-900/10 transition-colors group"
              >
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="font-medium">Вийти з акаунту</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модалка підтвердження виходу */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Вийти з акаунту?"
        message="Ви впевнені, що хочете вийти? Ваші дані будуть збережені."
      />

      {/* Модалка вибору аватара */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarUpdate}
      />

      {/* Модалка налаштувань теми */}
      <ThemeSettingsModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </>
  );
};

// --- МОДАЛЬНЕ ВІКНО ДОДАВАННЯ ЧАЮ (НОВЕ) ---
const AddTeaModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Пуер',
    year: new Date().getFullYear(),
    origin: '',
    total: 357, // Стандартна вага бліна
  });

  const [isCustomType, setIsCustomType] = useState(false);
  const [customType, setCustomType] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target?.result as string; };
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

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Canvas error');
        }, 'image/jpeg', 0.7);
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
      formData.append("image", compressedBlob as Blob);

      const result = await analyzeTeaImageAction(formData);

      if (result && !result.error) {
        setAiData(result);
      } else {
        setAiError(result?.error || "Не вдалося розпізнати фото");
      }
    } catch (e) {
      console.error(e);
      setAiError("Помилка обробки зображення");
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

    const finalType = isCustomType ? (customType || 'Інший') : formData.type;

    await addTeaAction({
      name: formData.name,
      type: finalType,
      year: Number(formData.year),
      origin: formData.origin,
      total: Number(formData.total),
    });
    onClose();
  };

  const inputClass = "w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-200 focus:border-amber-600/50 focus:outline-none transition-colors";
  const labelClass = "text-[10px] text-stone-500 uppercase tracking-widest block mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-stone-100">Додати в колекцію</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X size={24} /></button>
        </div>

        {/* AI SCAN SECTION */}
        <div className="mb-6">
          {!aiLoading && !aiData && (
            <label className="w-full bg-stone-800/50 hover:bg-stone-800 border border-stone-700 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Sparkles className="text-amber-500 group-hover:scale-110 transition-transform" size={20} />
              <span className="text-stone-400 text-sm font-medium group-hover:text-stone-300">Розпізнати по фото (AI)</span>
            </label>
          )}

          {aiLoading && (
            <div className="w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 flex items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-amber-500" size={20} />
              <span className="text-stone-400 text-sm">Аналізую чай... 🍵</span>
            </div>
          )}

          {aiError && (
            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex items-center gap-3 mb-2 animate-in fade-in">
              <AlertTriangle className="text-red-500" size={20} />
              <span className="text-red-400 text-sm">{aiError}</span>
              <button onClick={() => setAiError(null)} className="ml-auto text-stone-500"><X size={16} /></button>
            </div>
          )}

          {aiData && (
            <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">AI знайшов це</span>
                </div>
                <button onClick={() => setAiData(null)} className="text-stone-500 hover:text-stone-300"><X size={16} /></button>
              </div>

              <div className="space-y-1 mb-4 text-sm text-stone-300">
                <p><span className="text-stone-500">Назва:</span> {aiData.name}</p>
                <p><span className="text-stone-500">Тип:</span> {aiData.type}</p>
                <p><span className="text-stone-500">Рік:</span> {aiData.year}</p>
                <p><span className="text-stone-500">Регіон:</span> {aiData.origin}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={applyAiData} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                  Заповнити форму
                </button>
              </div>
              <p className="text-[10px] text-stone-600 mt-2 text-center">ШІ може помилятись. Перевірте дані.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Назва чаю</label>
            <input
              required
              autoFocus
              className={inputClass}
              placeholder="Напр. Lao Ban Zhang"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Тип</label>
              <select
                className={`${inputClass} appearance-none`}
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
                <option value="Пуер">Пуер (Puer)</option>
                <option value="Шу Пуер">Шу Пуер (Shu)</option>
                <option value="Шен Пуер">Шен Пуер (Sheng)</option>
                <option value="Улун">Улун (Oolong)</option>
                <option value="Червоний">Червоний (Red)</option>
                <option value="Зелений">Зелений (Green)</option>
                <option value="Білий">Білий (White)</option>
                <option value="Жовтий">Жовтий (Yellow)</option>
                <option value="Чорний">Чорний (Black)</option>
                <option value="GABA">GABA (Габа)</option>
                <option value="Хей Ча">Хей Ча (Dark)</option>
                <option value="__custom__">Інший...</option>
              </select>
              {isCustomType && (
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Впишіть свій тип чаю"
                  autoFocus
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className={labelClass}>Рік</label>
              <input
                type="number"
                className={inputClass}
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Регіон</label>
              <input
                className={inputClass}
                placeholder="Напр. Menghai"
                value={formData.origin}
                onChange={e => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Вага (г)</label>
              <input
                type="number"
                className={inputClass}
                value={formData.total}
                onChange={e => setFormData({ ...formData, total: Number(e.target.value) })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-4 rounded-xl mt-4 shadow-lg shadow-amber-900/20 active:scale-95 transition-all">
            Зберегти чай
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ЕКРАН ТАЙМЕРА (GONGFU TIMER) ---
const ActiveSessionView = ({ tea, onClose }: { tea: Tea, onClose: () => void }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [steepCount, setSteepCount] = useState(1);
  const [rating, setRating] = useState(5);
  const [showSummary, setShowSummary] = useState(false);

  // Загальний час сесії (медитація)
  const [sessionDuration, setSessionDuration] = useState(0);

  // Параметри заварювання
  const [temp, setTemp] = useState(95);
  const [grams, setGrams] = useState(7);
  const [volume, setVolume] = useState(120);

  // Таймер поточного пролива
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  // Таймер загальної тривалості (медитації) - тикає завжди поки відкрито вікно
  useEffect(() => {
    const interval = setInterval(() => setSessionDuration(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFinish = async () => {
    await addSessionAction({
      teaId: tea.id,
      duration: sessionDuration, // Зберігаємо саме загальний час сесії
      steeps: steepCount,
      grams: grams,
      volume: volume,
      rating: rating
    });
    onClose();
  };

  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-stone-950 z-[80] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-serif text-stone-100 mb-2">Як вам чай?</h2>
        <p className="text-stone-500 mb-6 text-center">{tea.name} ({tea.year})</p>
        <p className="text-amber-600/60 font-mono text-sm mb-8">Час медитації: {formatTime(sessionDuration)}</p>

        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => { setRating(star); vibrate(); }} className="p-1">
              <Star size={36} fill={star <= rating ? "#d97706" : "none"} className={star <= rating ? "text-amber-600" : "text-stone-700"} />
            </button>
          ))}
        </div>

        <button onClick={() => { vibrate(); handleFinish(); }} className="w-full max-w-xs bg-amber-600 py-4 rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-transform">
          Зберегти в історію
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-950 z-[70] flex flex-col h-dvh overflow-hidden">
      <div className="flex justify-between items-center p-6 pt-12">
        <button onClick={() => { vibrate(); onClose(); }} className="text-stone-400 flex items-center gap-1"><ChevronRight className="rotate-180" size={20} /> Назад</button>
        <div className="flex flex-col items-center">
          <span className="text-stone-500 text-xs tracking-widest uppercase">Gongfu Session</span>
          <span className="text-amber-600/50 font-mono text-xs mt-0.5">{formatTime(sessionDuration)}</span>
        </div>
        <button onClick={() => { vibrate(); setShowSummary(true); }} className="text-amber-500 font-bold">Фініш</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl text-stone-200 font-serif mb-8 text-center">{tea.name}</h2>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-12">
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800 flex flex-col items-center">
            <span className="text-[10px] text-stone-500 uppercase mb-1">Вода</span>
            <div className="flex items-baseline gap-0.5 font-medium">
              <input type="number" className="bg-transparent w-10 text-center focus:outline-none" value={temp} onChange={e => setTemp(Number(e.target.value))} />
              <span className="text-xs text-stone-600">°C</span>
            </div>
          </div>
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800 flex flex-col items-center">
            <span className="text-[10px] text-stone-500 uppercase mb-1">Лист</span>
            <div className="flex items-baseline gap-0.5 font-medium">
              <input type="number" className="bg-transparent w-8 text-center focus:outline-none" value={grams} onChange={e => setGrams(Number(e.target.value))} />
              <span className="text-xs text-stone-600">г</span>
            </div>
          </div>
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800 flex flex-col items-center">
            <span className="text-[10px] text-stone-500 uppercase mb-1">Посуд</span>
            <div className="flex items-baseline gap-0.5 font-medium">
              <input type="number" className="bg-transparent w-10 text-center focus:outline-none" value={volume} onChange={e => setVolume(Number(e.target.value))} />
              <span className="text-xs text-stone-600">мл</span>
            </div>
          </div>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          <div className={`absolute inset-0 border-2 rounded-full transition-all duration-700 ${isActive ? 'border-amber-500/40 scale-110' : 'border-stone-800 scale-100'}`}></div>
          <div className="text-7xl font-light text-stone-100 tabular-nums">
            {seconds}<span className="text-2xl text-stone-600">s</span>
          </div>
          {/* Маленький індикатор загального часу всередині кола (опціонально, але корисно) */}
          <div className="absolute bottom-12 text-stone-600 text-xs tracking-wider uppercase opacity-50">Meditate</div>
        </div>

        <div className="flex items-center gap-8 mb-8">
          <button onClick={() => { vibrate(); setIsActive(false); setSeconds(0); }} className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 active:scale-90 transition-transform"><RotateCcw size={20} /></button>
          <button onClick={() => { vibrate(); setIsActive(!isActive); }} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-stone-800 text-amber-500 border border-amber-500/20' : 'bg-amber-600 text-white'}`}>
            {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => { vibrate(); setIsActive(false); setSeconds(0); setSteepCount(s => s + 1); }} className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-200 font-bold active:scale-90 transition-transform">#{steepCount}</button>
        </div>
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

    let currentDate = new Date(startDate);
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
    <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-stone-300">
          <Calendar size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Рік Чаю</span>
        </div>
        <span className="text-xs text-stone-500 font-mono">{totalSessions} сесій за рік</span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-[3px] min-w-max pl-2">
          {grids.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  className={`w-2.5 h-2.5 rounded-sm transition-colors ${day.count === 0 ? 'bg-stone-800/40' :
                    day.count === 1 ? 'bg-amber-900/60' :
                      day.count <= 3 ? 'bg-amber-700/80' :
                        'bg-amber-500'
                    }`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} sessions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-stone-600 justify-end">
        <span>Less</span>
        <div className="w-2 h-2 rounded-sm bg-stone-800/40" />
        <div className="w-2 h-2 rounded-sm bg-amber-900/60" />
        <div className="w-2 h-2 rounded-sm bg-amber-700/80" />
        <div className="w-2 h-2 rounded-sm bg-amber-500" />
        <span>More</span>
      </div>
    </div>
  );
}

// --- ГОЛОВНИЙ ДАШБОРД ---
export default function TeaDashboard({ initialTeas, initialSessions, stats, user }: { initialTeas: Tea[], initialSessions: any[], stats: any, user?: any }) {
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
    return initialTeas.filter(t =>
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
    <div className="min-h-dvh selection:bg-amber-500/30" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {activeTea && <ActiveSessionView tea={activeTea} onClose={() => setActiveTea(null)} />}

      {/* Підключили модалку додавання */}
      {isAddModalOpen && <AddTeaModal onClose={() => setAddModalOpen(false)} />}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={async () => { await deleteTeaAction(deleteModal.teaId); setDeleteModal({ ...deleteModal, isOpen: false }); }}
        title="Видалити чай?"
        message={`Це назавжди видалить "${deleteModal.teaName}" з вашої бази даних.`}
      />

      <div className="pb-28">
        <header className="px-6 pt-12 pb-6 flex justify-between items-end" style={{ background: 'linear-gradient(to bottom, var(--bg-secondary), transparent)' }}>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Сьогодні {new Date().toLocaleDateString('uk-UA', { weekday: 'long' })}</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-serif" style={{ color: 'var(--text-primary)' }}>Час Чаю</h1>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>v1.3</span>
            </div>
          </div>
          <UserProfileMenu user={currentUser} onUserUpdate={setCurrentUser} />
        </header>

        <main className="px-6">
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <button onClick={() => setActiveTab('stash')} className="w-full p-6 rounded-2xl flex items-center justify-between shadow-xl group transition-all" style={{ background: 'var(--accent)' }}>
                <div className="text-left">
                  <h2 className="text-xl font-medium text-white mb-1">Нова сесія</h2>
                  <p className="text-white/70 text-sm">Почати медитацію з чаєм</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform text-white"><Play fill="currentColor" size={24} /></div>
              </button>

              <ContributionGraph sessions={initialSessions} />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                  <Droplets className="mb-2" size={20} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                  <div className="text-2xl font-medium">{stats.liters}<span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>л</span></div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Випито за місяць</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                  <Clock className="mb-2" size={20} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                  <div className="text-2xl font-medium">{stats.hours}<span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>год</span></div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Час медитації</p>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif" style={{ color: 'var(--text-secondary)' }}>Нещодавні</h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Всі</button>
                </div>
                <div className="space-y-3">
                  {initialSessions.slice(0, 3).map(s => (
                    <div key={s.id} className="p-4 rounded-xl flex justify-between items-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.tea?.name || 'Видалений чай'}</h4>
                        <p className="text-[10px] uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()} • {s.steeps} проливів</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < s.rating ? 'var(--accent)' : 'var(--border-primary)' }} />)}
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
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="Знайти чай у сховищі..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5" size={18} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div className="space-y-3">
                {filteredTeas.map(tea => {
                  const progress = Math.round((tea.remaining / tea.total) * 100);
                  return (
                    <div key={tea.id} onClick={() => setActiveTea(tea)} className="rounded-2xl p-4 active:scale-98 transition-transform cursor-pointer group" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{tea.type}</span>
                        <button onClick={(e) => confirmDelete(e, tea)} className="p-1 transition-colors hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={18} /></button>
                      </div>
                      <div className="flex justify-between items-end mb-3">
                        <h3 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>{tea.name}</h3>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{tea.remaining} / {tea.total}г</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: 'var(--accent)', opacity: 0.6 }} />
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
                <Plus size={20} /> Додати в колекцію
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h2 className="text-xl font-serif mb-6">Історія заварювань</h2>
              {initialSessions.map(session => (
                <div key={session.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{session.tea?.name || 'Видалений чай'}</h4>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ background: i < session.rating ? 'var(--accent)' : 'var(--border-primary)' }} />)}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span>{session.steeps} проливів • {Math.floor(session.duration / 60)}хв</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-lg pb-safe pt-2 px-8 flex justify-between items-center z-50" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)', opacity: 0.95 }}>
        <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1 p-2 transition-colors" style={{ color: activeTab === 'home' ? 'var(--accent)' : 'var(--text-muted)' }}><Home size={24} /><span className="text-[10px] font-medium">Головна</span></button>
        <button onClick={() => setActiveTab('stash')} className="flex flex-col items-center gap-1 p-2 transition-colors" style={{ color: activeTab === 'stash' ? 'var(--accent)' : 'var(--text-muted)' }}><Leaf size={24} /><span className="text-[10px] font-medium">Сховище</span></button>
        <button onClick={() => setActiveTab('history')} className="flex flex-col items-center gap-1 p-2 transition-colors" style={{ color: activeTab === 'history' ? 'var(--accent)' : 'var(--text-muted)' }}><History size={24} /><span className="text-[10px] font-medium">Історія</span></button>
      </nav>
    </div>
  );
}