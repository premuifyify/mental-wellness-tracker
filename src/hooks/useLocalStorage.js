import { useState, useCallback } from 'react';

/**
 * Persists state to localStorage and keeps React state in sync.
 *
 * CRITICAL DESIGN NOTE — stale closure fix:
 * The original implementation had `[key, storedValue]` as deps for setValue,
 * which caused a race condition on Vercel: processCheckIn would save the
 * check-in, navigate away, then await the Gemini API. By the time Gemini
 * responded, React had re-rendered with a new setValue that captured the
 * updated storedValue — but the async closure still held the OLD setValue.
 * Calling setCheckIns(updated) with the old reference would overwrite the
 * freshly saved check-in, making it disappear from the UI.
 *
 * Fix: setValue now has stable deps = [key] only. The functional form of
 * setStoredValue guarantees `prev` is always the latest committed state,
 * eliminating the race regardless of how long async callers take.
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - returned when key has no stored value
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Use stored value if present; fall back to initialValue.
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      // JSON.parse can throw on corrupted data; initialValue is safe fallback.
      return initialValue;
    }
  });

  // setValue is stable (deps = [key] only) so async callers never hold a stale
  // reference. The functional form of setStoredValue guarantees `prev` is always
  // the latest committed state — eliminating the race between processCheckIn's
  // initial save and the subsequent AI-data update.
  const setValue = useCallback(
    (value) => {
      setStoredValue(prev => {
        // Support functional updates: setValue(prev => [...prev, newItem])
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Quota exceeded or private browsing — fail silently; in-memory
          // state still updates correctly so the UI doesn't break.
        }
        return next;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(() => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // No-op
      }
      // Return initialValue to reset in-memory state alongside storage.
      return initialValue; // eslint-disable-line react-hooks/exhaustive-deps
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return [storedValue, setValue, removeValue];
}
