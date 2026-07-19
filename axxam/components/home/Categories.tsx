"use client";

import Link from "next/link";
import { EXPLORE_CATEGORIES, type ExploreCategory } from "@/data/listings";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Icon from "@/components/ui/Icon";

type CategoriesProps = {
  activeId: string;
  onSelect: (cat: ExploreCategory) => void;
};

function buildAnnoncesHref(cat: ExploreCategory) {
  if (!cat.filter) return "/annonces";
  const params = new URLSearchParams();
  if (cat.filter.type) params.set("type", cat.filter.type);
  if (cat.filter.category) params.set("category", cat.filter.category);
  if (cat.filter.transaction) params.set("transaction", cat.filter.transaction);
  if (cat.filter.priceUnit) params.set("priceUnit", cat.filter.priceUnit);
  const q = params.toString();
  return q ? `/annonces?${q}` : "/annonces";
}

export default function Categories({ activeId, onSelect }: CategoriesProps) {
  return (
    <section className="bg-[var(--surface)] py-14 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
              Explorer
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[var(--navy)]">
              Que recherchez-vous ?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
              Séjours à la nuit, location longue durée, biens à vendre ou terrains.
            </p>
          </div>
          <Link
            href="/annonces"
            className="shrink-0 text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold-deep)] transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 sm:overflow-visible">
          {EXPLORE_CATEGORIES.map((cat) => {
            const isActive = activeId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat)}
                onDoubleClick={() => {
                  window.location.href = buildAnnoncesHref(cat);
                }}
                className={`flex min-w-[96px] flex-col items-center gap-2.5 rounded-2xl border px-2.5 py-4 transition-all duration-300 ${
                  isActive
                    ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)] shadow-lg shadow-[var(--navy)]/15"
                    : "border-black/5 bg-white text-[var(--muted)] hover:border-[var(--gold)]/50 hover:text-[var(--navy)]"
                }`}
              >
                <Icon className="h-6 w-6">
                  <CategoryIcon id={cat.icon} />
                </Icon>
                <span className="text-[10px] font-medium text-center leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
