import { BURNOUT_META } from '../../utils/burnoutCalculator.js';

// SVG circle circumference for a radius-42 circle — used to calculate
// the strokeDasharray that fills the ring proportionally to the score.
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BurnoutCard({ burnout }) {
  if (!burnout) return null;
  const { risk, score } = burnout;
  const meta = BURNOUT_META[risk];

  // strokeDash is how much of the circumference to fill — score/100 of the full circle.
  const strokeDash = (score / 100) * CIRCUMFERENCE;

  const strokeColor = {
    low:      '#10b981',
    moderate: '#f59e0b',
    high:     '#ef4444',
  }[risk];

  return (
    <div
      className={`
        rounded-2xl border p-5 flex flex-col items-center text-center gap-3
        ${meta.bgClass}
      `}
      role="region"
      aria-label={`Burnout risk: ${meta.label}`}
    >
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Burnout Risk
      </p>

      {/* Circular progress ring — aria-hidden because the text score below is
          the accessible value; screen readers don't need the SVG arc. */}
      <div className="relative w-28 h-28" aria-hidden="true">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background track — full circle in muted color */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            strokeWidth="8"
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          {/* Progress arc — partial fill based on score percentage */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black tabular-nums ${meta.textClass}`}>{score}</span>
          <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      <div>
        <span className={`text-sm font-bold ${meta.textClass}`}>{meta.label}</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug max-w-[180px]">
          {meta.advice}
        </p>
      </div>
    </div>
  );
}
