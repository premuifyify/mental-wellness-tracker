import { MOOD_LABELS } from '../../constants/index.js';

const SCORE_COLOR = (v) => {
  if (v <= 3) return 'text-red-500';
  if (v <= 5) return 'text-amber-500';
  if (v <= 7) return 'text-blue-500';
  return 'text-emerald-500';
};

const TRACK_COLOR = (v) => {
  if (v <= 3) return '#ef4444';
  if (v <= 5) return '#f59e0b';
  if (v <= 7) return '#6366f1';
  return '#10b981';
};

export function ScoreSlider({ label, name, value, onChange, min = 1, max = 10, lowLabel, highLabel }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span
          className={`text-xl font-bold tabular-nums ${SCORE_COLOR(value)}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">/{max}</span>
        </span>
      </div>

      {/* Slider track */}
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, ${TRACK_COLOR(value)} ${pct}%, #e2e8f0 ${pct}%)`,
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={MOOD_LABELS[value] ?? String(value)}
        />
      </div>

      {/* Low / high labels */}
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
