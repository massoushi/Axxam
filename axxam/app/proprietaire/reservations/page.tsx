import BookingHistory from "@/components/bookings/BookingHistory";

export default function ProprietaireReservationsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <BookingHistory
        mode="host"
        title="Demandes reçues"
        subtitle="Acceptez ou refusez. Le client paie chez vous — marquez « réglé » une fois le paiement reçu."
      />
    </div>
  );
}
