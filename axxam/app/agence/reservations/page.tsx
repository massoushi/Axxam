import BookingHistory from "@/components/bookings/BookingHistory";

export default function AgenceReservationsPage() {
  return (
    <BookingHistory
      mode="host"
      title="Réservations reçues"
      subtitle="Gérez les demandes de location sur les biens de votre agence."
    />
  );
}
