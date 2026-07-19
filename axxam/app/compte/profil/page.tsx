"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--navy)]";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ClientProfilePage() {
  const { user, logout, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setAvatar(user.avatar || null);
  }, [user]);

  if (!user) return null;

  const initial = (user.displayName || "?").charAt(0).toUpperCase();

  const onAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image trop lourde (max 2 Mo)");
      return;
    }
    setAvatar(await fileToDataUrl(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        phone,
        address,
        avatar,
        ...(password ? { password } : {}),
      });
      setPassword("");
      setConfirm("");
      setSuccess("Profil mis à jour avec succès");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Compte
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">Mon profil</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Modifiez vos informations personnelles</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--gold)] bg-[var(--navy)] text-xl font-bold text-[var(--gold)]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <label className={labelClass}>Photo de profil</label>
            <input type="file" accept="image/*" onChange={onAvatar} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nom *</label>
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Prénom *</label>
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Téléphone *</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse *</label>
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
        </div>

        <div className="border-t border-black/5 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Changer le mot de passe (optionnel)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nouveau mot de passe</label>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
            <div>
              <label className={labelClass}>Confirmer</label>
              <input
                type="password"
                className={inputClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--gold)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)] disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <Link
            href="/compte/reservations"
            className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Mes réservations
          </Link>
          <Link
            href="/"
            className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Accueil
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-red-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600"
          >
            Se déconnecter
          </button>
        </div>
      </form>
    </div>
  );
}
