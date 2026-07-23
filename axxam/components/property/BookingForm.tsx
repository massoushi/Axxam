"use client";

import PropertyImage from "@/components/ui/PropertyImage";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Property } from "@/types/property";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import { rangeOverlapsUnavailable } from "@/lib/dates";
import { createBooking } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Booking } from "@/types/booking";

type BookingFormProps = {
  property: Property;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
};

export default function BookingForm({
  property,
  onClose,
  initialCheckIn = "",
  initialCheckOut = "",
}: BookingFormProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: 2,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName || "",
      lastName: prev.lastName || user.lastName || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const unavailable = property.unavailableDates || [];

  const calculateTotal = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        const pricePerNight = parseInt(property.price.replace(/\s/g, ""), 10);
        return {
          nights,
          total: nights * pricePerNight,
        };
      }
    }
    return null;
  };

  const total = calculateTotal();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goNextFromDates = () => {
    if (!formData.checkIn || !formData.checkOut) {
      setDateError("Sélectionnez une date d'arrivée et de départ.");
      return;
    }
    if (formData.checkOut <= formData.checkIn) {
      setDateError("La date de départ doit être après l'arrivée.");
      return;
    }
    if (rangeOverlapsUnavailable(formData.checkIn, formData.checkOut, unavailable)) {
      setDateError("Certaines nuits sélectionnées ne sont pas disponibles.");
      return;
    }
    setDateError(null);
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rangeOverlapsUnavailable(formData.checkIn, formData.checkOut, unavailable)) {
      setDateError("Dates indisponibles.");
      setStep(1);
      return;
    }
    if (!user || user.role !== "client") {
      setSubmitError("Connectez-vous avec un compte client pour réserver.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createBooking({
        propertyId: property.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        guestFirstName: formData.firstName,
        guestLastName: formData.lastName,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        specialRequests: formData.specialRequests,
      });
      setCreatedBooking(res.data);
      setIsConfirmed(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Réservation impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--navy)] mb-2">Demande envoyée !</h3>
            <p className="text-gray-500 text-sm mb-4">
              Votre demande pour <span className="font-semibold text-[var(--navy)]">{property.name}</span> a
              été envoyée à l&apos;agence / propriétaire. Après confirmation, vous réglerez{" "}
              <strong>directement chez eux</strong> (pas de paiement en ligne).
            </p>
            <div className="bg-[#FBF9F6] rounded-xl p-4 text-left mb-6 space-y-2">
              <div>
                <p className="text-xs text-gray-400">Référence</p>
                <p className="font-mono text-sm font-semibold text-[var(--navy)]">
                  {createdBooking?.id || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Séjour</p>
                <p className="text-sm font-semibold text-[var(--navy)]">
                  {formData.checkIn} → {formData.checkOut}
                </p>
              </div>
            </div>
            <Link
              href="/compte/reservations"
              className="mb-2 block w-full bg-[var(--gold)] text-white py-3 rounded-xl font-bold hover:bg-[var(--gold-deep)] transition-colors"
            >
              Voir mon historique
            </Link>
            <button
              onClick={onClose}
              className="w-full border border-gray-200 text-[var(--navy)] py-3 rounded-xl font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <PropertyImage src={property.img} alt={property.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[var(--navy)] text-lg">{property.name}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {property.loc}
                </p>
                <p className="text-[var(--gold)] font-bold text-sm">
                  {property.price} DZD <span className="font-normal text-gray-400 text-xs">/ nuit</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s
                        ? "bg-[var(--gold)] text-white"
                        : step > s
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span className={`text-xs font-medium ${step === s ? "text-[var(--navy)]" : "text-gray-400"}`}>
                    {s === 1 ? "Dates" : s === 2 ? "Voyageurs" : "Confirmation"}
                  </span>
                  {s < 3 && <span className="text-gray-300 text-xs">—</span>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4">
                  <AvailabilityCalendar
                    unavailableDates={unavailable}
                    selectable
                    checkIn={formData.checkIn}
                    checkOut={formData.checkOut}
                    onSelectRange={(start, end) => {
                      setFormData((prev) => ({ ...prev, checkIn: start, checkOut: end }));
                      setDateError(null);
                    }}
                    monthsToShow={2}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Date d&apos;arrivée</label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Date de départ</label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                        required
                      />
                    </div>
                  </div>

                  {dateError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {dateError}
                    </p>
                  )}

                  {total && (
                    <div className="bg-[#FBF9F6] rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">{total.nights} nuits × {property.price} DZD</span>
                        <span className="font-semibold">{total.total.toLocaleString()} DZD</span>
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-[var(--navy)]">
                        <span>Total estimé</span>
                        <span>{total.total.toLocaleString()} DZD</span>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-500">
                        À régler chez l&apos;agence / propriétaire après confirmation
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Nombre de voyageurs</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                        className="w-10 h-10 rounded-full border border-gray-200 hover:border-[var(--gold)] flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold text-[var(--navy)] w-8 text-center">{formData.guests}</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, guests: Math.min(property.capacity, prev.guests + 1) }))}
                        className="w-10 h-10 rounded-full border border-gray-200 hover:border-[var(--gold)] flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400">max. {property.capacity} personnes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Votre prénom"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+213 5XX XX XX XX"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5">Demandes spéciales (optionnel)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Besoin particulier ?"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-[#FBF9F6] rounded-xl p-4">
                    <h4 className="font-semibold text-[var(--navy)] text-sm mb-2">Récapitulatif de votre demande</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dates</span>
                        <span className="font-medium">{formData.checkIn} → {formData.checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Voyageurs</span>
                        <span className="font-medium">{formData.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bien</span>
                        <span className="font-medium">{property.name}</span>
                      </div>
                      {total && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Montant estimé</span>
                            <span className="font-bold text-[var(--navy)]">{total.total.toLocaleString()} DZD</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">dont {total.nights} nuits</span>
                            <span className="text-gray-400">à régler chez l&apos;hôte</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Pas de paiement en ligne</p>
                      <p className="text-xs text-amber-700">
                        Vous envoyez une demande. Après acceptation, le règlement se fait directement
                        auprès de l&apos;agence ou du propriétaire.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:border-[var(--navy)] transition-colors"
                  >
                    Retour
                  </button>
                ) : (
                  <div />
                )}

                {submitError && step === 3 && (
                  <p className="absolute left-6 right-6 bottom-20 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {submitError}
                  </p>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1) goNextFromDates();
                      else setStep(step + 1);
                    }}
                    className="px-6 py-2.5 bg-[var(--gold)] text-white rounded-xl text-sm font-bold hover:bg-[var(--gold-deep)] transition-colors"
                  >
                    Continuer →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 bg-[var(--gold)] text-white rounded-xl text-sm font-bold hover:bg-[var(--gold-deep)] transition-colors ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                  </button>
                )}
              </div>
              {submitError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
