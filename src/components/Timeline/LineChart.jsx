import { useState } from 'react';

// Fixed padding so axis labels have consistent room regardless of chart height.
const PADDING = { top: 16, right: 12, bottom: 28, left: 32 };

/**
 * Builds an SVG path string using cubic bezier curves for smooth rendering.
 * The control points are set at 1/3 of the horizontal distance between
 * consecutive points, keeping the curve's tangent horizontal at each data point
 * — this avoids the overshoot that a Catmull-Rom spline can produce with
 * sharply varying data.
 */
function buildPath(points) {
  if (points.length < 2) return points.length === 1 ? `M${points[0].x},${points[0].y}` : '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = curr.x - (curr.x - prev.x) / 3;
    const cp2y = curr.y;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
  }
  return d;
}

const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${SHORT_MONTH[d.getMonth()]}`;
}

/**
 * Pure SVG line chart — no chart library dependency.
 * Uses a fixed 380-wide viewBox with preserveAspectRatio so it scales
 * fluidly within any container width.
 *
 * @param {Array}  data       - [{ date: ISO string, value: number }]
 * @param {string} color      - hex color for the line and dots
 * @param {string} gradientId - unique SVG gradient ID (must differ per chart on the page)
 * @param {number} yMax       - top of the Y axis (e.g., 10 for mood, 12 for sleep)
 * @param {number} yTicks     - number of horizontal grid lines
 * @param {string} label      - accessible label / axis label
 * @param {string} unit       - suffix appended to values in tooltips (e.g., 'h')
 * @param {number} height     - SVG height in viewBox units
 */
export function LineChart({
  data,
  color = '#6366f1',
  gradientId,
  yMax = 10,
  yTicks = 5,
  label,
  unit = '',
  height = 160,
}) {
  const [tooltip, setTooltip] = useState(null);

  const W     = 380;
  const H     = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top  - PADDING.bottom;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-xs text-slate-400">
        No data yet
      </div>
    );
  }

  const n = data.length;
  // xStep is 0 when there's only one point — toX handles it by centering.
  const xStep = n > 1 ? plotW / (n - 1) : 0;

  const toX = (i) => PADDING.left + (n === 1 ? plotW / 2 : i * xStep);
  // toY inverts the Y axis: value=yMax maps to the top (PADDING.top),
  // value=0 maps to the bottom (PADDING.top + plotH).
  const toY = (v) => PADDING.top + plotH - (Math.min(v, yMax) / yMax) * plotH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));
  const linePath = buildPath(points);

  // Area path closes the region under the line with a horizontal base
  // so it can be filled with the gradient.
  const areaPath = linePath
    ? `${linePath} L${points[points.length - 1].x},${PADDING.top + plotH} L${points[0].x},${PADDING.top + plotH} Z`
    : '';

  // Y-axis grid lines evenly spaced from 0 to yMax
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (yMax / yTicks) * i;
    return { y: toY(v), label: Math.round(v) };
  });

  // X-axis labels — show at most 7 to avoid crowding on mobile.
  // Always include the last point so the right end of the axis is labelled.
  const step = Math.ceil(n / 7);
  const xLabels = points.filter((_, i) => i % step === 0 || i === n - 1);

  // Fallback gradient ID uses the label so charts sharing a page don't
  // reference each other's gradient — SVG gradient IDs are global per document.
  const gId = gradientId ?? `grad_${label?.replace(/\s/g, '_')}`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full overflow-visible"
        role="img"
        aria-label={`${label ?? 'Chart'} over time`}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {/* Vertical gradient fades from color at the line to transparent at the bottom */}
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(({ y, label: gl }) => (
          <g key={gl}>
            <line
              x1={PADDING.left} y1={y}
              x2={PADDING.left + plotW} y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6} y={y + 3.5}
              textAnchor="end"
              fontSize="8"
              className="fill-slate-400"
            >
              {gl}
            </text>
          </g>
        ))}

        {/* Area fill beneath the line */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${gId})`} />
        )}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data point dots — hoverable/focusable for tooltip */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            className="cursor-pointer transition-all"
            onMouseEnter={() => setTooltip(pt)}
            onFocus={() => setTooltip(pt)}
            onBlur={() => setTooltip(null)}
            tabIndex={0}
            role="img"
            aria-label={`${fmtDate(pt.date)}: ${pt.value}${unit}`}
          />
        ))}

        {/* X-axis date labels */}
        {xLabels.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="8"
            className="fill-slate-400"
          >
            {fmtDate(pt.date)}
          </text>
        ))}

        {/* Tooltip bubble — flips to left side when near the right edge to stay in view */}
        {tooltip && (() => {
          const tx = tooltip.x > W * 0.7 ? tooltip.x - 52 : tooltip.x + 8;
          const ty = tooltip.y > H * 0.7 ? tooltip.y - 28 : tooltip.y - 10;
          return (
            <g>
              <rect x={tx} y={ty} width="50" height="22" rx="4" fill="#1e293b" opacity="0.9" />
              <text x={tx + 25} y={ty + 14} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                {tooltip.value}{unit} · {fmtDate(tooltip.date)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
