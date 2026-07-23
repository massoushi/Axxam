import BookingHistory from "@/components/bookings/BookingHistory";

export default function CompteReservationsPage() {
  return (
    <BookingHistory
      mode="client"
      title="Mes demandes"
      subtitle="Suivez vos demandes : en attente, confirmées, terminées. Le paiement se fait chez l’agence ou le propriétaire."
    />
  );
}
