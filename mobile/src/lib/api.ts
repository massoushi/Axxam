import Constants from "expo-constants";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  code?: string;
};

type ApiError = {
  status: number;
  code?: string;
  message: string;
};

function getApiUrl() {
  const api =
    (Constants.expoConfig as any)?.extra?.API_URL ||
    (Constants.expoConfig as any)?.extra?.APIUrl ||
    "";
  return String(api).replace(/\/$/, "");
}

const API_URL = getApiUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw { status: res.status, message: `Erreur serveur (${res.status})` } as ApiError;
  }

  if (!res.ok || !json.success) {
    throw {
      status: res.status,
      code: (json as any).code,
      message: json.message || `Erreur API (${res.status})`,
    } as ApiError;
  }

  return json.data;
}

export type AuthUser = {
  id: string;
  role: "client" | "owner" | "agency" | "admin";
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  avatar: string | null;
  agencyName: string;
  managerName: string;
  rcNumber: string;
  nif: string;
  address: string;
  logo: string | null;
  status: "active" | "pending" | "suspended";
  displayName: string;
  createdAt: string;
  emailVerified?: boolean;
};

export type LoginResult = { user: AuthUser; token: string };

export async function loginRequest(email: string, password: string) {
  return request<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export type RegisterPayload = {
  role: "client";
  email: string;
  password: string;
  phone: string;
  address: string;
  firstName: string;
  lastName: string;
};

export type RegisterResult = {
  user: AuthUser;
  requiresVerification: boolean;
  emailSent?: boolean;
};

export async function registerRequest(payload: RegisterPayload) {
  return request<RegisterResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmailRequest(email: string, code: string) {
  return request<{ user: AuthUser; token: string } | { user: AuthUser }>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }
  );
}

export async function resendVerificationRequest(email: string) {
  return request<{ emailSent?: boolean; alreadyVerified?: boolean }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

