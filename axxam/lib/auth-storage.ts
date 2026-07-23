import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "axxam_token";
const USER_KEY = "axxam_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("axxam-auth"));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("axxam-auth"));
}

export function dashboardPathForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "agency":
      return "/agence";
    case "owner":
      return "/proprietaire";
    case "client":
      return "/compte/reservations";
    default:
      return "/";
  }
}
