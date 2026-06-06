import { describe, it, expect } from 'vitest';
import { calculateBudget, budgetUsagePercent } from '../src/utils/budgetCalculator.js';

// ─── calculateBudget ──────────────────────────────────────────────────────────

describe('calculateBudget', () => {
  const meals = {
    breakfast: { estimatedCost: 5.5  },
    lunch:     { estimatedCost: 10.0 },
    dinner:    { estimatedCost: 14.5 },
  };

  it('sums all three meal costs correctly', () => {
    const { totalEstimatedCost } = calculateBudget(meals, 50);
    expect(totalEstimatedCost).toBe(30);
  });

  it('reports withinBudget true when total equals budget (boundary)', () => {
    const { withinBudget } = calculateBudget(meals, 30);
    expect(withinBudget).toBe(true);
  });

  it('reports withinBudget true when total is under budget', () => {
    const { withinBudget, remainingBudget } = calculateBudget(meals, 50);
    expect(withinBudget).toBe(true);
    expect(remainingBudget).toBe(20);
  });

  it('reports withinBudget false when total exceeds budget', () => {
    const { withinBudget, remainingBudget } = calculateBudget(meals, 20);
    expect(withinBudget).toBe(false);
    expect(remainingBudget).toBe(-10);
  });

  it('calculates overagePercent correctly when over budget', () => {
    const { overagePercent } = calculateBudget(meals, 20);
    // Spent 30, budget 20 → 50% over
    expect(overagePercent).toBe(50);
  });

  it('sets overagePercent to 0 when within budget', () => {
    const { overagePercent } = calculateBudget(meals, 40);
    expect(overagePercent).toBe(0);
  });

  it('handles zero-cost meals without throwing', () => {
    const zeroCost = {
      breakfast: { estimatedCost: 0 },
      lunch:     { estimatedCost: 0 },
      dinner:    { estimatedCost: 0 },
    };
    const { totalEstimatedCost, withinBudget } = calculateBudget(zeroCost, 50);
    expect(totalEstimatedCost).toBe(0);
    expect(withinBudget).toBe(true);
  });

  it('handles missing estimatedCost fields as 0', () => {
    const incomplete = { breakfast: {}, lunch: {}, dinner: {} };
    const { totalEstimatedCost } = calculateBudget(incomplete, 50);
    expect(totalEstimatedCost).toBe(0);
  });

  it('rounds to 2 decimal places (floating-point safety)', () => {
    const floatMeals = {
      breakfast: { estimatedCost: 1.1  },
      lunch:     { estimatedCost: 2.2  },
      dinner:    { estimatedCost: 3.3  },
    };
    // 1.1 + 2.2 + 3.3 in JS floating point ≠ exactly 6.6 without rounding
    const { totalEstimatedCost } = calculateBudget(floatMeals, 10);
    expect(totalEstimatedCost).toBe(6.6);
  });

  it('throws on invalid meals argument', () => {
    expect(() => calculateBudget(null, 50)).toThrow();
  });

  it('throws on invalid budget argument', () => {
    expect(() => calculateBudget(meals, 'not-a-number')).toThrow();
  });

  it('throws on negative budget', () => {
    expect(() => calculateBudget(meals, -10)).toThrow();
  });
});

// ─── budgetUsagePercent ───────────────────────────────────────────────────────

describe('budgetUsagePercent', () => {
  it('returns 50 when spent is half the budget', () => {
    expect(budgetUsagePercent(25, 50)).toBe(50);
  });

  it('returns 100 when spent equals budget', () => {
    expect(budgetUsagePercent(50, 50)).toBe(100);
  });

  it('caps at 100 when over budget', () => {
    expect(budgetUsagePercent(100, 50)).toBe(100);
  });

  it('returns 100 when budget is 0 (guard against division by zero)', () => {
    expect(budgetUsagePercent(10, 0)).toBe(100);
  });

  it('returns 0 when nothing is spent', () => {
    expect(budgetUsagePercent(0, 50)).toBe(0);
  });
});
