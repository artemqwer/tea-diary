'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Home, History, 
  Droplets, Clock, Leaf, ChevronRight, Search, 
  X, Pencil, Save, Trash2, AlertTriangle, Star 
} from 'lucide-react';
import { addTeaAction, deleteTeaAction, addSessionAction } from './../actions';

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
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium transition-colors">Скасувати</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-900/30 text-red-400 border border-red-900/50 font-medium transition-colors">Видалити</button>
        </div>
      </div>
    </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    await addTeaAction({
      name: formData.name,
      type: formData.type,
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
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-stone-100">Додати в колекцію</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X size={24}/></button>
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
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className={labelClass}>Тип</label>
              <select 
                className={`${inputClass} appearance-none`}
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Пуер">Пуер (Puer)</option>
                <option value="Улун">Улун (Oolong)</option>
                <option value="Червоний">Червоний (Red)</option>
                <option value="Зелений">Зелений (Green)</option>
                <option value="Білий">Білий (White)</option>
                <option value="Хей Ча">Хей Ча (Dark)</option>
              </select>
             </div>
             <div>
              <label className={labelClass}>Рік</label>
              <input 
                type="number"
                className={inputClass}
                value={formData.year}
                onChange={e => setFormData({...formData, year: Number(e.target.value)})}
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
                onChange={e => setFormData({...formData, origin: e.target.value})}
              />
             </div>
             <div>
              <label className={labelClass}>Вага (г)</label>
              <input 
                type="number"
                className={inputClass}
                value={formData.total}
                onChange={e => setFormData({...formData, total: Number(e.target.value)})}
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

  // Параметри заварювання
  const [temp, setTemp] = useState(95);
  const [grams, setGrams] = useState(7);
  const [volume, setVolume] = useState(120);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  const handleFinish = async () => {
    await addSessionAction({
      teaId: tea.id,
      duration: seconds,
      steeps: steepCount,
      grams: grams,
      volume: volume,
      rating: rating
    });
    onClose();
  };

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-stone-950 z-[80] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-serif text-stone-100 mb-2">Як вам чай?</h2>
        <p className="text-stone-500 mb-8 text-center">{tea.name} ({tea.year})</p>
        
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="p-1">
              <Star size={36} fill={star <= rating ? "#d97706" : "none"} className={star <= rating ? "text-amber-600" : "text-stone-700"} />
            </button>
          ))}
        </div>

        <button onClick={handleFinish} className="w-full max-w-xs bg-amber-600 py-4 rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-transform">
          Зберегти в історію
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-950 z-[70] flex flex-col h-dvh overflow-hidden">
      <div className="flex justify-between items-center p-6 pt-12">
        <button onClick={onClose} className="text-stone-400 flex items-center gap-1"><ChevronRight className="rotate-180" size={20} /> Назад</button>
        <span className="text-stone-500 text-xs tracking-widest uppercase">Gongfu Session</span>
        <button onClick={() => setShowSummary(true)} className="text-amber-500 font-bold">Фініш</button>
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
        </div>

        <div className="flex items-center gap-8 mb-8">
          <button onClick={() => { setIsActive(false); setSeconds(0); }} className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 active:scale-90 transition-transform"><RotateCcw size={20} /></button>
          <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-stone-800 text-amber-500 border border-amber-500/20' : 'bg-amber-600 text-white'}`}>
            {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => { setIsActive(false); setSeconds(0); setSteepCount(s => s + 1); }} className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-200 font-bold active:scale-90 transition-transform">#{steepCount}</button>
        </div>
      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ ДАШБОРД ---
