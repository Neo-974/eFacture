# PassFact974 — Passerelle de conformité facturation électronique pour les PME réunionnaises

*Nom commercial : **PassFact974** (passerelle + facture + La Réunion) — `eFacture` reste le nom technique du dépôt. Domaines visés : passfact974.re / .fr, et passfact.re / .fr comme marque ombrelle pour les futures déclinaisons régionales (PassFact971, 972, 973…).*

> SaaS d'accompagnement à la réforme de la facturation électronique française
> (échéances 2026‑2027), conçu d'abord pour les entreprises de La Réunion
> (TVA DOM, octroi de mer), avec une architecture prête pour d'autres régions.

## Le problème

À partir du **1er septembre 2026**, toutes les entreprises établies en France
(La Réunion incluse) doivent pouvoir **recevoir** des factures électroniques.
À partir du **1er septembre 2027**, les PME, TPE et micro-entreprises devront
aussi les **émettre** au format structuré (Factur‑X, UBL, CII) via une
**Plateforme Agréée** (PA, ex‑PDP), et transmettre leur **e‑reporting**
(ventes B2C et internationales) à l'administration fiscale.

La majorité des PME réunionnaises facturent aujourd'hui avec Word, Excel ou
des logiciels métier non conformes — et leurs spécificités locales
(TVA DOM 8,5 % / 2,1 %, exonérations art. 295 du CGI, octroi de mer) sont mal
couvertes par les solutions nationales.

## La solution

**eFacture** est une **passerelle de conformité** : les entreprises gardent
leurs outils actuels et l'application sert de pont vers la réforme.

- 📥 **Import de factures PDF existantes** → extraction des données par IA →
  génération d'une facture **Factur‑X** conforme
- ✅ **Validation fiscale locale** : taux de TVA DOM, exonérations,
  octroi de mer / octroi de mer régional
- 📤 **Transmission** via une Plateforme Agréée partenaire (intégration API)
- 📨 **Réception** des factures fournisseurs
- 🧾 **E‑reporting** B2C et international
- 🗄️ **Archivage légal** des factures
- 📊 **Tableau de bord de conformité** + accès invité pour l'expert‑comptable

## Documentation projet

| Document | Contenu |
|---|---|
| [docs/cahier-des-charges.md](docs/cahier-des-charges.md) | Cahier des charges complet : contexte réglementaire, périmètre V1, spécificités Réunion, architecture, roadmap |
| [docs/etude-plateformes-agreees.md](docs/etude-plateformes-agreees.md) | Étude comparative des Plateformes Agréées pour le partenariat API |
| [docs/propositions-noms.md](docs/propositions-noms.md) | Propositions de noms commerciaux |

## Statut

🟡 **Phase de cadrage terminée** — développement du MVP à démarrer.
Modèle économique : abonnement SaaS mensuel.
