import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité — AXXAM",
  description:
    "Politique de confidentialité et protection des données personnelles sur AXXAM.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPageShell
      eyebrow="AXXAM · Légal"
      title="Politique de confidentialité"
      updated="23 juillet 2026"
    >
      <LegalSection title="1. Introduction">
        <p>
          La présente Politique de confidentialité décrit comment{" "}
          <strong className="text-[var(--navy)]">AXXAM</strong> collecte, utilise, conserve et
          protège vos données personnelles lorsque vous utilisez la plateforme de mise en relation
          immobilière et d&apos;hébergement en Algérie.
        </p>
        <p>
          En créant un compte, vous confirmez avoir lu et accepté cette Politique, ainsi que les{" "}
          <a href="/conditions" className="font-semibold text-[var(--gold-deep)] underline">
            Conditions d&apos;utilisation
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Selon votre profil (client, propriétaire, agence), nous pouvons collecter :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--navy)]">Identité</strong> : nom, prénom, photo / logo,
            pièce d&apos;identité ou documents professionnels (CIN, passeport, RC, NIF) lorsque
            requis pour la vérification.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Coordonnées</strong> : email, téléphone, adresse,
            wilaya.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Compte</strong> : identifiants, rôle, préférences,
            historique de connexion.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Annonces &amp; activité</strong> : biens publiés,
            photos, calendriers, réservations, messages, avis, favoris, contrats et échéanciers
            (espaces pro).
          </li>
          <li>
            <strong className="text-[var(--navy)]">Paiements</strong> : montants, statuts, méthodes
            enregistrées (espèces, CCP, virement, etc.) et factures / reçus associés — sans stocker
            inutilement de données bancaires sensibles lorsque le paiement est externalisé.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Techniques</strong> : logs, adresse IP, type
            d&apos;appareil, cookies nécessaires au fonctionnement.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>créer et gérer votre compte ;</li>
          <li>mettre en relation clients, propriétaires et agences ;</li>
          <li>traiter réservations, messages, notifications et documents ;</li>
          <li>sécuriser la plateforme, prévenir la fraude et modérer les contenus ;</li>
          <li>améliorer le service (statistiques agrégées, support) ;</li>
          <li>respecter les obligations légales applicables en Algérie.</li>
        </ul>
        <p>Nous ne vendons pas vos données personnelles à des tiers à des fins commerciales.</p>
      </LegalSection>

      <LegalSection title="4. Destinataires">
        <p>
          Les données nécessaires à une réservation ou un contrat sont partagées entre les parties
          concernées (ex. : un hôte voit les infos du voyageur pour la réservation). Les
          administrateurs AXXAM peuvent y accéder pour la modération et le support.
        </p>
        <p>
          Des prestataires techniques (hébergement, email, paiement) peuvent traiter des données
          pour notre compte, uniquement dans le cadre du service et sous obligations de
          confidentialité.
        </p>
      </LegalSection>

      <LegalSection title="5. Conservation">
        <p>
          Les données sont conservées pendant la durée nécessaire aux finalités ci-dessus, puis
          archivées ou supprimées selon les délais légaux (notamment comptables et de preuve en cas
          de litige). Vous pouvez demander la suppression de votre compte ; certaines informations
          pourront être retenues si la loi l&apos;exige.
        </p>
      </LegalSection>

      <LegalSection title="6. Sécurité">
        <p>
          AXXAM met en œuvre des mesures raisonnables (contrôle d&apos;accès, chiffrement des mots
          de passe, HTTPS) pour protéger vos données. Aucun système n&apos;étant infaillible, vous
          êtes invité à utiliser un mot de passe robuste et unique.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Des cookies ou stockage local peuvent être utilisés pour la session, la sécurité et les
          préférences (ex. : maintien de la connexion). Vous pouvez les limiter via les paramètres
          de votre navigateur, au risque d&apos;altérer certaines fonctionnalités.
        </p>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>
          Conformément au cadre légal applicable en Algérie en matière de protection des données,
          vous pouvez demander l&apos;accès, la rectification, la mise à jour ou la suppression de
          vos données personnelles, ainsi que la limitation de certains traitements, via votre
          espace profil ou le support AXXAM.
        </p>
      </LegalSection>

      <LegalSection title="9. Mineurs">
        <p>
          Le service s&apos;adresse à des personnes majeures ou dûment représentées. Si vous avez
          connaissance d&apos;un compte créé par un mineur sans autorisation, contactez-nous pour
          sa suppression.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications">
        <p>
          Cette Politique peut être mise à jour. La date de dernière révision figure en tête de
          page. En cas de changement substantiel, une information pourra être affichée sur la
          plateforme.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Pour exercer vos droits ou poser une question sur vos données : contactez le support via
          AXXAM ou consultez les{" "}
          <a href="/conditions" className="font-semibold text-[var(--gold-deep)] underline">
            Conditions d&apos;utilisation
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
