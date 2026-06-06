import { useState } from 'react';
import { History, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';
import InputForm from '@/components/InputForm';
import MealCard from '@/components/MealCard';
import GroceryList from '@/components/GroceryList';
import BudgetSummary from '@/components/BudgetSummary';
import SubstitutionList from '@/components/SubstitutionList';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { useMealPlanner } from '@/hooks/useMealPlanner';

export default function Home() {
  const { plan, isLoading, error, history, generate, regenerate, loadFromHistory, clearPlan } =
    useMealPlanner();

  const [historyOpen, setHistoryOpen] = useState(false);

  const showResults = !isLoading && !error && plan;
  const showError = !isLoading && error;

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <header className="text-center py-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Smart Meal Planner
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Enter your preferences and get a personalised breakfast, lunch, and dinner plan with a
          full grocery list — in seconds.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20 space-y-10">
        {/* Input Form */}
        <InputForm onSubmit={generate} isLoading={isLoading} />

        {/* Loading skeleton */}
        {isLoading && <LoadingState />}

        {/* Error state */}
        {showError && <ErrorState message={error} onRetry={regenerate} />}

        {/* Results */}
        {showResults && (
          <div className="space-y-8 animate-fade-in">
            {/* Regenerate + Clear controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Meal Plan</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={regenerate}
                  className={
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ' +
                    'bg-brand-600 hover:bg-brand-700 text-white ' +
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
                    'transition-all active:scale-[0.97]'
                  }
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={clearPlan}
                  aria-label="Close plan"
                  className={
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold ' +
                    'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 ' +
                    'hover:bg-gray-50 dark:hover:bg-gray-700 ' +
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
                    'transition-all active:scale-[0.97]'
                  }
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Meal cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MealCard mealType="breakfast" meal={plan.breakfast} />
              <MealCard mealType="lunch" meal={plan.lunch} />
              <MealCard mealType="dinner" meal={plan.dinner} />
            </div>

            {/* Grocery + Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GroceryList items={plan.groceryList} />
              <BudgetSummary
                budgetAnalysis={plan.budgetAnalysis}
                userBudget={
                  plan.budgetAnalysis.totalEstimatedCost + plan.budgetAnalysis.remainingBudget
                }
              />
            </div>

            {/* Substitutions */}
            <SubstitutionList substitutions={plan.substitutions} />
          </div>
        )}

        {/* History section */}
        {history.length > 0 && (
          <section aria-label="Past plans" className="pt-4">
            <button
              type="button"
              onClick={() => setHistoryOpen(o => !o)}
              aria-expanded={historyOpen}
              className={
                'flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 ' +
                'hover:text-gray-900 dark:hover:text-gray-200 transition-colors'
              }
            >
              <History size={16} />
              Past Plans ({history.length})
              {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {historyOpen && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {history.map(entry => (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    onLoad={() => {
                      loadFromHistory(entry);
                      setHistoryOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function HistoryCard({ entry, onLoad }) {
  const date = new Date(entry.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow px-5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {entry.plan.breakfast.dish} · {entry.plan.lunch.dish} · {entry.plan.dinner.dish}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {date} · {entry.input.dietType} · {entry.input.cuisinePreference} cuisine
        </p>
      </div>
      <button
        type="button"
        onClick={onLoad}
        className={
          'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg ' +
          'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ' +
          'hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors'
        }
      >
        Load
      </button>
    </div>
  );
}
