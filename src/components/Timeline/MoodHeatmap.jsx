import { useState } from 'react';

// Grid dimensions — matching GitHub's contribution graph style.
const WEEKS = 14;   // columns
const DAYS  = 7;    // rows (Sun–Sat)
const CELL  = 13;   // cell size in SVG units
const GAP   = 2;    // gap between cells
const STEP  = CELL + GAP;

const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Maps a mood value (1–10) to a color.
 * null means no check-in on that day (renders as near-transparent).
 * The scale intentionally skips green for mid-range (5–8) and uses indigo
 * to stay consistent with the brand palette.
 */
function moodColor(value) {
  if (value === null) return 'rgba(148,163,184,0.1)';
  if (value <= 2) return '#ef4444'; // red
  if (value <= 4) return '#f97316'; // orange
  if (value <= 6) return '#eab308'; // yellow
  if (value <= 8) return '#6366f1'; // indigo (brand)
  return '#10b981';                  // emerald
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function MoodHeatmap({ checkIns }) {
  const [tooltip, setTooltip] = useState(null);

  // Build a fast O(1) lookup from YYYY-MM-DD date key to mood value.
  // If a user submitted multiple check-ins for the same day (shouldn't happen
  // normally but possible via the date override feature), later entries win
  // because Object.fromEntries takes the last duplicate key.
  const lookup = Object.fromEntries(
    (checkIns ?? []).map(ci => [
      new Date(ci.date).toISOString().split('T')[0],
      ci.mood,
    ]),
  );

  // Anchor the grid to the start of the week containing the oldest visible date.
  // gridStart is the Sunday (WEEKS * 7) days before today, aligned to week start.
  const today    = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - (WEEKS - 1) * 7 - dayOfWeek);
  gridStart.setHours(0, 0, 0, 0);

  // Build the full cell array — WEEKS × DAYS entries with date, mood, and position.
  const cells = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const key      = toDateKey(date);
      const mood     = lookup[key] ?? null;
      const isFuture = date > today;
      cells.push({ date, key, mood, w, d, isFuture });
    }
  }

  // Place month labels at the first week where the month changes.
  // Avoids labelling the same month twice if it spans multiple column groups.
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

  // 28px left margin for day labels; 24px top margin for month labels.
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
        {/* Show labels only for Mon (1), Wed (3), Fri (5) to avoid crowding */}
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

        {/* Month labels above each new month column */}
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

        {/* Heatmap cells — future dates are invisible (opacity 0) */}
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
                // Only show tooltip for past/present cells with data
                if (!isFuture) {
                  setTooltip({ x: e.clientX, y: e.clientY, date, mood, key });
                }
              }}
              // Only focusable if the cell has check-in data
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

      {/* Tooltip rendered as a fixed div outside the SVG so it can overflow
          the SVG boundaries without being clipped. Positioned via mouse coords. */}
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

      {/* Color legend — five sample squares across the mood range */}
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
