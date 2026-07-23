import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  /** Diamètre du logo rond en px */
  size?: number;
  /** @deprecated utiliser size — conservé pour compat */
  height?: number;
  /** Passer null pour désactiver le lien */
  href?: string | null;
  /** Sur fond sombre : fond sable pour le logo */
  onDark?: boolean;
};

export default function Logo({
  className = "",
  size,
  height,
  href = "/",
  onDark = false,
}: LogoProps) {
  const diameter = size ?? height ?? 48;

  const image = (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${
        onDark
          ? "bg-[var(--sand)] shadow-sm ring-2 ring-[var(--gold)]/40"
          : "bg-[var(--sand-soft)] ring-1 ring-[var(--navy)]/10"
      } ${className}`}
      style={{ height: diameter, width: diameter }}
    >
      <Image
        src="/logo-axxam.png"
        alt="AXXAM — Hébergement & Location · Algérie"
        fill
        sizes={`${diameter}px`}
        className="object-cover object-center scale-[1.15]"
        priority
      />
    </span>
  );

  if (href === null || href === "") return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Accueil AXXAM">
      {image}
    </Link>
  );
}
