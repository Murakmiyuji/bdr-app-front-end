"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  saveTokens,
  saveUser,
  clearAuth,
  getUser,
  isAuthenticated,
} from "@/lib/auth";
import { AuthUser, LoginParams, RegisterParams } from "@/types/auth";
import { AxiosError } from "axios";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<{ message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaura o usuário da sessão ao iniciar
  useEffect(() => {
    const stored = getUser();
    if (stored && isAuthenticated()) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async ({ email, password }: LoginParams) => {
      const response = await authApi.login(email, password);
      const data = response.data;

      // O backend envolve tudo em { success, data: { ... } } ou retorna direto
      const payload = data?.data ?? data;

      const authUser: AuthUser = {
        name: payload.name,
        email: payload.email,
        roles: payload.roles ?? ["AUDIENCE"],
      };

      saveTokens({ token: payload.token, refreshToken: payload.refreshToken });
      saveUser(authUser);
      setUser(authUser);

      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(async (params: RegisterParams) => {
    try {
      const response = await authApi.register(params);
      const data = response.data;
      const payload = data?.data ?? data;
      return {
        message:
          payload.message ||
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errors?: string[] }>;
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.errors?.join(", ") ||
        "Erro ao realizar cadastro.";
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignora erros de logout no servidor, limpa o estado local
    } finally {
      clearAuth();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
