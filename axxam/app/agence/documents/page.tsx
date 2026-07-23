"use client";

import { useEffect, useState } from "react";
import { createAgencyDocument, deleteAgencyDocument, fetchAgencyDocuments } from "@/lib/api";
import type { AgencyDocument } from "@/types/agency-crm";

const CATEGORIES = [
  { value: "contract", label: "Contrats" },
  { value: "invoice", label: "Factures" },
  { value: "receipt", label: "Reçus" },
  { value: "id", label: "Carte d'identité" },
  { value: "passport", label: "Passeport" },
  { value: "property", label: "Documents du bien" },
  { value: "insurance", label: "Assurances" },
  { value: "photo", label: "Photos" },
  { value: "other", label: "Autre" },
];

export default function AgencyDocumentsPage() {
  const [items, setItems] = useState<AgencyDocument[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetchAgencyDocuments();
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onFile = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFileUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Documents</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Coffre-fort numérique de l&apos;agence</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form
        className="grid gap-3 rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await createAgencyDocument({ title, category, fileUrl, mimeType: "" });
          setTitle("");
          setFileUrl("");
          await load();
        }}
      >
        <label className="text-xs font-semibold text-[var(--navy)]">
          Titre
          <input className="axxam-input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Catégorie
          <select className="axxam-input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--navy)] sm:col-span-2">
          Fichier (ou URL)
          <input
            type="file"
            className="mt-1 block w-full text-sm"
            onChange={(e) => void onFile(e.target.files?.[0] || null)}
          />
          <input
            className="axxam-input mt-2"
            placeholder="https://... ou laisser le fichier ci-dessus"
            value={fileUrl.startsWith("data:") ? "" : fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
          {fileUrl.startsWith("data:") && (
            <p className="mt-1 text-[10px] text-emerald-700">Fichier prêt à enregistrer</p>
          )}
        </label>
        <button type="submit" className="axxam-btn-primary sm:col-span-2 sm:justify-self-start">
          Ajouter au coffre
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <article key={d.id} className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
              {CATEGORIES.find((c) => c.value === d.category)?.label || d.category}
            </p>
            <h3 className="mt-1 font-semibold text-[var(--navy)]">{d.title}</h3>
            <div className="mt-3 flex gap-2">
              {d.fileUrl && (
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[var(--gold-deep)] underline"
                >
                  Ouvrir
                </a>
              )}
              <button
                type="button"
                className="text-xs font-semibold text-red-600"
                onClick={async () => {
                  await deleteAgencyDocument(d.id);
                  await load();
                }}
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
