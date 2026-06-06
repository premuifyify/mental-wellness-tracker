import { EMOTIONS } from '../../constants/index.js';

function StatPill({ label, value, max = 10, emoji, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-xs" aria-hidden="true">{emoji}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
        <span className="text-xs text-slate-400">/{max}</span>
      </div>
      {/* Mini bar */}
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-${color}-500 transition-all duration-500`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function QuickStats({ checkIn }) {
  const { mood, energy, stress, sleep, studyHours, emotion } = checkIn;
  const emotionDef = EMOTIONS.find(e => e.id === emotion);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Today at a glance</h2>
        {emotionDef && (
          <span
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1"
            aria-label={`Feeling: ${emotionDef.label}`}
          >
            <span aria-hidden="true">{emotionDef.emoji}</span>
            {emotionDef.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatPill label="Mood"   value={mood}   emoji="😊" color="brand"  />
        <StatPill label="Energy" value={energy} emoji="⚡" color="amber"  />
        <StatPill label="Stress" value={stress} emoji="🌀" color="red"    />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <StatPill label="Sleep"  value={sleep}      max={12} emoji="🌙" color="indigo" />
        <StatPill label="Study"  value={studyHours} max={16} emoji="📚" color="violet" />
      </div>
    </div>
  );
}
