import { useState } from 'react';
import { useApp }        from '../../context/AppContext.jsx';
import { LineChart }     from './LineChart.jsx';
import { MoodHeatmap }   from './MoodHeatmap.jsx';
import { EmptyState }    from '../common/EmptyState.jsx';
import { VIEWS }         from '../../constants/index.js';

const TABS = [
  { id: '7',  label: '7 days' },
  { id: '30', label: '30 days' },
];

function ChartCard({ title, emoji, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        <span aria-hidden="true">{emoji} </span>{title}
      </p>
      {children}
    </div>
  );
}

function AveragePill({ label, value, max, color }) {
  if (value === null || value === undefined) return null;
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-${color}-500`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums w-6 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function avg(arr, key) {
  if (!arr.length) return null;
  return arr.reduce((s, ci) => s + (ci[key] ?? 0), 0) / arr.length;
}

export function Timeline() {
  const { last7, last30, checkIns, setCurrentView } = useApp();
  const [tab, setTab] = useState('7');

  const data = tab === '7' ? last7 : last30;

  const hasData = data.length >= 1;
  const hasSufficientData = data.length >= 3;

  const toSeries = (key) => data.map(ci => ({ date: ci.date, value: ci[key] ?? 0 }));

  const moodAvg   = avg(data, 'mood');
  const energyAvg = avg(data, 'energy');
  const stressAvg = avg(data, 'stress');
  const sleepAvg  = avg(data, 'sleep');

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mood timeline</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track how you've been feeling over time.
        </p>
      </div>

      {/* Tab switch */}
      <div
        className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit"
        role="tablist"
        aria-label="Time range"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
              ${tab === t.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hasData && (
        <EmptyState
          emoji="📊"
          title="No data for this period"
          description="Complete daily check-ins to see your trends here."
          action={
            <button
              onClick={() => setCurrentView(VIEWS.CHECKIN)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Start check-in
            </button>
          }
        />
      )}

      {hasData && (
        <>
          {/* Averages summary */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {tab === '7' ? '7-day' : '30-day'} averages
            </p>
            <AveragePill label="Mood"   value={moodAvg}   max={10} color="brand"   />
            <AveragePill label="Energy" value={energyAvg} max={10} color="amber"   />
            <AveragePill label="Stress" value={stressAvg} max={10} color="red"     />
            <AveragePill label="Sleep"  value={sleepAvg}  max={12} color="indigo"  />
          </div>

          {!hasSufficientData && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
              Check in for at least 3 days to see full trend charts.
            </p>
          )}

          {hasSufficientData && (
            <>
              <ChartCard title="Mood" emoji="😊">
                <LineChart data={toSeries('mood')} color="#6366f1" gradientId="g_mood" yMax={10} label="Mood" />
              </ChartCard>

              <ChartCard title="Stress level" emoji="🌀">
                <LineChart data={toSeries('stress')} color="#ef4444" gradientId="g_stress" yMax={10} label="Stress" />
              </ChartCard>

              <ChartCard title="Energy" emoji="⚡">
                <LineChart data={toSeries('energy')} color="#f59e0b" gradientId="g_energy" yMax={10} label="Energy" />
              </ChartCard>

              <ChartCard title="Sleep" emoji="🌙">
                <LineChart data={toSeries('sleep')} color="#8b5cf6" gradientId="g_sleep" yMax={12} label="Sleep" unit="h" />
              </ChartCard>

              <ChartCard title="Study hours" emoji="📚">
                <LineChart data={toSeries('studyHours')} color="#10b981" gradientId="g_study" yMax={16} label="Study" unit="h" />
              </ChartCard>
            </>
          )}
        </>
      )}

      {/* Heatmap — always show if any check-ins exist */}
      {checkIns.length >= 3 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            😊 Mood heatmap
          </p>
          <MoodHeatmap checkIns={checkIns} />
        </div>
      )}
    </main>
  );
}
