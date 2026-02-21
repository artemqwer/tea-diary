'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валідація
    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль має бути не менше 6 символів');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Помилка реєстрації');
        setLoading(false);
        return;
      }

      // Успіх! Перенаправляємо на логін
      router.push('/login?registered=true');
    } catch (err) {
      setError('Щось пішло не так');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-200">
      {/* Лого / Заголовок */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 bg-linear-to-tr from-amber-700 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/20">
          <Leaf size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-serif text-stone-100">Чайний Щоденник</h1>
        <p className="text-stone-500 text-sm mt-2">Створення нового акаунту</p>
      </div>

      {/* Картка реєстрації */}
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Помилка */}
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">
              Ім&apos;я
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
              <input
                type="text"
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-hidden transition-colors"
                placeholder="Ваше ім'я"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

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
                placeholder="tea@example.com"
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
                placeholder="Мінімум 6 символів"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase tracking-widest block mb-1.5 ml-1">
              Підтвердіть пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-stone-600" size={18} />
              <input
                type="password"
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-200 focus:border-amber-600/50 focus:outline-hidden transition-colors"
                placeholder="Повторіть пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Реєструємо...' : 'Зареєструватись'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Посилання на логін */}
        <div className="mt-6 text-center">
          <p className="text-stone-500 text-sm">
            Вже є акаунт?{' '}
            <Link
              href="/login"
              className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
            >
              Увійти
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-stone-600 text-xs">© 2026 Tea Diary App</p>
    </div>
  );
}
