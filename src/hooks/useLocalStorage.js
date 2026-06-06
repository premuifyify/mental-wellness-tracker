/**
 * hooks/useLocalStorage.js
 *
 * useState with automatic synchronisation to localStorage.
 * Useful for persisting UI preferences (theme, sidebar state, filters).
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
import { useState, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // If a value exists, parse it; otherwise use the initial value.
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}"`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function for the same API as useState.
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage: error writing key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`useLocalStorage: error removing key "${key}"`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
