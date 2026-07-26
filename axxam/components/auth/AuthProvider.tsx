"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearSession, getStoredUser, getToken, setSession } from "@/lib/auth-storage";
import { fetchMe, loginRequest, registerRequest, updateProfileRequest } from "@/lib/api";
import type { AuthUser, RegisterPayload, UpdateProfilePayload } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{
    user: AuthUser;
    requiresVerification: boolean;
    emailSent?: boolean;
    devCode?: string;
  }>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
  applySession: (token: string, user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const res = await fetchMe();
      setSession(t, res.data.user);
      setUser(res.data.user);
      setToken(t);
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = getToken();
      if (!t) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetchMe();
        if (cancelled) return;
        setSession(t, res.data.user);
        setUser(res.data.user);
        setToken(t);
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const onAuth = () => {
      setToken(getToken());
      setUser(getStoredUser());
    };
    window.addEventListener("axxam-auth", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("axxam-auth", onAuth);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setSession(res.data.token, res.data.user);
    setUser(res.data.user);
    setToken(res.data.token);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await registerRequest(payload);
    const requiresVerification = Boolean(res.data.requiresVerification || !res.data.token);
    if (!requiresVerification && res.data.token) {
      setSession(res.data.token, res.data.user);
      setUser(res.data.user);
      setToken(res.data.token);
    }
    return {
      user: res.data.user,
      requiresVerification,
      emailSent: res.data.emailSent,
      devCode: res.data.devCode,
    };
  }, []);

  const applySession = useCallback((t: string, u: AuthUser) => {
    setSession(t, u);
    setUser(u);
    setToken(t);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const res = await updateProfileRequest(payload);
    const t = getToken();
    if (t) setSession(t, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      updateProfile,
      logout,
      refresh,
      applySession,
    }),
    [user, token, loading, login, register, updateProfile, logout, refresh, applySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
