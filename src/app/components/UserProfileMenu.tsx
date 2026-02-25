import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLocale } from './LocaleProvider';
import { useVibration } from './useVibration';
import { Camera, Palette, Settings, LogOut } from 'lucide-react';
import { updateUserAvatarAction } from './../actions';
import { ConfirmationModal } from './ConfirmationModal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { ThemeSettingsModal } from './ThemeSettingsModal';

export const UserProfileMenu = ({
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
