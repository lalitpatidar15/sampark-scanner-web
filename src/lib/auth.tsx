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
import { api } from "./api";

/**
 * Owner session handling for the scanner web app.
 *
 * The scanner web is public for scanning tags, but owner features (eTag
 * customisation, location approval, tag management) require authentication.
 * The access token is held in memory and mirrored into sessionStorage so a
 * page refresh does not force a re-login.
 *
 * Known limitation: because the API issues bearer tokens rather than setting
 * an httpOnly cookie, this token is reachable by JavaScript and a successful
 * XSS would be able to exfiltrate a staff session. Before production, move
 * staff auth to an httpOnly, SameSite=Strict cookie set by this app as a BFF
 * and add CSRF protection.
 */
const STORAGE_KEY = "sampark.scanner.session";

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
  user: SessionUser;
  permissions: string[];
}

interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  ready: boolean;
}

interface AuthContextValue extends AuthState {
  requestOtp: (phone: string) => Promise<{ devCode?: string; resendAfterSeconds: number }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
}

interface SessionUser {
  publicId: string;
  role: string;
  status: string;
  name: string | null;
  phone: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyState: AuthState = { user: null, accessToken: null, ready: false };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setState({ ...emptyState, ready: true });
      return;
    }
    try {
      const saved = JSON.parse(raw) as { session: Session };
      setState({
        user: saved.session.user,
        accessToken: saved.session.accessToken,
        ready: true,
      });
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
      setState({ ...emptyState, ready: true });
    }
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    setError(null);
    const result = await api.post<{ devCode?: string; resendAfterSeconds: number }>(
      "/auth/otp/request",
      { phone, purpose: "LOGIN" },
    );
    return result.data;
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    setError(null);
    try {
      const result = await api.post<Session>("/auth/login", { phone, code });
      const session = result.data;

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ session }));
      setState({
        user: session.user,
        accessToken: session.accessToken,
        ready: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setState({ ...emptyState, ready: true });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      requestOtp,
      verifyOtp,
      logout,
      isAuthenticated: !!state.accessToken,
      error,
    }),
    [state, requestOtp, verifyOtp, logout, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useScannerAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useScannerAuth must be used inside an AuthProvider");
  return context;
}
