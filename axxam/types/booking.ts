export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

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

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};
