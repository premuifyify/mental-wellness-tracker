import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value;
        setStoredValue(next);
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Quota exceeded or private browsing — fail silently
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch {
      // No-op
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return [storedValue, setValue, removeValue];
}
