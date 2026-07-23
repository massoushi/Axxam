export type AgencyMember = {
  id: string;
  agencyId: string;
  userId: string;
  memberRole: "employee" | "manager";
  status: "active" | "pending" | "suspended";
  createdAt: string;
  email?: string | null;
  displayName?: string | null;
  phone?: string | null;
};

export type LinkedOwner = {
  id: string;
  agencyId: string;
  ownerId: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
  email?: string | null;
  displayName?: string | null;
  phone?: string | null;
};
