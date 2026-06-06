import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Moon, Sun, UtensilsCrossed } from 'lucide-react';
import Home from '@/pages/Home';
import { STORAGE_KEYS, APP_NAME } from '@/constants';

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  return [isDark, setIsDark];
}

export default function App() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Site header */}
      <nav className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-gray-900 dark:text-gray-100">{APP_NAME}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDark(d => !d)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={
              'p-2 rounded-lg text-gray-600 dark:text-gray-300 ' +
              'hover:bg-gray-100 dark:hover:bg-gray-800 ' +
              'focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
              'transition-colors'
            }
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <Home />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}
