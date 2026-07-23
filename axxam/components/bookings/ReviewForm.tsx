"use client";

import { useState } from "react";
import { createReview } from "@/lib/api";

type ReviewFormProps = {
  bookingId: string;
  propertyName?: string;
  onDone?: () => void;
  onCancel?: () => void;
};

export default function ReviewForm({
  bookingId,
  propertyName,
  onDone,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Choisissez une note de 1 à 5 étoiles");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Écrivez un commentaire (au moins 5 caractères)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createReview({ bookingId, rating, comment: comment.trim() });
      setOk(true);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'avis");
    } finally {
      setBusy(false);
    }
  };

  if (ok) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Merci ! Votre note et votre commentaire ont été publiés.
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-black/5 bg-[var(--surface)] p-4"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Votre avis{propertyName ? ` · ${propertyName}` : ""}
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--navy)]">
          Notez votre séjour et laissez un commentaire
        </p>
      </div>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= (hover || rating);
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              <svg
                className={`h-8 w-8 ${filled ? "text-[var(--gold)]" : "text-black/15"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-2 text-sm font-semibold text-[var(--navy)]">{rating}/5</span>
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Propreté, accueil, emplacement, points à améliorer…"
          rows={4}
          required
          minLength={5}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] disabled:opacity-50"
        >
          {busy ? "Envoi…" : "Publier mon avis"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-black/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
