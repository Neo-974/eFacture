# PassFact974 — Passerelle de conformité facturation électronique pour les PME réunionnaises

*Nom commercial : **PassFact974** (passerelle + facture + La Réunion) — `eFacture` reste le nom technique du dépôt. Domaines visés : passfact974.re / .fr, et passfact.re / .fr comme marque ombrelle pour les futures déclinaisons régionales (PassFact971, 972, 973…).*

> SaaS d'accompagnement à la réforme de la facturation électronique française
> (échéances 2026‑2027), conçu d'abord pour les entreprises de La Réunion
> (TVA DOM, octroi de mer), avec une architecture prête pour d'autres régions.

## Démarrer la démo locale

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour accéder à la landing page, puis [http://localhost:3000/demo](http://localhost:3000/demo) pour la démo complète.

La démo utilise un état local persistant (`demo-state.json`, gitignore) pré-chargé avec :
- **3 factures émises** (ACCEPTED, DELIVERED, DRAFT)
- **4 factures reçues** fournisseurs (2 PENDING, 2 APPROVED)
- **2 périodes d'e-reporting** (1 PENDING, 1 CONFIRMED)

## Ce que simule la démo

| Fonctionnalité | Simulation |
|---|---|
| Import PDF | Extraction IA mockée (données réalistes TVA DOM + octroi de mer) |
| Validation fiscale | Moteur de règles réel : taux DOM 8,5 %/2,1 %, art. 295 CGI, octroi de mer |
| Génération Factur-X | XML CII EN 16931 généré réellement (téléchargeable) |
| Transmission PA | Cycle de vie simulé en temps réel : DEPOSITED → CHECKED → DELIVERED → ACCEPTED |
| Réception fournisseurs | Inbox avec actions (Approuver / Refuser / Litige) |
| E-reporting DGFiP | Transmission simulée avec référence DGFiP fictive |

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + lucide-react |
| Stockage (démo) | JSON file (`demo-state.json`) |
| Stockage (prod) | Supabase PostgreSQL (configuration dans `.env.local`) |
| Déploiement | Vercel (configuration prête) |
| Extraction IA (prod) | Claude API (optionnel — clé dans `.env.local`) |

## Variables d'environnement

Copier `.env.local.example` en `.env.local` et renseigner :

```bash
cp .env.local.example .env.local
```

Pour la démo locale, aucune variable n'est nécessaire — tout fonctionne sans configuration.

## Documentation projet

| Document | Contenu |
|---|---|
| [docs/cahier-des-charges.md](docs/cahier-des-charges.md) | Cahier des charges complet : contexte réglementaire, périmètre V1, spécificités Réunion, architecture, roadmap |
| [docs/etude-plateformes-agreees.md](docs/etude-plateformes-agreees.md) | Étude comparative des Plateformes Agréées pour le partenariat API |
| [docs/propositions-noms.md](docs/propositions-noms.md) | Historique des propositions de noms — décision : PassFact974 |
| [docs/presentation/PassFact974-presentation-V1.pdf](docs/presentation/PassFact974-presentation-V1.pdf) | Dossier de présentation partenaires (10 pages, format paysage) |

## Statut

🟢 **Phase 1 — Démo locale V1 opérationnelle**
Modèle économique : abonnement SaaS mensuel.
Prochaine étape : intégration Supabase + Vercel + partenariat PA.
