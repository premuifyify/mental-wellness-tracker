import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * @param {{ substitutions: Array<{ ingredient: string, alternatives: string[] }> }} props
 */
export default function SubstitutionList({ substitutions }) {
  if (!substitutions?.length) return null;

  return (
    <section
      aria-label="Ingredient substitutions"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slide-up"
    >
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={18} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Ingredient Substitutions
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Can&apos;t find an ingredient? Here are smart swaps that keep the dish on track.
      </p>

      <div className="space-y-2">
        {substitutions.map((sub, i) => (
          <SubstitutionItem key={i} ingredient={sub.ingredient} alternatives={sub.alternatives} />
        ))}
      </div>
    </section>
  );
}

function SubstitutionItem({ ingredient, alternatives }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={
          'w-full flex items-center justify-between px-4 py-3 text-sm font-medium ' +
          'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ' +
          'transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500'
        }
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
          {ingredient}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 pt-1 bg-gray-50 dark:bg-gray-700/30">
          <ul className="space-y-1.5">
            {alternatives.map((alt, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="text-brand-500 font-bold text-xs">→</span>
                {alt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
