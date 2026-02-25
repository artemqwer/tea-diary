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

import { NavButton } from './NavButton';
import { ConfirmationModal } from './ConfirmationModal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { ThemeSettingsModal } from './ThemeSettingsModal';
import { UserProfileMenu } from './UserProfileMenu';
import { AddTeaModal } from './AddTeaModal';
import { ActiveSessionView } from './ActiveSessionView';
import { ContributionGraph } from './ContributionGraph';
import { Tea, Session } from './types';

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
  const router = useRouter();

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
          router.refresh();
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
                      <div className="min-w-0 flex-1">
                        <h4
                          className="font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {s.tea?.name || (locale === 'uk' ? 'Видалений чай' : 'Deleted tea')}
                        </h4>
                        <p
                          className="text-[10px] uppercase mt-0.5 truncate"
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
                  className="w-full p-3 pl-10 rounded-xl focus:outline-hidden transition-colors"
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
                      <div className="flex justify-between items-end mb-3 gap-3">
                        <h3
                          className="font-medium text-lg truncate min-w-0 flex-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {tea.name}
                        </h3>
                        <span
                          className="text-xs font-mono shrink-0"
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
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h4 className="font-medium truncate min-w-0 flex-1">
                      {session.tea?.name || (locale === 'uk' ? 'Видалений чай' : 'Deleted tea')}
                    </h4>
                    <div className="flex gap-0.5 shrink-0 mt-1">
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
