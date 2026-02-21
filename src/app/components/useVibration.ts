'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tea-diary-vibration';

export function useVibration() {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setEnabledState(saved === 'true');
    }
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
    // Дати коротку вібрацію при ввімкненні для підтвердження
    if (value && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, []);

  const vibrate = useCallback(
    (pattern: number | number[] = 10) => {
      if (!enabled) return;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    },
    [enabled]
  );

  // Спеціальні патерни
  const tap = useCallback(() => vibrate(8), [vibrate]); // Легкий тап
  const press = useCallback(() => vibrate(15), [vibrate]); // Натискання кнопки
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]); // Успіх
  const heavy = useCallback(() => vibrate(25), [vibrate]); // Важка дія

  return { enabled, setEnabled, vibrate, tap, press, success, heavy };
}
