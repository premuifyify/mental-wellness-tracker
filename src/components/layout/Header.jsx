import { Sun, Moon, Brain } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useApp }   from '../../context/AppContext.jsx';
import { VIEWS }    from '../../constants/index.js';

const DAY_GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DATE_FMT = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long',
});

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { setCurrentView }     = useApp();

  return (
    <header
      className="
        sticky top-0 z-30
        bg-white/80 dark:bg-slate-950/80
        backdrop-blur-md
        border-b border-slate-200 dark:border-slate-800
      "
      role="banner"
    >
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setCurrentView(VIEWS.DASHBOARD)}
          className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
          aria-label="ExamMind — go to dashboard"
        >
          <span
            className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-brand-600 to-accent-500
              shadow-md shadow-brand-500/20
              group-hover:shadow-brand-500/40 transition-shadow
            "
            aria-hidden="true"
          >
            <Brain size={16} className="text-white" />
          </span>
          <span className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">
            ExamMind
          </span>
        </button>

        {/* Date + theme toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
            {`${DAY_GREETING()}, Scholar`}
          </span>
          <span className="hidden md:block text-xs text-slate-400 dark:text-slate-500">
            {DATE_FMT.format(new Date())}
          </span>
          <button
            onClick={toggleTheme}
            className="
              w-8 h-8 flex items-center justify-center rounded-full
              text-slate-500 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            "
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
