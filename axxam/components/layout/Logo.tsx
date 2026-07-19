import Image from "next/image";
import Link from "next/link";

/** Ratio réel du fichier public/logo-axxam.png */
const LOGO_RATIO = 1024 / 682;

type LogoProps = {
  className?: string;
  /** Hauteur du logo en px */
  height?: number;
  href?: string;
};

export default function Logo({ className = "", height = 52, href = "/" }: LogoProps) {
  const width = Math.round(height * LOGO_RATIO);

  const image = (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-md bg-black ${className}`}
      style={{ height, width }}
    >
      <Image
        src="/logo-axxam.png"
        alt="AXXAM — Immobilier & Hébergement"
        fill
        sizes={`${width}px`}
        className="object-contain object-center"
        priority
      />
    </span>
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Accueil AXXAM">
      {image}
    </Link>
  );
}
