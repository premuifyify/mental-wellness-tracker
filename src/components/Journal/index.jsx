import { useState, useMemo } from 'react';
import { Search, Download, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useApp }          from '../../context/AppContext.jsx';
import { VIEWS, EMOTIONS } from '../../constants/index.js';
import { exportAsCSV, exportAsText } from '../../utils/exportUtils.js';
import { EmptyState }      from '../common/EmptyState.jsx';

const DATE_FMT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric', weekday: 'short',
});

const EMOTION_MAP = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));

const BURNOUT_BADGE = {
  low:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function ScoreChip({ label, value, max = 10 }) {
  return (
    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
      {label} <span className="font-bold text-slate-700 dark:text-slate-300">{value}</span>
      <span className="opacity-50">/{max}</span>
    </span>
  );
}

function JournalEntry({ checkIn }) {
  const [expanded, setExpanded] = useState(false);
  const emotionDef = EMOTION_MAP[checkIn.emotion];
  const hasJournal = checkIn.journal?.trim().length > 0;
  const longJournal = hasJournal && checkIn.journal.trim().length > 180;

  return (
    <article
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-fade-in"
      aria-label={`Journal entry for ${DATE_FMT.format(new Date(checkIn.date))}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <time
            dateTime={checkIn.date}
            className="text-sm font-semibold text-slate-800 dark:text-slate-100"
          >
            {DATE_FMT.format(new Date(checkIn.date))}
          </time>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {emotionDef && (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span aria-hidden="true">{emotionDef.emoji}</span>
                {emotionDef.label}
              </span>
            )}
            {checkIn.exam && (
              <span className="px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 text-[10px] font-medium">
                {checkIn.exam}
              </span>
            )}
            {checkIn.burnout && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${BURNOUT_BADGE[checkIn.burnout.risk] ?? ''}`}>
                {checkIn.burnout.risk} risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <ScoreChip label="Mood"   value={checkIn.mood}        />
        <ScoreChip label="Energy" value={checkIn.energy}      />
        <ScoreChip label="Stress" value={checkIn.stress}      />
        <ScoreChip label="Sleep"  value={checkIn.sleep}  max={12} />
        <ScoreChip label="Study"  value={checkIn.studyHours} max={20} />
      </div>

      {/* Journal text */}
      {hasJournal && (
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {expanded || !longJournal
              ? checkIn.journal.trim()
              : checkIn.journal.trim().slice(0, 180) + '…'}
          </p>
          {longJournal && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* AI reflection summary */}
      {checkIn.reflection?.summary && (
        <div className="rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 px-3 py-2">
          <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mb-1 uppercase tracking-wider">
            AI reflection
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {checkIn.reflection.summary}
          </p>
        </div>
      )}
    </article>
  );
}

export function Journal() {
  const { checkIns, setCurrentView } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return checkIns;
    return checkIns.filter(ci =>
      ci.journal?.toLowerCase().includes(q) ||
      ci.emotion?.toLowerCase().includes(q) ||
      ci.exam?.toLowerCase().includes(q) ||
      ci.reflection?.summary?.toLowerCase().includes(q),
    );
  }, [checkIns, query]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filtered],
  );

  const handleExportCSV = () => {
    if (!checkIns.length) { toast.error('No entries to export.'); return; }
    exportAsCSV(sorted);
    toast.success('Exported as CSV!');
  };

  const handleExportText = () => {
    if (!checkIns.length) { toast.error('No entries to export.'); return; }
    exportAsText(sorted);
    toast.success('Exported as text!');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Journal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {checkIns.length} {checkIns.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {checkIns.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportText}
              title="Export as text"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Export as text file"
            >
              <FileText size={14} />
            </button>
            <button
              onClick={handleExportCSV}
              title="Export as CSV"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Export as CSV"
            >
              <Download size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {checkIns.length > 0 && (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search journal entries…"
            className="
              w-full pl-9 pr-9 py-2.5 rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900
              text-sm text-slate-800 dark:text-slate-100
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              transition-colors
            "
            aria-label="Search journal entries"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {checkIns.length === 0 && (
        <EmptyState
          emoji="📓"
          title="Your journal is empty"
          description="Complete daily check-ins to build your personal wellness journal."
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

      {checkIns.length > 0 && query && sorted.length === 0 && (
        <EmptyState
          emoji="🔍"
          title="No results found"
          description={`No entries matching "${query}".`}
          action={
            <button
              onClick={() => setQuery('')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear search
            </button>
          }
        />
      )}

      <div className="space-y-3">
        {sorted.map(ci => <JournalEntry key={ci.id} checkIn={ci} />)}
      </div>
    </main>
  );
}
