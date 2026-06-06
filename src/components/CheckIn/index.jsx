import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { ScoreSlider }  from './ScoreSlider.jsx';
import { EmotionPicker } from './EmotionPicker.jsx';
import { useApp }       from '../../context/AppContext.jsx';
import { EXAMS }        from '../../constants/index.js';

// Returns today's date in YYYY-MM-DD format — used as the default value
// for the checkInDate field and as the max for the date input.
const todayISO = () => new Date().toISOString().split('T')[0];

// Default form values for a fresh check-in.
// Scores are set to "neutral" (5/10) rather than 0 so the first interaction
// feels balanced and doesn't bias toward negative results.
const INITIAL = {
  mood:          5,
  energy:        5,
  stress:        5,
  sleep:         7,   // 7h is the healthy adult target; a reasonable default
  studyHours:    6,
  exam:          '',
  examDate:      '',
  emotion:       '',
  journal:       '',
  checkInDate:   todayISO(),
};

function FormSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Stepper input with 0.5-unit steps — used for sleep and study hours where
// fractional values are common (e.g., "6.5h sleep").
function NumberInput({ label, id, value, onChange, min, max, unit }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 0.5))}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="w-12 text-center tabular-nums font-semibold text-slate-800 dark:text-slate-100">
          {value}{unit}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 0.5))}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}

export function CheckIn() {
  const { processCheckIn, aiLoadingId, todaysCheckIn } = useApp();

  // If today already has a check-in, pre-fill the form so the user can edit
  // their existing entry. AI-generated fields (reflection, triggers, etc.) and
  // internal fields (id, date, burnout) are stripped — only user-editable fields.
  const [form, setForm] = useState(() => {
    if (todaysCheckIn) {
      const { reflection, triggers, suggestions, id, date, burnout, ...editable } = todaysCheckIn;
      return { ...editable, checkInDate: date ? date.split('T')[0] : todayISO() };
    }
    return INITIAL;
  });
  const [submitting, setSubmitting] = useState(false);

  // Curried setter: set('mood')(7) is equivalent to setForm(f => ({...f, mood: 7}))
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // Client-side validation before hitting processCheckIn.
  // Emotion is required because it feeds the AI prompt and trigger detector.
  const validate = () => {
    if (!form.emotion) {
      toast.error('Please select how you are feeling right now.');
      return false;
    }
    if (form.sleep < 0 || form.sleep > 24) {
      toast.error('Sleep hours must be between 0 and 24.');
      return false;
    }
    if (form.studyHours < 0 || form.studyHours > 24) {
      toast.error('Study hours must be between 0 and 24.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // processCheckIn handles the full async pipeline: save → navigate → AI fetch
      await processCheckIn(form);
    } finally {
      setSubmitting(false);
    }
  };

  // Show "Update" UI when an entry already exists for today.
  const isUpdating = Boolean(todaysCheckIn);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {isUpdating ? "Update today's check-in" : 'Daily check-in'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isUpdating
            ? 'You already checked in today. Feel free to update your entry.'
            : 'Take a moment to reflect on how you\'re doing.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Wellbeing metrics */}
        <FormSection title="How are you feeling?">
          <ScoreSlider
            label="Mood"
            name="mood"
            value={form.mood}
            onChange={set('mood')}
            lowLabel="Very low"
            highLabel="Excellent"
          />
          <ScoreSlider
            label="Energy level"
            name="energy"
            value={form.energy}
            onChange={set('energy')}
            lowLabel="Drained"
            highLabel="Energised"
          />
          <ScoreSlider
            label="Stress level"
            name="stress"
            value={form.stress}
            onChange={set('stress')}
            lowLabel="Relaxed"
            highLabel="Very stressed"
          />
        </FormSection>

        {/* Rest & Study */}
        <FormSection title="Rest & Study">
          <NumberInput
            label="Sleep last night"
            id="sleep"
            value={form.sleep}
            onChange={set('sleep')}
            min={0}
            max={12}
            unit="h"
          />
          <NumberInput
            label="Study hours today"
            id="studyHours"
            value={form.studyHours}
            onChange={set('studyHours')}
            min={0}
            max={20}
            unit="h"
          />
        </FormSection>

        {/* Exam info */}
        <FormSection title="Your Exam">
          <div className="space-y-3">
            <div>
              <label htmlFor="exam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Exam you're preparing for
              </label>
              <select
                id="exam"
                value={form.exam}
                onChange={e => set('exam')(e.target.value)}
                className="
                  w-full rounded-xl border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-800 dark:text-slate-100
                  px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-colors
                "
              >
                <option value="">— Select exam —</option>
                {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Exam date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="examDate"
                type="date"
                value={form.examDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('examDate')(e.target.value)}
                className="
                  w-full rounded-xl border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800
                  text-slate-800 dark:text-slate-100
                  px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-colors
                "
              />
            </div>
          </div>
        </FormSection>

        {/* Emotion */}
        <FormSection title="Your Emotion">
          <EmotionPicker value={form.emotion} onChange={set('emotion')} />
        </FormSection>

        {/* Journal */}
        <FormSection title="Journal (optional)">
          <div>
            <label htmlFor="journal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              What's on your mind today?
            </label>
            <textarea
              id="journal"
              value={form.journal}
              onChange={e => set('journal')(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share anything you'd like to reflect on — it helps your AI companion understand you better..."
              className="
                w-full rounded-xl border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                text-slate-800 dark:text-slate-100 placeholder:text-slate-400
                px-3 py-2.5 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                transition-colors
              "
            />
            <p className="text-right text-[10px] text-slate-400 mt-1">
              {form.journal.length}/1000
            </p>
          </div>
        </FormSection>

        {/* Check-in date override — allows back-filling entries for demo/testing.
            Capped at today (max) so future dates can't be submitted. */}
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Check-in date
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Defaults to today — change to back-fill entries</p>
            </div>
            <input
              id="checkInDate"
              type="date"
              value={form.checkInDate}
              max={todayISO()}
              onChange={e => set('checkInDate')(e.target.value)}
              className="
                rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800
                text-slate-800 dark:text-slate-100
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                transition-colors
              "
            />
          </div>
        </div>

        {/* Submit — disabled while submitting or while the AI is fetching data
            for any check-in (aiLoadingId !== null) to prevent duplicate saves. */}
        <button
          type="submit"
          disabled={submitting || Boolean(aiLoadingId)}
          className="
            w-full flex items-center justify-center gap-2
            py-3.5 rounded-2xl
            bg-gradient-to-r from-brand-600 to-accent-600
            hover:from-brand-700 hover:to-accent-700
            disabled:opacity-60 disabled:cursor-not-allowed
            text-white font-semibold text-sm
            shadow-lg shadow-brand-500/30
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
          aria-busy={submitting}
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Saving…</>
          ) : (
            <>{isUpdating ? 'Update check-in' : 'Save & get reflection'} <ChevronRight size={18} /></>
          )}
        </button>
      </form>
    </main>
  );
}
