/** Contact support AXXAM (indicatif Algérie). Surcharge via NEXT_PUBLIC_WHATSAPP. */
export const WHATSAPP_SUPPORT =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP) || "213555000000";

export function whatsappHref(message?: string, phone = WHATSAPP_SUPPORT) {
  const digits = String(phone).replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function hostContactMessage(propertyName: string, loc: string) {
  return `Bonjour, je suis intéressé(e) par « ${propertyName} » (${loc}) sur AXXAM. Pouvez-vous m'aider ?`;
}

export function publishHelpMessage() {
  return "Bonjour AXXAM, j'ai besoin d'aide pour publier mon premier bien sur la plateforme.";
}
