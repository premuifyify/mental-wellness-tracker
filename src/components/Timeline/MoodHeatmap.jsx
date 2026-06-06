import { useState } from 'react';

const WEEKS = 14;
const DAYS  = 7;
const CELL  = 13;
const GAP   = 2;
const STEP  = CELL + GAP;

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function moodColor(value) {
  if (value === null) return 'rgba(148,163,184,0.1)';  // slate-400/10
  if (value <= 2) return '#ef4444';
  if (value <= 4) return '#f97316';
  if (value <= 6) return '#eab308';
  if (value <= 8) return '#6366f1';
  return '#10b981';
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function MoodHeatmap({ checkIns }) {
  const [tooltip, setTooltip] = useState(null);

  // Build a lookup: dateKey → mood value
  const lookup = Object.fromEntries(
    (checkIns ?? []).map(ci => [
      new Date(ci.date).toISOString().split('T')[0],
      ci.mood,
    ]),
  );

  // Build grid: WEEKS columns × 7 rows (Sun–Sat)
  // Start from (WEEKS * 7) days ago, aligned to the start of the week
  const today   = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - (WEEKS - 1) * 7 - dayOfWeek);
  gridStart.setHours(0, 0, 0, 0);

  const cells = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const key   = toDateKey(date);
      const mood  = lookup[key] ?? null;
      const isFuture = date > today;
      cells.push({ date, key, mood, w, d, isFuture });
    }
  }

  // Month labels — show month at the first cell of each month
  const monthLabels = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const refDate = new Date(gridStart);
    refDate.setDate(gridStart.getDate() + w * 7);
    const m = refDate.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ w, label: SHORT_MONTH[m] });
      lastMonth = m;
    }
  }

  const svgW = WEEKS * STEP + 28;
  const svgH = DAYS  * STEP + 24;

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        height={svgH}
        role="img"
        aria-label="Mood calendar heatmap for the past 14 weeks"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Day labels */}
        {[1, 3, 5].map(d => (
          <text
            key={d}
            x={20}
            y={d * STEP + CELL * 0.8 + 12}
            fontSize="7"
            textAnchor="end"
            className="fill-slate-400"
          >
            {DAY_LABELS[d]}
          </text>
        ))}

        {/* Month labels */}
        {monthLabels.map(({ w, label }) => (
          <text
            key={`${w}_${label}`}
            x={24 + w * STEP}
            y={8}
            fontSize="7"
            className="fill-slate-400"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map(({ date, key, mood, w, d, isFuture }) => {
          const x = 24 + w * STEP;
          const y = 12 + d * STEP;
          return (
            <rect
              key={key}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx="2"
              fill={isFuture ? 'transparent' : moodColor(mood)}
              opacity={isFuture ? 0 : 1}
              className="cursor-pointer"
              onMouseEnter={e => {
                if (!isFuture) {
                  setTooltip({ x: e.clientX, y: e.clientY, date, mood, key });
                }
              }}
              tabIndex={mood !== null ? 0 : -1}
              role={mood !== null ? 'img' : undefined}
              aria-label={
                mood !== null
                  ? `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}: mood ${mood}/10`
                  : undefined
              }
            />
          );
        })}
      </svg>

      {/* Tooltip rendered outside SVG for better positioning */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 36 }}
        >
          <span className="font-semibold">
            {tooltip.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          {tooltip.mood !== null
            ? ` · Mood ${tooltip.mood}/10`
            : ' · No check-in'
          }
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 px-1" aria-label="Heatmap color legend">
        <span className="text-[10px] text-slate-400">Low</span>
        {[1, 3, 5, 7, 9].map(v => (
          <span
            key={v}
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: moodColor(v) }}
            aria-hidden="true"
          />
        ))}
        <span className="text-[10px] text-slate-400">High</span>
      </div>
    </div>
  );
}
