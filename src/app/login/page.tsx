'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

// Google logo SVG component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Помилка входу через Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full bg-white hover:bg-stone-100 text-stone-800 font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <GoogleIcon />
        {googleLoading ? 'Підключаємо...' : 'Увійти через Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-stone-800"></div>
        <span className="text-stone-600 text-xs uppercase tracking-widest">або</span>
        <div className="flex-1 h-px bg-stone-800"></div>
      </div>

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