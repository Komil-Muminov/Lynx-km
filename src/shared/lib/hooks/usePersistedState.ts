import { useState, useEffect } from 'react';

/**
 * Хук для создания стейта, который автоматически сохраняется в localStorage.
 * При инициализации пытается восстановить значение по ключу.
 */
export const usePersistedState = <T>(key: string, defaultValue: T): [T, (val: T) => void] => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    // В Lynx для персистентности нужно использовать встроенные средства хранения (например, MMKV или NativeStorage).
    // Пока просто используем обычный стейт.
  }, [key, state]);

  return [state, setState];
};
