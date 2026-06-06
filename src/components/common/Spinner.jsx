export function Spinner({ size = 'md', className = '' }) {
  const dim = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size] ?? 'w-8 h-8';
  const border = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' }[size] ?? 'border-[3px]';

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${dim} ${border} rounded-full
        border-brand-200 dark:border-brand-900
        border-t-brand-500 dark:border-t-brand-400
        animate-spin ${className}
      `}
    />
  );
}
