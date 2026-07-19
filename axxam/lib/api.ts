import type { AgencyProperty, PropertyStatus } from "@/types/agency";
import type { AuthUser, RegisterPayload, UpdateProfilePayload } from "@/types/auth";
import type { Booking, BookingStatus, CreateBookingPayload } from "@/types/booking";
import { getToken } from "@/lib/auth-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://axxam-dz-klai.onrender.com/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? getToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  let json: ApiResponse<T> & { message?: string };
  try {
    json = (await res.json()) as ApiResponse<T> & { message?: string };
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Erreur API (${res.status})`);
  }

  return json;
}

export async function loginRequest(email: string, password: string) {
  return request<{ user: AuthUser; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(payload: RegisterPayload) {
  return request<{ user: AuthUser; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  return request<{ user: AuthUser }>("/auth/me");
}

export async function updateProfileRequest(payload: UpdateProfilePayload) {
  return request<{ user: AuthUser }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchUsers(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<AuthUser[]>(`/auth/users${query ? `?${query}` : ""}`);
}

export async function updateUserStatus(id: string, status: "active" | "pending" | "suspended") {
  return request<AuthUser>(`/auth/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchProperties(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<AgencyProperty[]>(`/properties${query ? `?${query}` : ""}`);
}

export async function fetchAgencyProperties(agencyId = "agence-demo") {
  return fetchProperties({ agencyId });
}

export async function fetchActiveProperties() {
  return fetchProperties({ status: "active" });
}

export async function fetchPendingProperties() {
  return fetchProperties({ status: "pending" });
}

export async function fetchPropertyById(id: string) {
  return request<AgencyProperty>(`/properties/${id}`);
}

export async function publishProperty(payload: import("@/types/agency").PublishPropertyPayload) {
  return request<AgencyProperty>("/properties", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  return request<AgencyProperty>(`/properties/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updatePropertyAvailability(id: string, unavailableDates: string[]) {
  return request<AgencyProperty>(`/properties/${id}/availability`, {
    method: "PUT",
    body: JSON.stringify({ unavailableDates }),
  });
}

export async function deleteProperty(id: string) {
  return request<AgencyProperty>(`/properties/${id}`, {
    method: "DELETE",
  });
}

export async function createBooking(payload: CreateBookingPayload) {
  return request<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMyBookings() {
  return request<Booking[]>("/bookings/mine");
}

export async function fetchHostBookings() {
  return request<Booking[]>("/bookings/host");
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  return request<Booking>(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchFavorites() {
  return request<import("@/types/agency").AgencyProperty[]>("/favorites");
}

export async function fetchFavoriteIds() {
  return request<string[]>("/favorites/ids");
}

export async function addFavorite(propertyId: string) {
  return request<{ propertyId: string }>("/favorites", {
    method: "POST",
    body: JSON.stringify({ propertyId }),
  });
}

export async function removeFavorite(propertyId: string) {
  return request<{ propertyId: string }>(`/favorites/${encodeURIComponent(propertyId)}`, {
    method: "DELETE",
  });
}
