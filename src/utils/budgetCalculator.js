/**
 * Pure, deterministic budget calculations.
 * Never imports from AI services — this logic must be independently testable.
 */

/**
 * @param {{ breakfast: { estimatedCost: number }, lunch: { estimatedCost: number }, dinner: { estimatedCost: number } }} meals
 * @param {number} userBudget
 * @returns {{ totalEstimatedCost: number, withinBudget: boolean, remainingBudget: number, overagePercent: number }}
 */
export function calculateBudget(meals, userBudget) {
  if (!meals || typeof userBudget !== 'number' || userBudget < 0) {
    throw new Error('calculateBudget: invalid arguments');
  }

  const breakfastCost = Number(meals.breakfast?.estimatedCost) || 0;
  const lunchCost     = Number(meals.lunch?.estimatedCost)     || 0;
  const dinnerCost    = Number(meals.dinner?.estimatedCost)     || 0;

  const totalEstimatedCost = round2(breakfastCost + lunchCost + dinnerCost);
  const withinBudget       = totalEstimatedCost <= userBudget;
  const remainingBudget    = round2(userBudget - totalEstimatedCost);

  // How far over budget as a percentage (0 when within budget)
  const overagePercent =
    withinBudget ? 0 : round2(((totalEstimatedCost - userBudget) / userBudget) * 100);

  return { totalEstimatedCost, withinBudget, remainingBudget, overagePercent };
}

/**
 * Returns the percentage of the budget consumed, capped at 100 for display purposes.
 * @param {number} spent
 * @param {number} budget
 * @returns {number} 0–100
 */
export function budgetUsagePercent(spent, budget) {
  if (budget <= 0) return 100;
  return Math.min(100, round2((spent / budget) * 100));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
