export function StreakCard({ streak, totalCheckIns }) {
  const { current, longest } = streak;
  const isEmpty = current === 0;

  return (
    <div
      className={`
        rounded-2xl border p-5
        ${isEmpty
          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          : 'border-brand-500/20 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40'
        }
      `}
      role="region"
      aria-label="Check-in streak"
    >
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Streak
      </p>

      <div className="flex items-end gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
              {current}
            </span>
            <span className="text-lg text-slate-400" aria-hidden="true">
              {current === 0 ? '💤' : current >= 7 ? '🔥' : '✨'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {current === 1 ? 'day streak' : 'day streak'}
          </p>
        </div>

        <div className="ml-auto text-right space-y-1">
          <Stat label="Best" value={longest} />
          <Stat label="Total" value={totalCheckIns} />
        </div>
      </div>

      {isEmpty && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-snug">
          Check in today to start your streak!
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 dark:text-slate-500">{label}:</span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">{value}</span>
    </div>
  );
}
