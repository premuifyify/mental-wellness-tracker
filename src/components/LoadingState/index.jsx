function SkeletonBox({ className }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse-slow ${className}`}
    />
  );
}

function MealCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 animate-pulse-slow" />
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <SkeletonBox className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-3 w-16" />
            <SkeletonBox className="h-5 w-3/4" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-6 w-20 rounded-full" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <SkeletonBox className="h-3 w-20" />
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className={`h-3 ${i % 2 === 0 ? 'w-3/4' : 'w-full'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
      <SkeletonBox className="h-5 w-32" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonBox key={i} className={`h-3 ${i % 3 === 0 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

export default function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Generating your meal plan…"
      className="space-y-8 animate-fade-in"
    >
      {/* Central spinner + message */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Crafting your perfect meal plan…
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Claude is thinking. This usually takes 10–20 seconds.
          </p>
        </div>
      </div>

      {/* Skeleton: Meal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MealCardSkeleton />
        <MealCardSkeleton />
        <MealCardSkeleton />
      </div>

      {/* Skeleton: Grocery + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlockSkeleton />
        <BlockSkeleton />
      </div>

      {/* Skeleton: Substitutions */}
      <BlockSkeleton />
    </div>
  );
}
