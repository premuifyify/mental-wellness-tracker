/**
 * context/AppContext.jsx
 *
 * General application state that doesn't belong to auth:
 *  - Global loading overlay state (e.g., for full-page async operations)
 *  - Theme preference
 *  - Any hackathon-specific global state (cart, game state, etc.)
 *
 * Keep this context lean. If a feature grows complex, give it its own context.
 */
import { createContext, useState, useCallback, useContext } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  /**
   * showGlobalLoader / hideGlobalLoader — use for operations that should
   * block the entire UI (e.g., initial data fetch, form submission).
   */
  const showGlobalLoader = useCallback(() => setGlobalLoading(true), []);
  const hideGlobalLoader = useCallback(() => setGlobalLoading(false), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = {
    globalLoading,
    showGlobalLoader,
    hideGlobalLoader,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Convenience hook co-located with the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
