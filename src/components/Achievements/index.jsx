import { useApp }                          from '../../context/AppContext.jsx';
import { VIEWS }                            from '../../constants/index.js';
import { getEarnedAchievements, getUnearnedAchievements } from '../../utils/achievements.js';

function AchievementBadge({ def, earned }) {
  return (
    <div
      className={`
        rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all duration-300
        ${earned
          ? 'border-brand-200 dark:border-brand-800/60 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/30 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-50'
        }
      `}
      aria-label={`${def.label} — ${earned ? 'Earned' : 'Locked'}`}
    >
      <span
        className={`text-3xl leading-none select-none ${earned ? 'animate-bounce-in' : 'grayscale'}`}
        aria-hidden="true"
      >
        {def.emoji}
      </span>
      <div>
        <p className={`text-xs font-bold ${earned ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
          {def.label}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
          {def.description}
        </p>
      </div>
      {earned && (
        <span className="text-[9px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-2 py-0.5 rounded-full">
          ✓ Earned
        </span>
      )}
      {!earned && (
        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          Locked
        </span>
      )}
    </div>
  );
}

export function Achievements() {
  const { earned, checkIns, streak, setCurrentView } = useApp();

  const earnedDefs   = getEarnedAchievements(earned);
  const unearnedDefs = getUnearnedAchievements(earned);
  const total        = earnedDefs.length + unearnedDefs.length;
  const pct          = total > 0 ? Math.round((earnedDefs.length / total) * 100) : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Achievements</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Celebrating your consistency and growth.
        </p>
      </div>

      {/* Progress overview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {earnedDefs.length} / {total} badges earned
          </p>
          <span className="text-lg font-black text-brand-600 dark:text-brand-400 tabular-nums">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
            aria-label={`${pct}% achievement progress`}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{streak.current}</p>
            <p className="text-[10px] text-slate-400">Day streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{streak.longest}</p>
            <p className="text-[10px] text-slate-400">Best streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{checkIns.length}</p>
            <p className="text-[10px] text-slate-400">Check-ins</p>
          </div>
        </div>
      </div>

      {/* Earned badges */}
      {earnedDefs.length > 0 && (
        <section aria-label="Earned achievements">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            🏅 Earned ({earnedDefs.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedDefs.map(def => (
              <AchievementBadge key={def.id} def={def} earned />
            ))}
          </div>
        </section>
      )}

      {/* Locked badges */}
      {unearnedDefs.length > 0 && (
        <section aria-label="Locked achievements">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            🔒 Locked ({unearnedDefs.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unearnedDefs.map(def => (
              <AchievementBadge key={def.id} def={def} earned={false} />
            ))}
          </div>
        </section>
      )}

      {/* CTA if no check-ins */}
      {checkIns.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Start checking in daily to unlock achievements and build streaks!
          </p>
          <button
            onClick={() => setCurrentView(VIEWS.CHECKIN)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Start my first check-in
          </button>
        </div>
      )}
    </main>
  );
}
