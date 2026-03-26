import { AuthUser, AuthTokens } from "@/types/auth";

const TOKEN_KEY = "bdr_access_token";
const REFRESH_TOKEN_KEY = "bdr_refresh_token";
const USER_KEY = "bdr_user";

export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, tokens.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  // Salva em cookie para o middleware Next.js conseguir ler no servidor
  document.cookie = `bdr_access_token=${tokens.token}; path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Remove o cookie de autenticação
  document.cookie = "bdr_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
