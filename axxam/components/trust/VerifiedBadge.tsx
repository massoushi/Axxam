"use client";

type VerifiedBadgeProps = {
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Badge confiance — identité / agence vérifiée AXXAM. */
export default function VerifiedBadge({
  label = "Vérifié",
  size = "sm",
  className = "",
}: VerifiedBadgeProps) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/80 ${pad} ${className}`}
      title="Compte ou annonce validés par AXXAM"
    >
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}
