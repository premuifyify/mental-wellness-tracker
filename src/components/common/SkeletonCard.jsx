export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div
      className={`
        rounded-2xl border bg-white dark:bg-slate-900
        border-slate-200 dark:border-slate-800
        p-5 animate-pulse ${className}
      `}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonStat({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 animate-pulse ${className}`}
    >
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 mb-3" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
    </div>
  );
}
