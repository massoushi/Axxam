import type { AuthUser } from "@/types/auth";

export type AgencyAdminStats = {
  propertiesTotal: number;
  propertiesActive: number;
  propertiesPending: number;
  bookingsTotal: number;
  bookingsPending: number;
  bookingsConfirmed: number;
  bookingsCancelled: number;
  bookingsPaid: number;
  gmv: number;
  commissions: number;
  clientsCrm: number;
  contractsActive: number;
  teamMembers: number;
};

export type AdminAgencyListItem = AuthUser & {
  stats: AgencyAdminStats;
};

export type AdminAgencyDetail = AdminAgencyListItem & {
  recentBookings: {
    id: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestName: string;
    guestEmail: string;
    propertyName: string;
    propertyCity: string;
    createdAt: string;
  }[];
  recentProperties: {
    id: string;
    name: string;
    city: string;
    status: string;
    price: number;
    priceUnit: string;
    transaction: string;
    type: string;
    createdAt: string;
  }[];
};

export type AdminBooking = {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  propertyImg: string | null;
  status: string;
  paymentStatus: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  serviceFee: number;
  paidAt: string | null;
  createdAt: string;
  guest: { firstName: string; lastName: string; email: string; phone: string };
  host: { id: string; role: string | null; email: string; displayName: string; phone: string };
  client: { id: string; email: string; displayName: string; phone: string };
};

export type AdminContract = {
  id: string;
  agencyId: string;
  title: string;
  status: string;
  rent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  durationMonths: number;
  clientName: string | null;
  propertyName: string | null;
  agencyName: string;
  agencyEmail: string;
  createdAt?: string;
};

export type AdminPaymentItem = {
  id: string;
  type: "booking" | "agency";
  label: string;
  amount: number;
  fee?: number;
  amountDue?: number;
  amountPaid?: number;
  status: string;
  method: string;
  partyName: string;
  counterparty: string;
  paidAt: string | null;
  createdAt: string;
  at: string;
};

export type AdminCommissionRow = AuthUser & {
  bookingsPaid: number;
  gmv: number;
  commissionsPaid: number;
};

export type AdminClaim = {
  id: string;
  subject: string;
  body: string;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  relatedType: string | null;
  relatedId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteContentItem = {
  key: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type AdminActivityItem = {
  type: string;
  title: string;
  detail: string;
  at: string;
};

export type AdminStats = {
  kpis: {
    agencies: number;
    agenciesActive: number;
    agenciesPending: number;
    users: number;
    clients: number;
    owners: number;
    propertiesOnline: number;
    propertiesPending: number;
    propertiesTotal: number;
    bookings: number;
    bookingsMonth: number;
    revenueMonth: number;
    commissionsMonth: number;
    gmv: number;
    commissions: number;
    outstanding: number;
    contractsActive: number;
    occupancyRate: number;
    avgRating: number;
    reviewsCount: number;
    pendingUsers: number;
  };
  revenueSeries: { month: string; label: string; revenue: number }[];
  cities: { city: string; count: number; pct: number }[];
  subscriptions: { id: string; label: string; count: number; pct: number }[];
  recentAgencies: (AuthUser & { propertyCount: number })[];
  activity: AdminActivityItem[];
  claims: {
    id: string;
    subject: string;
    author: string;
    date: string;
    status: string;
  }[];
  transactions: {
    id: string;
    type: string;
    amount: number;
    method: string;
    date: string;
    status: string;
  }[];
};
