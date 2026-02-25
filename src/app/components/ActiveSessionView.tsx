import React, { useState, useEffect } from 'react';
import { useLocale } from './LocaleProvider';
import { useVibration } from './useVibration';
import { ChevronRight, Play, Pause, RotateCcw, Star } from 'lucide-react';
import { addSessionAction } from './../actions';
import { Tea } from './types';

export const ActiveSessionView = ({ tea, onClose }: { tea: Tea; onClose: () => void }) => {
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
        className="fixed inset-0 z-80 flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-200"
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
              type="button"
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
          type="button"
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
      className="fixed inset-0 z-70 flex flex-col h-dvh overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Хедер */}
      <div className="flex justify-between items-center p-6 pt-12">
        <button
          type="button"
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
          type="button"
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
          className="text-lg font-serif mb-3 text-center truncate w-full px-2"
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
              type="button"
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
                className="bg-transparent w-8 text-center focus:outline-hidden"
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
                className="bg-transparent w-6 text-center focus:outline-hidden"
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
                className="bg-transparent w-8 text-center focus:outline-hidden"
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
                type="button"
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
                type="button"
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
                type="button"
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
                          className="w-12 text-3xl font-light text-center rounded-lg focus:outline-hidden bg-transparent"
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
                          className="w-12 text-3xl font-light text-center rounded-lg focus:outline-hidden bg-transparent"
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
                          className="px-1.5 py-0.5 rounded-sm text-[10px]"
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
                type="button"
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
                  type="button"
                  onClick={extendCountdown}
                  className="h-14 px-7 rounded-full font-bold shadow-2xl active:scale-95 transition-all text-white animate-pulse"
                  style={{ background: 'var(--accent)' }}
                >
                  {t.session.extend}
                </button>
              ) : countdown === null ? (
                <button
                  type="button"
                  onClick={startCountdown}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <Play size={30} fill="currentColor" className="ml-1" />
                </button>
              ) : (
                <button
                  type="button"
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
                type="button"
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
