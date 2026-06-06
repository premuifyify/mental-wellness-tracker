import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { budgetUsagePercent } from '@/utils/budgetCalculator';

/**
 * @param {{
 *   budgetAnalysis: {
 *     totalEstimatedCost: number,
 *     withinBudget: boolean,
 *     remainingBudget: number,
 *     overagePercent: number
 *   },
 *   userBudget: number
 * }} props
 */
export default function BudgetSummary({ budgetAnalysis, userBudget }) {
  const { totalEstimatedCost, withinBudget, remainingBudget, overagePercent } = budgetAnalysis;
  const usagePercent = budgetUsagePercent(totalEstimatedCost, userBudget);

  return (
    <section
      aria-label="Budget summary"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slide-up"
    >
      <div className="flex items-center gap-2 mb-5">
        <DollarSign size={18} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Budget Analysis</h2>
      </div>

      {/* Status badge */}
      <div
        className={
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-5 ' +
          (withinBudget
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300')
        }
        role="status"
      >
        {withinBudget ? (
          <>
            <TrendingDown size={14} /> Within budget
          </>
        ) : (
          <>
            <TrendingUp size={14} /> Over budget by {overagePercent}%
          </>
        )}
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat label="Total cost" value={`$${totalEstimatedCost.toFixed(2)}`} />
        <Stat label="Your budget" value={`$${Number(userBudget).toFixed(2)}`} />
        <Stat
          label={withinBudget ? 'Remaining' : 'Over by'}
          value={`$${Math.abs(remainingBudget).toFixed(2)}`}
          highlight={withinBudget ? 'green' : 'red'}
        />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Budget used</span>
          <span>{usagePercent}%</span>
        </div>
        <div
          className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={usagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={
              'h-full rounded-full transition-all duration-500 ' +
              (withinBudget ? 'bg-green-500' : 'bg-red-500')
            }
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Over-budget tip */}
      {!withinBudget && (
        <p className="mt-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          💡 Try increasing your budget, reducing servings, or asking for cheaper substitutions by
          regenerating the plan.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, highlight }) {
  const textColor =
    highlight === 'green'
      ? 'text-green-600 dark:text-green-400'
      : highlight === 'red'
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-900 dark:text-gray-100';

  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
