import { LayoutDashboard, PlusCircle, BarChart2, BookOpen, Trophy } from 'lucide-react';
import { useApp }  from '../../context/AppContext.jsx';
import { VIEWS }   from '../../constants/index.js';

const NAV_ITEMS = [
  { view: VIEWS.DASHBOARD,    icon: LayoutDashboard, label: 'Home'    },
  { view: VIEWS.CHECKIN,      icon: PlusCircle,      label: 'Check-In' },
  { view: VIEWS.TIMELINE,     icon: BarChart2,        label: 'Timeline' },
  { view: VIEWS.JOURNAL,      icon: BookOpen,         label: 'Journal'  },
  { view: VIEWS.ACHIEVEMENTS, icon: Trophy,           label: 'Awards'   },
];

export function NavBar() {
  const { currentView, setCurrentView } = useApp();

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-30
        bg-white/90 dark:bg-slate-950/90
        backdrop-blur-md
        border-t border-slate-200 dark:border-slate-800
        safe-area-inset-bottom
      "
      aria-label="Main navigation"
    >
      <ul className="max-w-2xl mx-auto flex" role="list">
        {NAV_ITEMS.map(({ view, icon: Icon, label }) => {
          const active = currentView === view;
          const isCheckin = view === VIEWS.CHECKIN;

          return (
            <li key={view} className="flex-1">
              <button
                onClick={() => setCurrentView(view)}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`
                  w-full flex flex-col items-center justify-center gap-0.5
                  py-2 px-1
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset
                  ${active
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
              >
                <span
                  className={`
                    flex items-center justify-center rounded-xl transition-all duration-200
                    ${isCheckin
                      ? `w-10 h-10 ${active
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110'
                          : 'bg-brand-600/90 text-white hover:bg-brand-600 hover:scale-105'
                        }`
                      : `w-7 h-7 ${active ? 'bg-brand-100 dark:bg-brand-900/50' : ''}`
                    }
                  `}
                  aria-hidden="true"
                >
                  <Icon size={isCheckin ? 20 : 18} strokeWidth={active ? 2.5 : 1.8} />
                </span>
                <span className={`text-[10px] font-medium leading-none ${isCheckin ? 'opacity-0 h-0' : ''}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
