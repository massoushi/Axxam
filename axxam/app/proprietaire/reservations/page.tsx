import BookingHistory from "@/components/bookings/BookingHistory";

export default function ProprietaireReservationsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BookingHistory
        mode="host"
        title="Historique des locations"
        subtitle="Demandes reçues sur vos biens : confirmez, refusez ou marquez comme terminées."
      />
    </div>
  );
}
