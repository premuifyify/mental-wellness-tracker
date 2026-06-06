import { useState } from 'react';
import { ShoppingCart, Copy, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatGroceryListAsText } from '@/utils/ingredientUtils';
import { TOAST_MESSAGES } from '@/constants';

/**
 * @param {{ items: string[] }} props
 */
export default function GroceryList({ items }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatGroceryListAsText(items));
      setCopied(true);
      toast.success(TOAST_MESSAGES.COPY_SUCCESS);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard access denied. Please copy manually.');
    }
  }

  function handleExport() {
    const text = formatGroceryListAsText(items);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `grocery-list-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(TOAST_MESSAGES.EXPORT_SUCCESS);
  }

  return (
    <section
      aria-label="Grocery list"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slide-up"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Grocery List</h2>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {items.length} items
          </span>
        </div>

        <div className="flex gap-2">
          <ActionButton
            onClick={handleCopy}
            icon={copied ? <Check size={14} /> : <Copy size={14} />}
            label={copied ? 'Copied!' : 'Copy'}
            active={copied}
          />
          <ActionButton
            onClick={handleExport}
            icon={<Download size={14} />}
            label="Export"
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2"
          >
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionButton({ onClick, icon, label, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ' +
        'border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
        (active
          ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/30 dark:border-brand-600 dark:text-brand-300'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600')
      }
    >
      {icon}
      {label}
    </button>
  );
}
