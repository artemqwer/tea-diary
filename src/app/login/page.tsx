'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

// 1. Move the logic into a separate component
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Невірний email або пароль');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Щось пішло не так');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Success Message */}
        {registered && (
          <div className="bg-green-900/20 border border-green-900/50 text-green-400 text-sm p-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={16} /> Реєстрацію завершено! Тепер увійдіть
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div>
          <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
            <input 
              type="email" 
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-none transition-colors"
              placeholder="admin@tea.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
            <input 
              type="password" 
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Входимо...' : 'Увійти'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      {/* Registration Link */}
      <div className="mt-6 text-center">
        <p className="text-stone-500 text-sm">
          Немає акаунту?{' '}
          <Link href="/register" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}

// 2. Wrap the component in Suspense
export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-200">
      
      {/* Logo / Header */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-700 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/20">
           <Leaf size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-serif text-stone-100">Чайний Щоденник</h1>
        <p className="text-stone-500 text-sm mt-2">Вхід до особистої колекції</p>
      </div>

      <Suspense fallback={<div className="text-stone-500">Завантаження форми...</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-stone-600 text-xs">
        © 2026 Tea Diary App
      </p>
    </div>
  );
}