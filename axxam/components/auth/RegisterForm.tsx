"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";
import { ALGERIAN_WILAYAS } from "@/types/auth";
import type { RegisterPayload } from "@/types/auth";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--navy)]";

type RoleTab = "client" | "owner" | "agency";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  const [role, setRole] = useState<RoleTab>("client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("Alger");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [agencyName, setAgencyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [nif, setNif] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<string | null>(null);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>, kind: "avatar" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image trop lourde (max 2 Mo)");
      return;
    }
    const data = await fileToDataUrl(file);
    if (kind === "avatar") setAvatar(data);
    else setLogo(data);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    const payload: RegisterPayload = {
      role,
      email: email.trim(),
      password,
      phone: phone.trim(),
      address: address.trim(),
      wilaya: role === "client" ? undefined : wilaya,
      avatar: role !== "agency" && avatar ? avatar : undefined,
      firstName: role === "agency" ? undefined : firstName.trim(),
      lastName: role === "agency" ? undefined : lastName.trim(),
      agencyName: role === "agency" ? agencyName.trim() : undefined,
      managerName: role === "agency" ? managerName.trim() : undefined,
      rcNumber: role === "agency" ? rcNumber.trim() || undefined : undefined,
      nif: role === "agency" ? nif.trim() || undefined : undefined,
      logo: role === "agency" && logo ? logo : undefined,
    };

    if (!payload.phone || payload.phone.replace(/\D/g, "").length < 8) {
      setError("Téléphone invalide (minimum 8 chiffres)");
      return;
    }
    if (!payload.address) {
      setError("Adresse requise");
      return;
    }

    setLoading(true);
    try {
      const user = await register(payload);
      router.push(dashboardPathForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto bg-[var(--surface)]">
      <div className="mx-auto max-w-2xl px-4 py-10 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choisissez votre profil pour commencer sur AXXAM
          </p>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1">
          {(
            [
              { id: "client", label: "Client" },
              { id: "owner", label: "Propriétaire" },
              { id: "agency", label: "Agence" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRole(tab.id)}
              className={`flex-1 rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                role === tab.id
                  ? "bg-[var(--navy)] text-[var(--gold)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
          {role !== "agency" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nom *</label>
                <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Prénom *</label>
                <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
            </div>
          )}

          {role === "agency" && (
            <>
              <div>
                <label className={labelClass}>Nom de l&apos;agence *</label>
                <input className={inputClass} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Nom du responsable *</label>
                <input className={inputClass} value={managerName} onChange={(e) => setManagerName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>N° RC (optionnel)</label>
                  <input className={inputClass} value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} placeholder="Registre de commerce" />
                </div>
              <div>
                <label className={labelClass}>NIF (optionnel)</label>
                <input className={inputClass} value={nif} onChange={(e) => setNif(e.target.value)} />
              </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Téléphone *</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XXX" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Adresse *</label>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={role === "agency" ? "Siège de l'agence" : "Adresse complète"}
              required
            />
          </div>

          {(role === "owner" || role === "agency") && (
            <div>
              <label className={labelClass}>Wilaya *</label>
              <select className={inputClass} value={wilaya} onChange={(e) => setWilaya(e.target.value)} required>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Mot de passe *</label>
              <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div>
              <label className={labelClass}>Confirmer le mot de passe *</label>
              <input type="password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required />
            </div>
          </div>

          {role !== "agency" && (
            <div>
              <label className={labelClass}>Photo de profil (optionnel)</label>
              <input type="file" accept="image/*" onChange={(e) => onFile(e, "avatar")} className="text-sm" />
              {avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
              )}
            </div>
          )}

          {role === "agency" && (
            <div>
              <label className={labelClass}>Logo de l&apos;agence (optionnel)</label>
              <input type="file" accept="image/*" onChange={(e) => onFile(e, "logo")} className="text-sm" />
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
              )}
            </div>
          )}

          <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5"
            />
            J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité AXXAM.
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          {role === "agency" && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Les comptes agence sont validés par un administrateur avant de pouvoir publier.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--gold)] py-3 text-xs font-bold uppercase tracking-wider text-[var(--navy)] disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="text-center text-xs text-[var(--muted)]">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-semibold text-[var(--navy)] underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
