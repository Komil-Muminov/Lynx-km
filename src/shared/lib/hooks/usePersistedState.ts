import { useState, useEffect } from 'react';

/**
 * Хук для создания стейта, который автоматически сохраняется в localStorage.
 * При инициализации пытается восстановить значение по ключу.
 */
export const usePersistedState = <T>(key: string, defaultValue: T): [T, (val: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const persisted = localStorage.getItem(key);
      return persisted !== null ? JSON.parse(persisted) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Error persisting state to localStorage', e);
    }
  }, [key, state]);

  return [state, setState];
};
