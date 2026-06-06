import { useMemo } from 'react';

const ONE_DAY = 86_400_000; // milliseconds in 24 hours

function toDateString(dateStr) {
  return new Date(dateStr).toDateString();
}

// Returns the absolute number of calendar days between two date strings.
function daysBetween(a, b) {
  return Math.round((new Date(a) - new Date(b)) / ONE_DAY);
}

/**
 * Finds the longest run of consecutive calendar days in a sorted array.
 * Used for the "best streak" stat. Array must be sorted oldest-first.
 */
function longestRun(sortedUniqueDates) {
  if (sortedUniqueDates.length === 0) return 0;
  let best = 1;
  let run  = 1;
  for (let i = 1; i < sortedUniqueDates.length; i++) {
    // daysBetween returns negative when going forward in time (a is newer),
    // so we compare against === 1 to detect consecutive days going backward.
    if (daysBetween(sortedUniqueDates[i - 1], sortedUniqueDates[i]) === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

/**
 * Computes current and longest streaks from an array of check-ins.
 *
 * Rules:
 *  - A streak requires consecutive calendar days (not 24h windows).
 *  - Today counts as part of the active streak.
 *  - Yesterday also keeps a streak alive — so a user who checks in every day
 *    but hasn't yet checked in today still sees their streak intact.
 *  - Multiple check-ins on the same day count as one.
 *
 * @param {Array} checkIns - array of check-in objects with a `date` field
 * @returns {{ current: number, longest: number }}
 */
export function useStreak(checkIns) {
  return useMemo(() => {
    if (!checkIns || checkIns.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Deduplicate to one entry per calendar day, sorted newest-first so we
    // can walk backward from today to count the current streak.
    const uniqueDates = [
      ...new Set(checkIns.map(ci => toDateString(ci.date))),
    ].sort((a, b) => new Date(b) - new Date(a));

    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - ONE_DAY).toDateString();
    const newest    = uniqueDates[0];

    // If the most recent check-in is older than yesterday the streak is broken —
    // return 0 for current but still calculate the historical longest.
    if (newest !== today && newest !== yesterday) {
      return { current: 0, longest: longestRun(uniqueDates.reverse()) };
    }

    // Walk backward through uniqueDates counting consecutive days.
    // Break on the first gap > 1 day.
    let current = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (daysBetween(uniqueDates[i - 1], uniqueDates[i]) === 1) {
        current++;
      } else {
        break;
      }
    }

    return { current, longest: longestRun([...uniqueDates].reverse()) };
  }, [checkIns]);
}
