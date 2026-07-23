export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type Booking = {
  id: string;
  propertyId: string;
  clientId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  serviceFee: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  propertyName?: string | null;
  propertyImg?: string | null;
  propertyLoc?: string | null;
  propertyCity?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
};

export type CreateBookingPayload = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
};

export type Invoice = {
  id: string;
  number: string;
  bookingId: string;
  clientId: string;
  hostId: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  guestName: string;
  guestEmail: string;
  createdAt: string;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Demande en attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "À régler sur place",
  paid: "Réglé chez l'hôte",
  refunded: "Remboursée",
};
