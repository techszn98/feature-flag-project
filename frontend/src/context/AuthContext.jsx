import { createContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.api.js";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  storeSession,
} from "../utils/storage.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  async function establishSession(tokens) {
    storeSession(tokens);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  async function signIn(credentials) {
    const tokens = await authApi.login(credentials);
    return establishSession(tokens);
  }

  async function signInWithGoogle(idToken) {
    const tokens = await authApi.loginWithGoogle(idToken);
    return establishSession(tokens);
  }

  async function signOut() {
    const refreshToken = getRefreshToken();
    clearSession();
    setUser(null);
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        clearSession();
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
