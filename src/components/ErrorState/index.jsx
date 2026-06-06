import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * @param {{ message: string, onRetry: () => void }} props
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-5 py-12 px-6 text-center animate-fade-in"
    >
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle size={32} className="text-red-500 dark:text-red-400" />
      </div>

      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm ' +
            'bg-brand-600 hover:bg-brand-700 text-white ' +
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ' +
            'transition-all active:scale-[0.97]'
          }
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
