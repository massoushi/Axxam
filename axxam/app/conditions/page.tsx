import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — AXXAM",
  description:
    "Conditions générales d'utilisation de la plateforme AXXAM (hébergement, location et immobilier en Algérie).",
};

export default function ConditionsPage() {
  return (
    <LegalPageShell
      eyebrow="AXXAM · Légal"
      title="Conditions d'utilisation"
      updated="23 juillet 2026"
    >
      <LegalSection title="1. Objet">
        <p>
          Les présentes Conditions d&apos;utilisation (ci-après les « Conditions ») régissent l&apos;accès
          et l&apos;usage de la plateforme <strong className="text-[var(--navy)]">AXXAM</strong>, service
          de mise en relation entre <strong className="text-[var(--navy)]">clients / voyageurs</strong>,{" "}
          <strong className="text-[var(--navy)]">propriétaires</strong> et{" "}
          <strong className="text-[var(--navy)]">agences immobilières</strong> pour des séjours,
          locations et transactions immobilières en Algérie.
        </p>
        <p>
          En créant un compte ou en utilisant AXXAM, vous acceptez sans réserve les présentes
          Conditions. Si vous n&apos;y consentez pas, veuillez ne pas utiliser le service.
        </p>
      </LegalSection>

      <LegalSection title="2. Éditeur et nature du service">
        <p>
          AXXAM est une plateforme numérique intermédiaire. Elle facilite la publication
          d&apos;annonces, la recherche, la réservation, la communication et, le cas échéant, la
          gestion administrative (contrats, paiements enregistrés, factures).
        </p>
        <p>
          <strong className="text-[var(--navy)]">AXXAM n&apos;est pas</strong> le propriétaire des biens
          listés, ni une agence immobilière pour le compte de tous les annonceurs, sauf mention
          contraire. Les contrats de location ou de vente sont conclus entre les utilisateurs
          concernés (client, propriétaire et/ou agence).
        </p>
      </LegalSection>

      <LegalSection title="3. Comptes utilisateurs">
        <p>Quatre profils principaux existent :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--navy)]">Client</strong> : recherche, favoris, réservation,
            paiement, avis, messagerie.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Propriétaire</strong> : publication et gestion de
            biens, calendrier, réservations, revenus.
          </li>
          <li>
            <strong className="text-[var(--navy)]">Agence</strong> : portefeuille, équipe, clients,
            contrats, paiements, documents (sous réserve de validation administrative).
          </li>
          <li>
            <strong className="text-[var(--navy)]">Administrateur</strong> : modération, validation,
            statistiques et paramétrage de la plateforme.
          </li>
        </ul>
        <p>
          Vous vous engagez à fournir des informations exactes, à maintenir la confidentialité de
          vos identifiants et à signaler tout usage non autorisé de votre compte. Les comptes
          agence peuvent être soumis à une vérification (RC, NIF, pièces d&apos;identité) avant
          activation complète.
        </p>
      </LegalSection>

      <LegalSection title="4. Annonces et contenu">
        <p>
          Les annonceurs (propriétaires / agences) sont seuls responsables de l&apos;exactitude des
          descriptions, photos, prix, disponibilités, règles du logement et conformité légale des
          biens (titre, autorisations, normes locales).
        </p>
        <p>
          AXXAM peut refuser, suspendre ou retirer une annonce en cas de contenu trompeur, illicite,
          discriminatoire, ou non conforme aux Conditions ou à la loi algérienne.
        </p>
      </LegalSection>

      <LegalSection title="5. Réservations et paiements">
        <p>
          Sur AXXAM, le client envoie une <strong>demande de réservation</strong> à l&apos;agence ou
          au propriétaire. La demande n&apos;est ferme qu&apos;après acceptation par l&apos;hôte.
        </p>
        <p>
          <strong>Le paiement ne se fait pas en ligne sur la plateforme.</strong> Après confirmation,
          le client règle directement auprès de l&apos;agence ou du propriétaire (espèces, CCP,
          virement ou tout autre moyen convenu entre les parties). AXXAM met en relation ; la preuve
          et les modalités de paiement restent à la charge des parties.
        </p>
        <p>
          Les montants affichés sont indicatifs selon l&apos;annonce. Les cautions, frais
          additionnels et conditions d&apos;annulation sont ceux communiqués sur l&apos;annonce
          et/ou confirmés par écrit entre les parties.
        </p>
      </LegalSection>

      <LegalSection title="6. Obligations des utilisateurs">
        <ul className="list-disc space-y-1 pl-5">
          <li>Respecter les lois algériennes et les droits des tiers.</li>
          <li>Ne pas usurper l&apos;identité d&apos;autrui ni publier de fausses annonces.</li>
          <li>Ne pas contourner le système de réservation ou de commission de mauvaise foi.</li>
          <li>Utiliser la messagerie de façon courtoise et sans harcèlement.</li>
          <li>
            Pour les hôtes / agences : honorer les réservations confirmées et maintenir un calendrier
            à jour.
          </li>
          <li>
            Pour les clients : respecter le bien, les règles du séjour et les horaires convenus.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Propriété intellectuelle">
        <p>
          La marque AXXAM, le logo, l&apos;interface et les contenus propres à la plateforme sont
          protégés. Toute reproduction non autorisée est interdite. Les photos et textes des
          annonces restent la propriété de leurs auteurs, qui concèdent à AXXAM une licence
          d&apos;affichage pour le fonctionnement du service.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation de responsabilité">
        <p>
          AXXAM s&apos;efforce d&apos;assurer la disponibilité du service mais ne garantit pas
          l&apos;absence d&apos;interruptions. Dans les limites autorisées par la loi, AXXAM n&apos;est
          pas responsable des litiges entre utilisateurs (dégâts, non-présentation, défauts du bien,
          retards de paiement hors circuit plateforme), ni des dommages indirects.
        </p>
        <p>
          Les utilisateurs sont encouragés à documenter leurs échanges et à signaler tout abus via
          la messagerie ou le support.
        </p>
      </LegalSection>

      <LegalSection title="9. Suspension et résiliation">
        <p>
          Vous pouvez demander la fermeture de votre compte. AXXAM peut suspendre ou résilier un
          compte en cas de violation des Conditions, fraude, ou risque pour la sécurité des
          utilisateurs, sous réserve des obligations légales de conservation.
        </p>
      </LegalSection>

      <LegalSection title="10. Droit applicable">
        <p>
          Les présentes Conditions sont régies par le droit algérien. Tout litige relatif à leur
          interprétation ou exécution sera soumis aux tribunaux compétents d&apos;Algérie, sauf
          disposition légale contraire.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Pour toute question relative à ces Conditions : utilisez la messagerie AXXAM ou
          l&apos;adresse de contact indiquée sur la plateforme. Consultez également la{" "}
          <a href="/confidentialite" className="font-semibold text-[var(--gold-deep)] underline">
            Politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
