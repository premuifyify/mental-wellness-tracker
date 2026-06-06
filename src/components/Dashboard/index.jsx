import { PlusCircle, BookOpen } from 'lucide-react';

import { useApp }          from '../../context/AppContext.jsx';
import { VIEWS }           from '../../constants/index.js';
import { BurnoutCard }     from './BurnoutCard.jsx';
import { StreakCard }       from './StreakCard.jsx';
import { QuickStats }      from './QuickStats.jsx';
import { ReflectionPanel } from './ReflectionPanel.jsx';
import { EmptyState }      from '../common/EmptyState.jsx';

const DATE_FMT = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

// Shows a countdown only when exam date is set AND within the next 365 days.
// Beyond a year the countdown is more anxiety-inducing than motivating.
function ExamCountdown({ examDate, exam }) {
  if (!examDate) return null;
  const days = Math.max(
    0,
    Math.ceil((new Date(examDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86_400_000),
  );
  if (days > 365) return null;

  return (
    <div
      className="rounded-2xl border border-brand-200 dark:border-brand-900/40 bg-gradient-to-r from-brand-600 to-accent-600 p-4 text-white"
      role="status"
      aria-label={`${days} days until ${exam} exam`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{exam} countdown</p>
          <p className="text-3xl font-black tabular-nums mt-0.5">
            {days}
            <span className="text-base font-semibold ml-1 opacity-80">
              {days === 1 ? 'day left' : 'days left'}
            </span>
          </p>
        </div>
        <span className="text-4xl" aria-hidden="true">📅</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { todaysCheckIn, streak, checkIns, setCurrentView, aiLoadingId } = useApp();

  // Only show the AI skeleton for the current check-in, not for any background
  // re-fetches that may be happening for other entries (shouldn't occur, but
  // this guard prevents false loading states).
  const isAiLoading = aiLoadingId !== null && todaysCheckIn?.id === aiLoadingId;

  // Empty state — no check-in yet today. Show streak and a CTA.
  if (!todaysCheckIn) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <div className="mb-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">{DATE_FMT.format(new Date())}</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Welcome back, Scholar!
          </h1>
        </div>

        {/* Show streak even when no check-in today — motivates the user to maintain it. */}
        <StreakCard streak={streak} totalCheckIns={checkIns.length} />

        <EmptyState
          emoji="✍️"
          title="No check-in today yet"
          description="Take a minute to reflect on your wellbeing. It helps you track patterns and stay balanced."
          action={
            <button
              onClick={() => setCurrentView(VIEWS.CHECKIN)}
              className="
                flex items-center gap-2 px-6 py-3 rounded-2xl
                bg-gradient-to-r from-brand-600 to-accent-600
                hover:from-brand-700 hover:to-accent-700
                text-white font-semibold text-sm
                shadow-lg shadow-brand-500/30
                transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
              "
            >
              <PlusCircle size={16} /> Start today's check-in
            </button>
          }
        />
      </main>
    );
  }

  const { burnout, exam, examDate } = todaysCheckIn;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{DATE_FMT.format(new Date())}</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Today's wellness snapshot
          </h1>
        </div>
        <button
          onClick={() => setCurrentView(VIEWS.CHECKIN)}
          className="
            flex items-center gap-1.5 text-xs font-medium
            text-brand-600 dark:text-brand-400
            bg-brand-50 dark:bg-brand-950/50
            border border-brand-200 dark:border-brand-800
            px-3 py-1.5 rounded-full
            hover:bg-brand-100 dark:hover:bg-brand-900/50
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
        >
          <BookOpen size={12} /> Edit
        </button>
      </div>

      {/* Exam countdown — only renders when exam + date are both set */}
      {exam && examDate && <ExamCountdown examDate={examDate} exam={exam} />}

      {/* Quick stats grid — mood, energy, stress, sleep, study */}
      <QuickStats checkIn={todaysCheckIn} />

      {/* Burnout and streak side by side on the same row */}
      <div className="grid grid-cols-2 gap-3">
        <BurnoutCard burnout={burnout} />
        <StreakCard streak={streak} totalCheckIns={checkIns.length} />
      </div>

      {/* AI Reflection — shows skeleton while isAiLoading, nothing if no data yet */}
      <ReflectionPanel checkIn={todaysCheckIn} isLoading={isAiLoading} />
    </main>
  );
}
