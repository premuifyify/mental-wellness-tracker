import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { useLocalStorage }      from '../hooks/useLocalStorage.js';
import { useStreak }            from '../hooks/useStreak.js';
import { evaluateAchievements, getAchievementDef } from '../utils/achievements.js';
import { calculateBurnoutScore } from '../utils/burnoutCalculator.js';
import { getWellnessCompanion }  from '../services/aiService.js';
import { STORAGE_KEYS, VIEWS }  from '../constants/index.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [checkIns, setCheckIns]       = useLocalStorage(STORAGE_KEYS.CHECK_INS, []);
  const [earned, setEarned]           = useLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, []);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [aiLoadingId, setAiLoadingId] = useState(null);

  const streak = useStreak(checkIns);

  const todaysCheckIn = useMemo(() => {
    const today = new Date().toDateString();
    return checkIns.find(ci => new Date(ci.date).toDateString() === today) ?? null;
  }, [checkIns]);

  const last7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86_400_000;
    return [...checkIns]
      .filter(ci => new Date(ci.date).getTime() >= cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [checkIns]);

  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 86_400_000;
    return [...checkIns]
      .filter(ci => new Date(ci.date).getTime() >= cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [checkIns]);

  const updateCheckIn = useCallback(
    (id, partial) => {
      setCheckIns(prev => prev.map(ci => (ci.id === id ? { ...ci, ...partial } : ci)));
    },
    [setCheckIns],
  );

  /**
   * Saves a new check-in, runs achievement logic, then fetches AI analysis
   * in the background. Navigates to dashboard immediately after save.
   */
  const processCheckIn = useCallback(
    async (formData) => {
      const burnout = calculateBurnoutScore(formData);
      const id      = crypto.randomUUID();
      const today   = new Date().toDateString();

      const existing = checkIns.find(
        ci => new Date(ci.date).toDateString() === today,
      );

      const checkIn = {
        id: existing?.id ?? id,
        date: existing?.date ?? new Date().toISOString(),
        ...formData,
        burnout,
      };

      const updated = existing
        ? checkIns.map(ci => (new Date(ci.date).toDateString() === today ? checkIn : ci))
        : [checkIn, ...checkIns];

      setCheckIns(updated);

      // Evaluate achievements after save
      const newlyEarned = evaluateAchievements({
        checkIns: updated,
        streak:   streak.current + (existing ? 0 : 1),
        earned,
      });
      if (newlyEarned.length > 0) {
        setEarned(prev => [...prev, ...newlyEarned]);
        newlyEarned.forEach(aId => {
          const def = getAchievementDef(aId);
          if (def) {
            setTimeout(() => {
              toast.success(`${def.emoji} ${def.label} unlocked!`, {
                duration: 4500,
                style: { fontWeight: 600 },
              });
            }, 800);
          }
        });
      }

      // Navigate immediately; AI loads in background
      setCurrentView(VIEWS.DASHBOARD);
      setAiLoadingId(checkIn.id);

      try {
        const aiData = await getWellnessCompanion({ ...checkIn, burnout });
        setCheckIns(prev =>
          prev.map(ci =>
            ci.id === checkIn.id
              ? { ...ci, reflection: aiData.reflection, triggers: aiData.triggers, suggestions: aiData.suggestions }
              : ci,
          ),
        );
      } catch {
        toast.error('Could not load your reflection. Please check your connection.', {
          duration: 5000,
        });
      } finally {
        setAiLoadingId(null);
      }
    },
    [checkIns, earned, streak, setCheckIns, setEarned],
  );

  return (
    <AppContext.Provider
      value={{
        checkIns,
        todaysCheckIn,
        currentView,
        setCurrentView,
        streak,
        earned,
        processCheckIn,
        updateCheckIn,
        aiLoadingId,
        last7,
        last30,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
