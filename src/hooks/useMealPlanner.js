import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateMealPlan } from '@/services/anthropicService';
import useLocalStorage from '@/hooks/useLocalStorage';
import { MEAL_HISTORY_LIMIT, TOAST_MESSAGES } from '@/constants';

/**
 * Central hook that owns all meal-planner state.
 * Components call generate() or regenerate(); all loading, error,
 * and history management lives here.
 */
export function useMealPlanner() {
  const [plan, setPlan]         = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [lastInput, setLastInput] = useState(null);

  const [history, setHistory] = useLocalStorage('meal-planner-history', []);

  const generate = useCallback(async userInput => {
    setLoading(true);
    setError(null);
    setLastInput(userInput);

    try {
      const result = await generateMealPlan(userInput);
      setPlan(result);

      const entry = {
        id:        Date.now(),
        timestamp: new Date().toISOString(),
        input:     userInput,
        plan:      result,
      };
      setHistory(prev => [entry, ...prev].slice(0, MEAL_HISTORY_LIMIT));
      toast.success(TOAST_MESSAGES.PLAN_SUCCESS);
    } catch (err) {
      const message = err.message || TOAST_MESSAGES.PLAN_ERROR;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [setHistory]);

  const regenerate = useCallback(() => {
    if (lastInput) generate(lastInput);
  }, [lastInput, generate]);

  const loadFromHistory = useCallback(entry => {
    setPlan(entry.plan);
    setLastInput(entry.input);
    setError(null);
  }, []);

  const clearPlan = useCallback(() => {
    setPlan(null);
    setError(null);
  }, []);

  return {
    plan,
    isLoading,
    error,
    history,
    generate,
    regenerate,
    loadFromHistory,
    clearPlan,
  };
}
