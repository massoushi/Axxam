import BookingHistory from "@/components/bookings/BookingHistory";

export default function AgenceReservationsPage() {
  return (
    <BookingHistory
      mode="host"
      title="Demandes reçues"
      subtitle="Gérez les demandes sur les biens de l’agence. Paiement hors plateforme, chez vous."
    />
  );
}
