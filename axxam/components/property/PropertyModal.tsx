"use client";

import Image from "next/image";
import { useState } from "react";
import type { Property } from "@/types/property";
import BookingForm from "@/components/property/BookingForm";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useAuth } from "@/components/auth/AuthProvider";

type PropertyModalProps = {
  property: Property;
  onClose: () => void;
};

export default function PropertyModal({ property, onClose }: PropertyModalProps) {
  const { user, loading } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"details" | "amenities" | "reviews">("details");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  if (!property) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const canBook = Boolean(checkIn && checkOut);

  const handleReserveClick = () => {
    if (!canBook) return;
    if (loading) return;
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    setShowBookingForm(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="p-6">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-6">
                <Image
                  src={property.images[currentImageIndex] || property.img}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                />

                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                    >
                      ›
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {property.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#0F1E2C]">{property.name}</h2>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.loc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-[#C5A880]/10 text-[#C5A880] text-sm font-bold px-3 py-1 rounded-lg">
                        ★ {property.rating}
                      </span>
                      <span className="text-gray-400 text-xs">{property.reviews?.length || 0} avis</span>
                    </div>
                  </div>

                  <div className="flex gap-6 border-b border-gray-200 mb-5">
                    {(
                      [
                        { id: "details", label: "Détails" },
                        { id: "amenities", label: "Équipements" },
                        { id: "reviews", label: "Avis" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                          selectedTab === tab.id
                            ? "border-[#C5A880] text-[#0F1E2C]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {selectedTab === "details" && (
                    <div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{property.description}</p>
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-400">Chambres</p>
                          <p className="font-semibold text-[#0F1E2C]">{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Salles de bain</p>
                          <p className="font-semibold text-[#0F1E2C]">{property.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Capacité</p>
                          <p className="font-semibold text-[#0F1E2C]">{property.capacity} voyageurs</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl mt-4">
                        <div className="w-12 h-12 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880] font-bold text-lg">
                          {property.host?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F1E2C] text-sm">{property.host}</p>
                          <p className="text-xs text-gray-400">Hôte AXXAM</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-gray-200 bg-[#FBF9F6] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#0F1E2C] mb-3">
                          Disponibilités
                        </p>
                        <AvailabilityCalendar
                          unavailableDates={property.unavailableDates || []}
                          selectable
                          checkIn={checkIn}
                          checkOut={checkOut}
                          onSelectRange={(start, end) => {
                            setCheckIn(start);
                            setCheckOut(end);
                          }}
                          monthsToShow={1}
                        />
                      </div>
                    </div>
                  )}

                  {selectedTab === "amenities" && (
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-[#C5A880]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedTab === "reviews" && (
                    <div className="space-y-4">
                      {property.reviews?.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[#0F1E2C] text-sm">{review.name}</span>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-[#C5A880]" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-[#FBF9F6] rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-[#0F1E2C]">
                        {property.price} DZD
                        <span className="text-sm font-normal text-gray-400"> / nuit</span>
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-[#C5A880]">★</span>
                        <span className="font-semibold">{property.rating}</span>
                        <span className="text-gray-400">({property.reviews?.length || 0})</span>
                      </div>
                    </div>

                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <p className="text-xs font-semibold text-[#0F1E2C] mb-2">Votre sélection</p>
                      {checkIn && checkOut ? (
                        <p className="text-gray-600">
                          {checkIn} → {checkOut}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xs">
                          Sélectionnez l&apos;arrivée puis le départ sur le calendrier (jours grisés =
                          non disponibles).
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleReserveClick}
                      disabled={!canBook || loading}
                      className="w-full bg-[#C5A880] text-[#0F1E2C] py-3 rounded-xl font-bold hover:bg-[#B3966E] transition-colors mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {canBook ? "Demander la réservation" : "Choisir des dates d'abord"}
                    </button>
                    <button className="w-full border border-gray-300 text-[#0F1E2C] py-3 rounded-xl font-medium hover:border-[#0F1E2C] transition-colors text-sm">
                      Contacter l&apos;hôte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}

      {showBookingForm && (
        <BookingForm
          property={property}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </>
  );
}
