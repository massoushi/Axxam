export const ALGERIAN_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arreridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
] as const;

export type UserRole = "client" | "owner" | "agency" | "admin";
export type UserStatus = "active" | "pending" | "suspended";

export type AuthUser = {
  id: string;
  role: UserRole;
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
  status: UserStatus;
  subscriptionPlan?: "free" | "pro";
  commissionRate?: number;
  displayName: string;
  createdAt: string;
};

export type RegisterPayload = {
  role: "client" | "owner" | "agency";
  email: string;
  password: string;
  phone: string;
  address: string;
  firstName?: string;
  lastName?: string;
  wilaya?: string;
  avatar?: string | null;
  agencyName?: string;
  managerName?: string;
  rcNumber?: string;
  nif?: string;
  logo?: string | null;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  wilaya?: string;
  avatar?: string | null;
  agencyName?: string;
  managerName?: string;
  rcNumber?: string;
  nif?: string;
  logo?: string | null;
  password?: string;
};
