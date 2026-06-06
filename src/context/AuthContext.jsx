/**
 * context/AuthContext.jsx
 *
 * Global authentication state managed via Context API + useReducer.
 *
 * Why useReducer instead of useState?
 *  - Auth has multiple related pieces of state (user, token, loading, error).
 *  - useReducer keeps all state transitions in one predictable place.
 *  - Makes it easy to add new auth actions (e.g., UPDATE_PROFILE) later.
 *
 * Exposed via the useAuth() custom hook (src/hooks/useAuth.js).
 */
import { createContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import { STORAGE_KEYS, TOAST_MESSAGES } from '@/constants';

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user:            null,    // Authenticated user object or null
  token:           null,    // JWT string or null
  isLoading:       true,    // True during initial auth check on app load
  isAuthenticated: false,   // Derived convenience flag
  error:           null,    // Last auth error message or null
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading:       false,
        isAuthenticated: true,
        user:            action.payload.user,
        token:           action.payload.token,
        error:           null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading:       false,
        isAuthenticated: false,
        user:            null,
        token:           null,
        error:           action.payload,
      };

    case 'LOGOUT':
      return { ...initialState, isLoading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * On mount: check if a valid token exists in localStorage and rehydrate
   * the user state. Keeps the user logged in across page refreshes.
   */
  useEffect(() => {
    const rehydrateAuth = async () => {
      dispatch({ type: 'AUTH_INIT_START' });
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
        return;
      }

      try {
        // Verify the token is still valid by fetching the current user.
        const user = await authService.getMe();
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch {
        // Token is expired or invalid — clear storage silently.
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    rehydrateAuth();
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_INIT_START' });
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || TOAST_MESSAGES.LOGIN_ERROR;
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_INIT_START' });
    try {
      await authService.register(userData);
      dispatch({ type: 'AUTH_FAILURE', payload: null }); // Not auto-logged-in after register
      toast.success(TOAST_MESSAGES.REGISTER_SUCCESS);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || TOAST_MESSAGES.GENERIC_ERROR;
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Backend logout failure is non-fatal; always clear local state.
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      dispatch({ type: 'LOGOUT' });
      toast.success(TOAST_MESSAGES.LOGOUT_SUCCESS);
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ─── Context Value ──────────────────────────────────────────────────────────
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