export default function TeaDashboard({ initialTeas, initialSessions, stats }: { initialTeas: Tea[], initialSessions: any[], stats: any }) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTea, setActiveTea] = useState<Tea | null>(null);
  
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
    <div className="min-h-dvh bg-stone-950 text-stone-100 selection:bg-amber-500/30">
      
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
        <header className="px-6 pt-12 pb-6 flex justify-between items-end bg-gradient-to-b from-stone-900/40 to-transparent">
          <div>
            <p className="text-stone-500 text-sm mb-1">Сьогодні {new Date().toLocaleDateString('uk-UA', { weekday: 'long' })}</p>
            <h1 className="text-2xl font-serif text-stone-100">Час Чаю</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-stone-400">TEA</div>
        </header>

        <main className="px-6">
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <button onClick={() => setActiveTab('stash')} className="w-full bg-amber-600 hover:bg-amber-500 p-6 rounded-2xl flex items-center justify-between shadow-xl shadow-amber-900/10 group transition-all">
                <div className="text-left">
                  <h2 className="text-xl font-medium mb-1">Нова сесія</h2>
                  <p className="text-amber-100/70 text-sm">Почати медитацію з чаєм</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform"><Play fill="currentColor" size={24} /></div>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900/50 border border-stone-800/50 p-4 rounded-2xl">
                  <Droplets className="text-amber-600/60 mb-2" size={20} />
                  <div className="text-2xl font-medium">{stats.liters}<span className="text-sm text-stone-600 ml-1">л</span></div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Випито за місяць</p>
                </div>
                <div className="bg-stone-900/50 border border-stone-800/50 p-4 rounded-2xl">
                  <Clock className="text-amber-600/60 mb-2" size={20} />
                  <div className="text-2xl font-medium">{stats.hours}<span className="text-sm text-stone-600 ml-1">год</span></div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Час медитації</p>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-stone-400 font-serif">Нещодавні</h3>
                  <button onClick={() => setActiveTab('history')} className="text-amber-600 text-xs font-bold uppercase tracking-widest">Всі</button>
                </div>
                <div className="space-y-3">
                  {initialSessions.slice(0, 3).map(s => (
                    <div key={s.id} className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-stone-200">{s.tea?.name || 'Видалений чай'}</h4>
                        <p className="text-[10px] text-stone-500 uppercase mt-0.5">{new Date(s.date).toLocaleDateString()} • {s.steeps} проливів</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < s.rating ? 'bg-amber-500' : 'bg-stone-700'}`} />)}
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
                <input className="w-full bg-stone-900 border border-stone-800 text-stone-200 p-3 pl-10 rounded-xl focus:outline-none focus:border-amber-600/50 transition-colors" placeholder="Знайти чай у сховищі..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search className="absolute left-3 top-3.5 text-stone-500" size={18} />
              </div>

              <div className="space-y-3">
                {filteredTeas.map(tea => {
                  const progress = Math.round((tea.remaining / tea.total) * 100);
                  return (
                    <div key={tea.id} onClick={() => setActiveTea(tea)} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 active:scale-98 transition-transform cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-stone-700 bg-stone-800/50 text-stone-400">{tea.type}</span>
                        <button onClick={(e) => confirmDelete(e, tea)} className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                      </div>
                      <div className="flex justify-between items-end mb-3">
                        <h3 className="text-stone-100 font-medium text-lg">{tea.name}</h3>
                        <span className="text-stone-400 text-xs font-mono">{tea.remaining} / {tea.total}г</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600/60 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Кнопка тепер відкриває модалку */}
              <button 
                onClick={() => setAddModalOpen(true)}
                className="w-full py-4 rounded-xl border border-dashed border-stone-800 text-stone-500 hover:text-amber-500 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Додати в колекцію
              </button>
            </div>
          )}

          {activeTab === 'history' && (
             <div className="space-y-4 animate-in fade-in duration-500">
               <h2 className="text-xl font-serif mb-6">Історія заварювань</h2>
               {initialSessions.map(session => (
                 <div key={session.id} className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-medium">{session.tea?.name || 'Видалений чай'}</h4>
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${i < session.rating ? 'bg-amber-500' : 'bg-stone-700'}`} />)}
                     </div>
                   </div>
                   <div className="flex justify-between text-[10px] text-stone-500 uppercase tracking-widest">
                     <span>{new Date(session.date).toLocaleDateString()}</span>
                     <span>{session.steeps} проливів • {Math.floor(session.duration / 60)}хв</span>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-stone-900/90 backdrop-blur-lg border-t border-stone-800 pb-safe pt-2 px-8 flex justify-between items-center z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'home' ? 'text-amber-500' : 'text-stone-500'}`}><Home size={24} /><span className="text-[10px] font-medium">Головна</span></button>
        <button onClick={() => setActiveTab('stash')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'stash' ? 'text-amber-500' : 'text-stone-500'}`}><Leaf size={24} /><span className="text-[10px] font-medium">Сховище</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'history' ? 'text-amber-500' : 'text-stone-500'}`}><History size={24} /><span className="text-[10px] font-medium">Історія</span></button>
      </nav>
    </div>
  );
}