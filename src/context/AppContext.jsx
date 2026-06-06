// AppContext is the single source of truth for all app state.
// All data lives in localStorage (no backend database) via useLocalStorage.
//
// Key design decision — async orchestration in processCheckIn:
//   1. Save check-in to localStorage immediately (instant UI feedback)
//   2. Navigate to Dashboard straight away (user sees their data)
//   3. Fetch AI reflection in the background (non-blocking)
//   4. Patch the saved check-in with AI data when it arrives
//
// This means the Dashboard renders twice: once with deterministic data
// (burnout score, stats) and again when the AI response merges in.
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
  // All persistent state lives here — localStorage is the only "database".
  const [checkIns, setCheckIns]       = useLocalStorage(STORAGE_KEYS.CHECK_INS, []);
  const [earned, setEarned]           = useLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, []);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  // aiLoadingId tracks which check-in is currently awaiting an AI response
  // so the Dashboard can show a skeleton only for that specific card.
  const [aiLoadingId, setAiLoadingId] = useState(null);

  const streak = useStreak(checkIns);

  // todaysCheckIn — the check-in whose calendar date matches today.
  // Used by Dashboard to decide what to render and by CheckIn to pre-fill
  // the form when the user wants to update an existing entry.
  const todaysCheckIn = useMemo(() => {
    const today = new Date().toDateString();
    return checkIns.find(ci => new Date(ci.date).toDateString() === today) ?? null;
  }, [checkIns]);

  // last7 / last30 — pre-filtered slices for the Timeline charts.
  // Sorted ascending so chart data renders left-to-right oldest-to-newest.
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

  // updateCheckIn is a targeted patch used by the AI callback to merge
  // reflection/triggers/suggestions without replacing the whole check-in.
  const updateCheckIn = useCallback(
    (id, partial) => {
      setCheckIns(prev => prev.map(ci => (ci.id === id ? { ...ci, ...partial } : ci)));
    },
    [setCheckIns],
  );

  /**
   * Core business logic: validates, saves, awards achievements, triggers AI.
   *
   * @param {Object} formData - all fields from the CheckIn form, including
   *                            optional `checkInDate` (YYYY-MM-DD) for back-filling.
   */
  const processCheckIn = useCallback(
    async (formData) => {
      // Strip checkInDate from the stored check-in shape — it's only a form
      // field used to derive the ISO date, not part of the data model.
      const { checkInDate, ...checkInData } = formData;
      const burnout  = calculateBurnoutScore(checkInData);
      const id       = crypto.randomUUID();

      // Use noon UTC so the date doesn't shift across midnight when converting
      // from ISO to toDateString() in different timezones.
      const dateISO  = checkInDate
        ? new Date(checkInDate + 'T12:00:00').toISOString()
        : new Date().toISOString();
      const dateKey  = new Date(dateISO).toDateString();

      // One check-in per calendar day — if one already exists for this date,
      // update it in place (preserving its id so the AI loading indicator
      // still references the correct entry).
      const existing = checkIns.find(
        ci => new Date(ci.date).toDateString() === dateKey,
      );

      const checkIn = {
        id:   existing?.id ?? id,
        date: existing?.date ?? dateISO,
        ...checkInData,
        burnout,
      };

      const updated = existing
        ? checkIns.map(ci => (new Date(ci.date).toDateString() === dateKey ? checkIn : ci))
        : [checkIn, ...checkIns];

      // Save synchronously — user sees their data instantly before any async work.
      setCheckIns(updated);

      // Award achievements based on the full updated history.
      // Streak is estimated here: +1 if this is a new day entry, unchanged if update.
      const newlyEarned = evaluateAchievements({
        checkIns: updated,
        streak:   streak.current + (existing ? 0 : 1),
        earned,
      });
      if (newlyEarned.length > 0) {
        setEarned(prev => [...prev, ...newlyEarned]);
        // Delay the toast slightly so it appears after the navigation animation.
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

      // Navigate to Dashboard now — the AI response will patch in later.
      setCurrentView(VIEWS.DASHBOARD);
      setAiLoadingId(checkIn.id);

      try {
        const aiData = await getWellnessCompanion({ ...checkIn, burnout });
        // Functional update via setCheckIns ensures `prev` is the latest array
        // even though this runs after an async gap — prevents the stale closure
        // bug that caused check-ins to disappear on Vercel (see useLocalStorage).
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
