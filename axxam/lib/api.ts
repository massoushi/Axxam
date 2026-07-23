import type { AgencyProperty, PropertyStatus } from "@/types/agency";
import type { AuthUser, RegisterPayload, UpdateProfilePayload } from "@/types/auth";
import type { Booking, BookingStatus, CreateBookingPayload } from "@/types/booking";
import { clearSession, getToken } from "@/lib/auth-storage";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development"
    ? "/api"
    : "https://axxam-dz-klai.onrender.com/api")
).replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_URL;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  summary?: unknown;
  data: T;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? getToken() : null;
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    const hint =
      API_URL.startsWith("http://localhost") || API_URL.startsWith("/api")
        ? "Démarrez le backend (cd Backend && npm run dev) puis rechargez."
        : "Vérifiez le déploiement Render ou votre connexion.";
    throw new Error(`Impossible de joindre l'API (${API_URL}). ${hint}`);
  }

  let json: ApiResponse<T> & { message?: string };
  try {
    json = (await res.json()) as ApiResponse<T> & { message?: string };
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }

  if (!res.ok || !json.success) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearSession();
    }
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

export async function markBookingPaymentOffline(
  id: string,
  paymentStatus: "paid" | "unpaid"
) {
  return request<Booking>(`/bookings/${encodeURIComponent(id)}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
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

/* —— Paiements & factures —— */
export async function simulatePayment(bookingId: string) {
  return request<{ booking: Booking; invoice: import("@/types/booking").Invoice }>(
    "/payments/simulate",
    { method: "POST", body: JSON.stringify({ bookingId }) }
  );
}

export async function fetchMyInvoices() {
  return request<import("@/types/booking").Invoice[]>("/payments/invoices/mine");
}

export async function fetchHostInvoices() {
  return request<import("@/types/booking").Invoice[]>("/payments/invoices/host");
}

export async function fetchInvoiceByBooking(bookingId: string) {
  return request<import("@/types/booking").Invoice>(
    `/payments/invoices/booking/${encodeURIComponent(bookingId)}`
  );
}

export async function fetchRevenue() {
  return request<{
    paidCount: number;
    gross: number;
    platformFees: number;
    net: number;
    collected: number;
    bookings: Booking[];
  }>("/payments/revenue");
}

/* —— Messages —— */
export async function fetchConversations() {
  return request<import("@/types/messaging").Conversation[]>("/messages");
}

export async function openConversation(payload: {
  propertyId?: string;
  hostId?: string;
  clientId?: string;
  bookingId?: string;
}) {
  return request<import("@/types/messaging").Conversation>("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMessages(conversationId: string) {
  return request<import("@/types/messaging").Message[]>(
    `/messages/${encodeURIComponent(conversationId)}/messages`
  );
}

export async function sendMessage(conversationId: string, body: string) {
  return request<import("@/types/messaging").Message>(
    `/messages/${encodeURIComponent(conversationId)}/messages`,
    { method: "POST", body: JSON.stringify({ body }) }
  );
}

/* —— Avis —— */
export async function fetchPropertyReviews(propertyId: string) {
  return request<import("@/types/messaging").Review[]>(
    `/reviews/property/${encodeURIComponent(propertyId)}`
  );
}

export async function fetchMyReviews() {
  return request<import("@/types/messaging").Review[]>("/reviews/mine");
}

export async function createReview(payload: {
  bookingId: string;
  rating: number;
  comment?: string;
}) {
  return request<import("@/types/messaging").Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* —— Notifications serveur —— */
export async function fetchNotifications() {
  return request<import("@/types/messaging").AppNotification[]>("/notifications");
}

export async function markNotificationRead(id: string) {
  return request<import("@/types/messaging").AppNotification>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" }
  );
}

export async function markAllNotificationsRead() {
  return request<null>("/notifications/read-all", { method: "PATCH" });
}

export async function broadcastNotification(payload: {
  title: string;
  body?: string;
  link?: string;
  role?: string;
  userId?: string;
}) {
  return request<import("@/types/messaging").AppNotification[]>("/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* —— Équipe agence —— */
export async function fetchAgencyMembers() {
  return request<import("@/types/agency-team").AgencyMember[]>("/agency/members");
}

export async function inviteAgencyMember(email: string, memberRole: "employee" | "manager") {
  return request<import("@/types/agency-team").AgencyMember>("/agency/members", {
    method: "POST",
    body: JSON.stringify({ email, memberRole }),
  });
}

export async function updateAgencyMemberStatus(
  id: string,
  status: "active" | "suspended" | "pending"
) {
  return request<import("@/types/agency-team").AgencyMember>(
    `/agency/members/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function fetchLinkedOwners() {
  return request<import("@/types/agency-team").LinkedOwner[]>("/agency/owners");
}

export async function linkOwner(email: string) {
  return request<import("@/types/agency-team").LinkedOwner>("/agency/owners", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function unlinkOwner(id: string) {
  return request<import("@/types/agency-team").LinkedOwner>(
    `/agency/owners/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function assignProperty(propertyId: string, assignedTo: string | null) {
  return request<import("@/types/agency").AgencyProperty>(
    `/properties/${encodeURIComponent(propertyId)}/assign`,
    { method: "PATCH", body: JSON.stringify({ assignedTo }) }
  );
}

export async function updateProperty(id: string, payload: { price?: number; priceUnit?: string; name?: string; description?: string }) {
  return request<import("@/types/agency").AgencyProperty>(
    `/properties/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

/* —— CRM Agence —— */
export async function fetchAgencyStats() {
  return request<import("@/types/agency-crm").AgencyStats>("/agency/stats");
}

export async function fetchAgencyClients() {
  return request<import("@/types/agency-crm").AgencyClient[]>("/agency/clients");
}

export async function createAgencyClient(payload: Partial<import("@/types/agency-crm").AgencyClient>) {
  return request<import("@/types/agency-crm").AgencyClient>("/agency/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgencyClient(id: string, payload: Partial<import("@/types/agency-crm").AgencyClient>) {
  return request<import("@/types/agency-crm").AgencyClient>(
    `/agency/clients/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function deleteAgencyClient(id: string) {
  return request<import("@/types/agency-crm").AgencyClient>(
    `/agency/clients/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function fetchAgencyContracts() {
  return request<import("@/types/agency-crm").AgencyContract[]>("/agency/contracts");
}

export async function createAgencyContract(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyContract>("/agency/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgencyContract(id: string, payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyContract>(
    `/agency/contracts/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function signAgencyContract(id: string, party: "client" | "owner" | "agency", signature?: string) {
  return request<import("@/types/agency-crm").AgencyContract>(
    `/agency/contracts/${encodeURIComponent(id)}/sign`,
    { method: "POST", body: JSON.stringify({ party, signature }) }
  );
}

export async function fetchAgencyPayments() {
  return request<import("@/types/agency-crm").AgencyPayment[]>("/agency/payments");
}

export async function createAgencyPayment(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyPayment>("/agency/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recordAgencyPayment(
  id: string,
  payload: { amountPaid?: number; method?: string; notes?: string }
) {
  return request<import("@/types/agency-crm").AgencyPayment>(
    `/agency/payments/${encodeURIComponent(id)}/record`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function fetchAgencyTasks() {
  return request<import("@/types/agency-crm").AgencyTask[]>("/agency/tasks");
}

export async function createAgencyTask(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyTask>("/agency/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgencyTask(id: string, payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyTask>(
    `/agency/tasks/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function deleteAgencyTask(id: string) {
  return request<import("@/types/agency-crm").AgencyTask>(
    `/agency/tasks/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function fetchAgencyAppointments() {
  return request<import("@/types/agency-crm").AgencyAppointment[]>("/agency/appointments");
}

export async function createAgencyAppointment(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyAppointment>("/agency/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAgencyAppointment(id: string) {
  return request<import("@/types/agency-crm").AgencyAppointment>(
    `/agency/appointments/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function fetchAgencyDocuments() {
  return request<import("@/types/agency-crm").AgencyDocument[]>("/agency/documents");
}

export async function createAgencyDocument(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyDocument>("/agency/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAgencyDocument(id: string) {
  return request<import("@/types/agency-crm").AgencyDocument>(
    `/agency/documents/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function fetchAgencyExpenses() {
  return request<import("@/types/agency-crm").AgencyExpense[]>("/agency/expenses");
}

export async function createAgencyExpense(payload: Record<string, unknown>) {
  return request<import("@/types/agency-crm").AgencyExpense>("/agency/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAgencyAccounting() {
  return request<import("@/types/agency-crm").AccountingSummary>("/agency/accounting");
}

/* —— Admin —— */
export async function fetchAdminStats() {
  return request<import("@/types/admin").AdminStats>("/admin/stats");
}

export async function fetchAdminAgencies() {
  return request<import("@/types/admin").AdminAgencyListItem[]>("/admin/agencies");
}

export async function fetchAdminAgencyDetail(id: string) {
  return request<import("@/types/admin").AdminAgencyDetail>(
    `/admin/agencies/${encodeURIComponent(id)}`
  );
}

export async function updateUserSubscription(id: string, subscriptionPlan: "free" | "pro") {
  return request<AuthUser>(`/admin/users/${encodeURIComponent(id)}/subscription`, {
    method: "PATCH",
    body: JSON.stringify({ subscriptionPlan }),
  });
}

export async function updateUserCommission(id: string, commissionRate: number) {
  return request<AuthUser>(`/admin/users/${encodeURIComponent(id)}/commission`, {
    method: "PATCH",
    body: JSON.stringify({ commissionRate }),
  });
}

export async function fetchAdminBookings(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return request<import("@/types/admin").AdminBooking[]>(
    `/admin/bookings${q ? `?${q}` : ""}`
  );
}

export async function fetchAdminContracts(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return request<import("@/types/admin").AdminContract[]>(
    `/admin/contracts${q ? `?${q}` : ""}`
  );
}

export async function fetchAdminPayments() {
  return request<import("@/types/admin").AdminPaymentItem[]>("/admin/payments");
}

export async function fetchAdminCommissions() {
  return request<import("@/types/admin").AdminCommissionRow[]>("/admin/commissions");
}

export async function fetchAdminClaims(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return request<import("@/types/admin").AdminClaim[]>(`/admin/claims${q ? `?${q}` : ""}`);
}

export async function createAdminClaim(payload: {
  subject: string;
  body?: string;
  authorName?: string;
  authorEmail?: string;
  status?: string;
}) {
  return request<import("@/types/admin").AdminClaim>("/admin/claims", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminClaim(
  id: string,
  payload: { status?: string; subject?: string; body?: string }
) {
  return request<import("@/types/admin").AdminClaim>(
    `/admin/claims/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function fetchAdminContent() {
  return request<import("@/types/admin").SiteContentItem[]>("/admin/content");
}

export async function saveAdminContent(
  items: { key: string; title?: string; body?: string }[]
) {
  return request<import("@/types/admin").SiteContentItem[]>("/admin/content", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function fetchAdminSettings() {
  return request<Record<string, string>>("/admin/settings");
}

export async function saveAdminSettings(settings: Record<string, string>) {
  return request<Record<string, string>>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function fetchAdminActivity() {
  return request<import("@/types/admin").AdminActivityItem[]>("/admin/activity");
}

