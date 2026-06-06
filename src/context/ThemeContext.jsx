// ThemeContext manages dark/light mode.
// The active theme is persisted to localStorage so the user's preference
// survives page refreshes. Default is 'dark' — most students study at night.
import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants/index.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Read persisted preference on first mount. Fall back to 'dark' if
    // localStorage is unavailable (private browsing, SSR, etc.).
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) ?? 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    // Toggle the `dark` class on <html> so Tailwind's `dark:` variants
    // take effect globally. This is the recommended Tailwind dark-mode
    // approach when using class-based (not media-query) strategy.
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // No-op — theme still works for the session via React state
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
