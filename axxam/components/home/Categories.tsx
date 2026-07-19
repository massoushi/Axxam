"use client";

import { CATEGORIES } from "@/data/listings";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Icon from "@/components/ui/Icon";

type CategoriesProps = {
  active: number;
  setActive: (v: number) => void;
};

export default function Categories({ active, setActive }: CategoriesProps) {
  return (
    <section className="bg-[var(--surface)] py-14 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">Explorer</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[var(--navy)]">Catégories</h2>
          </div>
          <a href="/annonces" className="text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold-deep)] transition-colors">
            Voir tout →
          </a>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible">
          {CATEGORIES.map((cat, idx) => {
            const isActive = active === idx;
            return (
              <button
                key={cat.label}
                onClick={() => setActive(idx)}
                className={`flex min-w-[104px] flex-col items-center gap-3 rounded-2xl border px-3 py-5 transition-all duration-300 ${
                  isActive
                    ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)] shadow-lg shadow-[var(--navy)]/15"
                    : "border-black/5 bg-white text-[var(--muted)] hover:border-[var(--gold)]/50 hover:text-[var(--navy)]"
                }`}
              >
                <Icon className="h-6 w-6">
                  <CategoryIcon id={cat.icon} />
                </Icon>
                <span className="text-[11px] font-medium text-center leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
