"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publishHelpMessage, whatsappHref } from "@/lib/whatsapp";

const ITEMS = [
  { href: "/hebergements", label: "Chercher", icon: "search" },
  { href: "/favoris", label: "Favoris", icon: "heart" },
  { href: "/publier", label: "Publier", icon: "plus", primary: true },
] as const;

function Icon({ name }: { name: string }) {
  if (name === "search") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

/** Barre mobile sticky — gros doigts, accès rapide. */
export default function MobileBottomBar() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/agence") || pathname.startsWith("/proprietaire")) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-1.5">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const primary = "primary" in item && item.primary;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[52px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                primary
                  ? "text-[var(--gold-deep)]"
                  : active
                    ? "text-[var(--navy)]"
                    : "text-[var(--muted)]"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  primary ? "bg-[var(--gold)] text-white shadow-md" : active ? "bg-[var(--sand-soft)]" : ""
                }`}
              >
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
        <a
          href={whatsappHref(publishHelpMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#128C7E]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/15">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </span>
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
