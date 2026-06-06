import { EMOTIONS } from '../../constants/index.js';

const BORDER_COLOR = {
  blue:   'border-blue-400   bg-blue-50   dark:bg-blue-900/20',
  yellow: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  green:  'border-green-400  bg-green-50  dark:bg-green-900/20',
  orange: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
  red:    'border-red-400    bg-red-50    dark:bg-red-900/20',
  purple: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  rose:   'border-rose-400   bg-rose-50   dark:bg-rose-900/20',
};

export function EmotionPicker({ value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        How do you feel right now?
      </legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Current emotion">
        {EMOTIONS.map(({ id, label, emoji, color }) => {
          const selected = value === id;
          return (
            <label
              key={id}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer
                transition-all duration-150
                ${selected
                  ? `${BORDER_COLOR[color] ?? ''} border-2 scale-105 shadow-sm`
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                }
                focus-within:ring-2 focus-within:ring-brand-500
              `}
              title={label}
            >
              <input
                type="radio"
                name="emotion"
                value={id}
                checked={selected}
                onChange={() => onChange(id)}
                className="sr-only"
                aria-label={label}
              />
              <span className="text-xl leading-none select-none" aria-hidden="true">{emoji}</span>
              <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">
                {label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
