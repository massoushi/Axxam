export type AgencyStats = {
  kpis: {
    properties: number;
    owners: number;
    clients: number;
    activeContracts: number;
    revenueMonth: number;
    outstanding: number;
    outstandingCount: number;
    bookingsToday: number;
    unreadMessages: number;
    occupancyRate: number;
    available: number;
    occupied: number;
  };
  revenueSeries: { month: string; label: string; revenue: number }[];
  propertyTypes: { type: string; count: number; pct: number }[];
  pendingPayments: AgencyPayment[];
  expiringContracts: AgencyContract[];
  recentMessages: { id: string; body: string; senderName: string; createdAt: string }[];
  agenda: {
    tasks: AgencyTask[];
    appointments: AgencyAppointment[];
  };
};

export type AgencyClient = {
  id: string;
  agencyId: string;
  photo: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  cin: string;
  passport: string;
  profession: string;
  employer: string;
  notes: string;
  createdAt?: string;
};

export type AgencyContract = {
  id: string;
  agencyId: string;
  propertyId: string | null;
  ownerId: string | null;
  clientId: string | null;
  title: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  rent: number;
  deposit: number;
  commissionPct: number;
  conditions: string;
  status: string;
  qrToken: string | null;
  clientName?: string | null;
  propertyName?: string | null;
  signedClientAt?: string | null;
  signedOwnerAt?: string | null;
  signedAgencyAt?: string | null;
};

export type AgencyPayment = {
  id: string;
  agencyId: string;
  contractId: string | null;
  clientId: string | null;
  label: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  method: string;
  status: string;
  notes: string;
  clientName?: string | null;
  paidAt?: string | null;
};

export type AgencyTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: string;
  priority: string;
};

export type AgencyAppointment = {
  id: string;
  title: string;
  kind: string;
  startAt: string;
  endAt?: string | null;
  location: string;
  notes: string;
};

export type AgencyDocument = {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  mimeType: string;
  createdAt?: string;
};

export type AgencyExpense = {
  id: string;
  label: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes: string;
};

export type AccountingSummary = {
  revenue: number;
  expenses: number;
  commissions: number;
  profit: number;
};
