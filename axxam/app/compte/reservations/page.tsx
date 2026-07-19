import BookingHistory from "@/components/bookings/BookingHistory";

export default function CompteReservationsPage() {
  return (
    <BookingHistory
      mode="client"
      title="Mes réservations"
      subtitle="Historique de vos logements : en attente, confirmés, terminés ou annulés."
    />
  );
}
