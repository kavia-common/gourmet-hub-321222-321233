import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const LS_KEY = "zwiggy_auth";

/**
 * PUBLIC_INTERFACE
 * AuthProvider provides auth state (user/token) and helpers to login/logout.
 */
export function AuthProvider({ api, children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // {id,name,email,role}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setToken(parsed.token || null);
        setUser(parsed.user || null);
      }
    } catch (e) {
      // ignore corrupted local storage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    const data = JSON.stringify({ token, user });
    localStorage.setItem(LS_KEY, data);
  }, [token, user, loading]);

  const value = useMemo(() => {
    return {
      token,
      user,
      loading,
      isAuthed: Boolean(token && user),
      // PUBLIC_INTERFACE
      async login({ email, password, role }) {
        const res = await api.login({ email, password, role });
        setToken(res.token);
        setUser(res.user);
        return res.user;
      },
      // PUBLIC_INTERFACE
      async register({ name, email, password, role }) {
        const res = await api.register({ name, email, password, role });
        setToken(res.token);
        setUser(res.user);
        return res.user;
      },
      // PUBLIC_INTERFACE
      logout() {
        setToken(null);
        setUser(null);
      }
    };
  }, [token, user, loading, api]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access auth state.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
