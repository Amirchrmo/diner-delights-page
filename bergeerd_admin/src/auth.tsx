import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearToken, getToken, login as apiLogin, setToken } from "./api";

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERNAME_KEY = "bergeerd_admin_username";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(getToken());
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem(USERNAME_KEY),
  );

  // Sync token state if it changes in another tab.
  useEffect(() => {
    const handler = () => setTok(getToken());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback(async (user: string, pass: string) => {
    const res = await apiLogin(user, pass);
    setToken(res.token);
    setTok(res.token);
    localStorage.setItem(USERNAME_KEY, res.admin.username);
    setUsername(res.admin.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTok(null);
    localStorage.removeItem(USERNAME_KEY);
    setUsername(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: !!token, username, login, logout }),
    [token, username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
