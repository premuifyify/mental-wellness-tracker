import { Clock, DollarSign } from 'lucide-react';
import { MEAL_LABELS } from '@/constants';

const COLOR_MAP = {
  amber:   'bg-amber-400',
  emerald: 'bg-brand-500',
  indigo:  'bg-indigo-500',
};

const BADGE_MAP = {
  amber:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  emerald: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  indigo:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

/**
 * @param {{ mealType: 'breakfast' | 'lunch' | 'dinner', meal: object }} props
 */
export default function MealCard({ mealType, meal }) {
  const meta  = MEAL_LABELS[mealType];
  const color = COLOR_MAP[meta.color];
  const badge = BADGE_MAP[meta.color];

  return (
    <article
      aria-label={`${meta.label} card`}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col animate-slide-up"
    >
      {/* Colour accent bar */}
      <div className={`h-1.5 w-full ${color}`} aria-hidden="true" />

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {meta.emoji}
          </span>
          <div className="min-w-0">
            <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${badge}`}>
              {meta.label}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {meal.dish}
            </h3>
          </div>
        </div>

        {/* Chips: cook time + cost */}
        <div className="flex flex-wrap gap-2">
          <Chip icon={<Clock size={12} />} label={meal.cookTime} />
          <Chip
            icon={<DollarSign size={12} />}
            label={`$${Number(meal.estimatedCost).toFixed(2)}`}
          />
        </div>

        {/* Ingredients */}
        <div className="flex-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Ingredients
          </h4>
          <ul className="space-y-1">
            {meal.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
      {icon}
      {label}
    </span>
  );
}
