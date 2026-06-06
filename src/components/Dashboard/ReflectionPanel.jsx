import { useState } from 'react';
import { Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../common/SkeletonCard.jsx';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Reflection copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="
        p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
        hover:bg-slate-100 dark:hover:bg-slate-800
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
      "
      aria-label="Copy reflection"
      title="Copy reflection"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

function Item({ label, text, emoji }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {emoji} {label}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function TriggerBadge({ trigger, confidence }) {
  const pct = Math.round(confidence * 100);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
      <AlertTriangle size={10} aria-hidden="true" />
      {trigger}
      <span className="opacity-60 text-[10px]">{pct}%</span>
    </span>
  );
}

export function ReflectionPanel({ checkIn, isLoading }) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-brand-500 animate-pulse-slow" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Generating your reflection…
          </span>
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const { reflection, triggers, suggestions } = checkIn ?? {};
  if (!reflection && !suggestions) return null;

  const fullText = reflection
    ? [
        reflection.summary,
        reflection.encouragement,
        reflection.focusSuggestion,
        reflection.selfCareSuggestion,
        reflection.positiveReminder,
      ].filter(Boolean).join('\n\n')
    : '';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* AI Reflection */}
      {reflection && (
        <div className="rounded-2xl border border-brand-200 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                AI Reflection
              </span>
            </div>
            <CopyButton text={fullText} />
          </div>
          <div className="space-y-3.5">
            {reflection.summary && (
              <Item label="Summary" emoji="💭" text={reflection.summary} />
            )}
            {reflection.encouragement && (
              <Item label="Encouragement" emoji="💛" text={reflection.encouragement} />
            )}
            {reflection.focusSuggestion && (
              <Item label="Focus tip" emoji="🎯" text={reflection.focusSuggestion} />
            )}
            {reflection.selfCareSuggestion && (
              <Item label="Self-care" emoji="🌿" text={reflection.selfCareSuggestion} />
            )}
            {reflection.positiveReminder && (
              <Item label="Remember" emoji="✨" text={reflection.positiveReminder} />
            )}
          </div>
        </div>
      )}

      {/* Stress triggers */}
      {triggers && triggers.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
            Possible stress patterns
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Based on your recent patterns, these factors may be contributing to your stress. These are observations, not diagnoses.
          </p>
          <div className="flex flex-wrap gap-2">
            {triggers.map(t => (
              <TriggerBadge key={t.trigger} trigger={t.trigger} confidence={t.confidence} />
            ))}
          </div>
        </div>
      )}

      {/* Wellness suggestions */}
      {suggestions && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Wellness suggestions
          </p>
          <div className="space-y-3">
            {suggestions.breakSuggestion && (
              <Item label="Take a break" emoji="🛑" text={suggestions.breakSuggestion} />
            )}
            {suggestions.hydrationReminder && (
              <Item label="Hydration" emoji="💧" text={suggestions.hydrationReminder} />
            )}
            {suggestions.tomorrowGoal && (
              <Item label="Tomorrow's mini goal" emoji="🎯" text={suggestions.tomorrowGoal} />
            )}
            {suggestions.quote && (
              <blockquote className="mt-4 pl-3 border-l-2 border-brand-300 dark:border-brand-700">
                <p className="text-sm italic text-slate-600 dark:text-slate-400">
                  "{suggestions.quote}"
                </p>
              </blockquote>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
