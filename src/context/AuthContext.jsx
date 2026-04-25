import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, signInAnon, logAnalyticsEvent } from '../services/firebase/firebaseConfig';

const AuthContext = createContext();

/**
 * Hook to access the AuthContext.
 * @returns {{ currentUser: object|null, loading: boolean, loginWithGoogle: Function, logout: Function, isAnonymous: boolean }}
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * AuthProvider — wraps the app with Firebase Authentication state.
 * On mount, it auto-signs in anonymously so every session has an auth context.
 * Users can optionally upgrade to Google Sign-In.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto sign-in anonymously on first load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        // No user — sign in anonymously
        signInAnon().then(() => setLoading(false));
      }
    });
    return unsubscribe;
  }, []);

  /**
   * Sign in with Google popup.
   * Upgrades an anonymous session to a Google-authenticated session.
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      logAnalyticsEvent('login', { method: 'google' });
    } catch (error) {
      // User closed popup or provider not configured — silent fail
      console.warn('[Auth] Google sign-in failed:', error.code);
    }
  }, []);

  /**
   * Sign out the current user and re-sign-in anonymously.
   */
  const logout = useCallback(async () => {
    await signOut(auth);
    logAnalyticsEvent('logout');
  }, []);

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    logout,
    isAnonymous: currentUser?.isAnonymous ?? true,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
