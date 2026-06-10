# Cahier des charges — eFacture V1

*Version 1.0 — juin 2026 — validé avec le porteur de projet*

---

## 1. Contexte réglementaire

### 1.1 La réforme de la facturation électronique

| Échéance | Obligation | Qui |
|---|---|---|
| **1er sept. 2026** | Réception des factures électroniques | Toutes les entreprises établies en France |
| **1er sept. 2026** | Émission des factures électroniques + e‑reporting | Grandes entreprises et ETI |
| **1er sept. 2027** | Émission des factures électroniques + e‑reporting | **PME, TPE, micro‑entreprises** ← notre cible |

Principes clés :

- Les factures B2B domestiques transitent obligatoirement par une
  **Plateforme Agréée** (PA, anciennement PDP), immatriculée par la DGFiP.
  Au mai 2026, **134 PA** sont immatriculées.
- Le Portail Public de Facturation (PPF) est réduit au rôle d'**annuaire**
  des entreprises et de **concentrateur de données** vers l'administration.
- Formats du socle : **Factur‑X** (PDF/A‑3 + XML CII — le plus adapté aux
  PME car lisible par l'humain), **UBL**, **CII**. Sémantique **EN 16931**.
- L'**e‑reporting** couvre les transactions hors e‑invoicing : ventes B2C,
  ventes à l'international, et données de paiement pour les prestations de
  services.
- eFacture aura le statut d'**Opérateur de Dématérialisation (OD)** :
  préparation, conversion et enrichissement des factures, transmission
  déléguée à une PA partenaire via API. Pas d'immatriculation DGFiP requise.

### 1.2 Application à La Réunion

- La Réunion est dans le **territoire de TVA français** : les obligations
  d'e‑invoicing et d'e‑reporting s'y appliquent **aux mêmes dates** que la
  métropole (contrairement à la Guyane et Mayotte, hors TVA, soumises au
  seul e‑reporting).
- **Taux de TVA DOM** (Guadeloupe, Martinique, La Réunion) :
  - Taux normal : **8,5 %**
  - Taux réduit : **2,1 %**
  - Taux particuliers : 1,75 % et 1,05 % (presse, etc.)
  - **Exonérations art. 295 du CGI** (notamment importation/vente de
    certains produits, livraisons hors taxe)
- **Octroi de mer (OM) et octroi de mer régional (OMR)** : taxes locales sur
  les importations et certaines productions locales. Déclaration
  exclusivement électronique depuis juillet 2024. Les montants d'OM/OMR
  doivent être correctement portés sur les factures concernées.

## 2. Vision produit

### 2.1 Positionnement

**Passerelle de conformité** : l'entreprise conserve ses outils actuels
(Word, Excel, logiciel métier) ; eFacture transforme ses factures en flux
conformes et gère les échanges réglementaires dans les deux sens.

On ne concurrence pas les suites de facturation complètes (Pennylane,
Sellsy…) : on offre le chemin le plus court vers la conformité, avec une
expertise locale qu'aucun acteur national ne propose.

### 2.2 Cible

**Toutes les PME/TPE réunionnaises**, sans segment prioritaire : artisans,
commerçants, importateurs/distributeurs, services B2B, professions
libérales. L'interface doit donc viser la **simplicité maximale**
(utilisateurs peu équipés numériquement) tout en couvrant les cas complexes
(multi‑taux, octroi de mer).

L'expert‑comptable de l'entreprise peut être **invité en accès
lecture/export** sur le dossier de son client.

### 2.3 Modèle économique

**Abonnement SaaS mensuel**, paliers selon le volume de factures
(grille tarifaire à définir après étude du marché local — hypothèse de
travail : 3 paliers ~15 / 35 / 70 €HT/mois + essai gratuit).

### 2.4 Extension géographique (post‑V1)

L'architecture isole les règles fiscales dans un **moteur de règles par
territoire** (taux, exonérations, taxes locales), pour décliner ensuite :
Antilles (mêmes taux DOM + OM), Guyane/Mayotte (e‑reporting seul),
métropole (taux standards).

## 3. Périmètre fonctionnel V1

### 3.1 Émission (cœur du produit)

1. **Import PDF** : l'utilisateur dépose ses factures PDF existantes
   (drag & drop, ou transfert par e‑mail vers une adresse dédiée).
2. **Extraction par IA** : lecture du PDF (texte natif ou OCR), extraction
   structurée des données de facture (parties, SIREN, lignes, taux, totaux)
   via LLM avec sortie structurée validée.
3. **Écran de vérification** : données pré‑remplies présentées à
   l'utilisateur, anomalies surlignées, correction en un clic. Mémorisation
   des clients et des habitudes pour accélérer les imports suivants.
4. **Validation fiscale Réunion** : contrôle des taux appliqués
   (8,5 / 2,1 / 1,75 / 1,05 / exonération art. 295), cohérence des totaux,
   mentions obligatoires (dont les nouvelles mentions 2026 : SIREN client,
   adresse de livraison, type d'opération…), champs OM/OMR le cas échéant.
5. **Génération Factur‑X** : PDF/A‑3 avec XML CII embarqué, profil
   EN 16931.
6. **Transmission à la PA partenaire** via API, suivi du **cycle de vie**
   (déposée, rejetée, refusée, encaissée…) avec annuaire PPF pour
   l'adressage.

### 3.2 Réception fournisseurs

- Réception des factures entrantes via la PA partenaire.
- Boîte de réception : visualisation (lisible humain), statuts à renvoyer
  (approuvée, refusée, litige), export PDF/XML.
- Transfert automatique possible vers l'expert‑comptable.

### 3.3 E‑reporting

- Saisie ou import (CSV/récap Z de caisse) des données de transactions B2C
  et internationales.
- Agrégation et transmission au rythme réglementaire selon le régime de TVA
  de l'entreprise.
- Données de paiement pour les prestations de services.

### 3.4 Archivage légal

- Conservation des factures émises et reçues (originaux structurés +
  lisibles) pendant **10 ans**, intégrité garantie (empreinte, horodatage),
  stockage UE.

### 3.5 Tableau de bord de conformité

- Statuts des flux (émis, reçus, rejetés, en attente).
- Alertes : rejets PA, échéances e‑reporting, factures incomplètes.
- **Score de conformité** de l'entreprise et check‑list de préparation
  à sept. 2027 (effet pédagogique et commercial).

### 3.6 Comptes et accès

- Multi‑tenant : 1 compte = 1 entreprise (SIREN).
- Rôles V1 : propriétaire, employé, **invité expert‑comptable**
  (lecture + exports).
- Authentification e‑mail + mot de passe, 2FA optionnelle.

### 3.7 Hors périmètre V1 (V2+)

- Connecteurs API vers logiciels métier (EBP, Sage…), import CSV en masse.
- Saisie/création de factures dans l'app (mini‑éditeur).
- Accès cabinet multi‑dossiers pour les experts‑comptables.
- Relances de paiement, pré‑comptabilité, export FEC.
- Déclinaisons Antilles / Guyane / métropole.

## 4. Architecture technique

### 4.1 Stack retenue

| Couche | Choix | Justification |
|---|---|---|
| Frontend + API | **Next.js (App Router) + TypeScript** | Productivité, écosystème, déploiement Vercel déjà disponible |
| Base de données | **PostgreSQL** (managé, région UE) | Multi‑tenant fiable, JSONB pour les payloads de factures |
| ORM | Drizzle ou Prisma | Typage de bout en bout |
| Stockage fichiers | S3 compatible (région UE) | PDF, Factur‑X, archives |
| Extraction IA | **API Claude** (sortie structurée) + OCR si PDF scanné | Extraction robuste de factures hétérogènes |
| Jobs asynchrones | File de tâches (extraction, génération, envois PA) | Les imports PDF ne doivent pas bloquer l'UI |
| Paiement | Stripe (abonnements) | Standard SaaS |
| E‑mails | Resend ou équivalent | Notifications, import par e‑mail |

### 4.2 Modules clés

- **`fiscal-engine`** : moteur de règles fiscales par territoire
  (REUNION en V1). Entrées : lignes de facture ; sorties : validations,
  taux attendus, mentions requises. Isolé et testé exhaustivement —
  c'est l'actif différenciant.
- **`facturx-generator`** : génération XML CII EN 16931 + assemblage
  PDF/A‑3. Validation systématique par schématron avant envoi.
- **`pa-connector`** : couche d'abstraction au-dessus de l'API de la PA
  partenaire (interface unique : envoyer, recevoir, statuts, annuaire),
  pour pouvoir changer de PA sans réécrire l'app.
- **`extraction`** : pipeline PDF → données structurées → score de
  confiance par champ (les champs sous le seuil sont signalés à la
  vérification humaine).

### 4.3 Conformité et sécurité

- RGPD : hébergement UE, registre des traitements, DPA avec les
  sous‑traitants (dont fournisseur LLM — pas d'entraînement sur les données).
- Chiffrement au repos et en transit ; cloisonnement strict par tenant.
- Journal d'audit des actions sur les factures.

## 5. Roadmap

| Phase | Contenu | Statut |
|---|---|---|
| **0 — Cadrage** | Vision, périmètre, étude PA | ✅ Terminé |
| **1 — Socle** | Auth multi‑tenant, modèle de données, moteur fiscal Réunion, génération Factur‑X validée | À faire |
| **2 — MVP émission** | Import PDF + extraction IA + vérification + envoi sandbox PA + dashboard minimal | À faire |
| **3 — Flux complets** | Réception fournisseurs, e‑reporting, archivage, accès comptable, octroi de mer | À faire |
| **4 — Commercialisation** | Stripe, onboarding self‑service, site vitrine, partenariat PA signé, bêta avec PME locales | À faire |

Pas de contrainte calendaire forte exprimée ; cible naturelle : bêta
commercialisable **avant mi‑2027** pour capter la vague de mise en
conformité de septembre 2027.

## 6. Risques identifiés

| Risque | Mitigation |
|---|---|
| Dépendance à la PA partenaire (tarifs, API, pérennité) | Couche d'abstraction `pa-connector`, clause de réversibilité, 2e PA en backup |
| Qualité d'extraction sur PDF hétérogènes | Score de confiance + vérification humaine systématique en V1 |
| Évolutions réglementaires (textes d'application encore mouvants) | Veille DGFiP/AFNOR, moteur fiscal paramétrable, pas de logique en dur |
| Concurrence nationale à prix cassés | Différenciation locale (OM, accompagnement, support créole/français, réseau comptables) |
