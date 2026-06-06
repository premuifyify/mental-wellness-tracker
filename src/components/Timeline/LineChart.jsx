import { useState } from 'react';

const PADDING = { top: 16, right: 12, bottom: 28, left: 32 };

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
  const xStep = n > 1 ? plotW / (n - 1) : 0;

  const toX = (i) => PADDING.left + (n === 1 ? plotW / 2 : i * xStep);
  const toY = (v) => PADDING.top + plotH - (Math.min(v, yMax) / yMax) * plotH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));
  const linePath = buildPath(points);
  const areaPath = linePath
    ? `${linePath} L${points[points.length - 1].x},${PADDING.top + plotH} L${points[0].x},${PADDING.top + plotH} Z`
    : '';

  // Y-axis grid lines
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (yMax / yTicks) * i;
    return { y: toY(v), label: Math.round(v) };
  });

  // X-axis labels — show max 7 to avoid crowding
  const step = Math.ceil(n / 7);
  const xLabels = points.filter((_, i) => i % step === 0 || i === n - 1);

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

        {/* Area fill */}
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

        {/* Data points */}
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

        {/* X-axis labels */}
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

        {/* Tooltip */}
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
