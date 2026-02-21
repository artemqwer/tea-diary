'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

// GitHub logo SVG
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
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
  const [githubLoading, setGithubLoading] = useState(false);

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

  const handleGitHubSignIn = async () => {
    setGithubLoading(true);
    setError('');
    try {
      await signIn('github', { callbackUrl: '/' });
    } catch (err) {
      setError('Помилка входу через GitHub');
      setGithubLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
      {/* GitHub Sign In */}
      <button
        onClick={handleGitHubSignIn}
        disabled={githubLoading}
        className="w-full bg-[#24292f] hover:bg-[#2f363d] text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs border border-stone-700"
      >
        <GitHubIcon />
        {githubLoading ? 'Підключаємо...' : 'Увійти через GitHub'}
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
          <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
            <input
              type="email"
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-hidden transition-colors"
              placeholder="admin@tea.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
            <input
              type="password"
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-hidden transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
          <Link
            href="/register"
            className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
          >
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
        <div className="w-16 h-16 bg-linear-to-tr from-amber-700 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/20">
          <Leaf size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-serif text-stone-100">Чайний Щоденник</h1>
        <p className="text-stone-500 text-sm mt-2">Вхід до особистої колекції</p>
      </div>

      <Suspense fallback={<div className="text-stone-500">Завантаження форми...</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-stone-600 text-xs">© 2026 Tea Diary App</p>
    </div>
  );
}
