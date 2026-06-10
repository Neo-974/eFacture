# Étude — choix de la Plateforme Agréée (PA, ex‑PDP) partenaire

*Version préliminaire — juin 2026. À affiner par une prise de contact
commerciale avec les candidats short‑listés.*

## Contexte

eFacture opérera comme **Opérateur de Dématérialisation (OD)** : l'app
prépare et convertit les factures, mais la transmission réglementaire passe
obligatoirement par une **Plateforme Agréée** immatriculée DGFiP. Il nous
faut donc un partenaire PA exposant une **API complète** (e‑invoicing,
e‑reporting, cycle de vie, annuaire), avec un modèle tarifaire compatible
avec un SaaS PME à petits prix.

État du marché : **134 PA immatriculées** au 26 mai 2026 (liste officielle
sur impots.gouv.fr). La grande majorité sont des éditeurs orientés grands
comptes ou des suites complètes ; seules quelques‑unes sont **API‑first**
et pensées pour servir d'infrastructure à des éditeurs/OD tiers.

## Critères de sélection

1. **API‑first** : documentation publique, sandbox, webhooks de cycle de vie
2. **Modèle "marque blanche" / OD friendly** : la PA accepte d'être
   l'infrastructure d'un éditeur tiers, sans concurrencer notre produit
3. **Tarification au volume** compatible avec des PME à faible volumétrie
4. **Couverture fonctionnelle** : e‑invoicing + e‑reporting + annuaire
5. **Pérennité** (solidité financière, ancienneté dans l'immatriculation)
6. Pas de blocage DOM (les flux Réunion sont des flux domestiques standard —
   à confirmer contractuellement)

## Candidats short‑listés

| PA | Profil | Points forts | Points d'attention |
|---|---|---|---|
| **Iopole** | PA API‑first, conçue explicitement pour les éditeurs et OD | Positionnement « infrastructure en marque blanche », API documentée, immatriculée DGFiP | Tarifs non publics → à négocier |
| **B2Brouter** | PA avec offre API dédiée | API publique, période de test gratuite (jusqu'à août 2026), expérience internationale (Peppol) | Acteur espagnol — vérifier le support FR et la roadmap e‑reporting |
| **Flowie** | PA récente orientée plateformes | Moderne, API soignée | Jeune société — pérennité à évaluer |
| **Pennylane** | PA + suite complète | Très solide | Concurrent direct potentiel sur notre cible — risque stratégique |

## Recommandation

1. **Piste n°1 : Iopole** — c'est le candidat dont le positionnement
   (infrastructure API pour OD/éditeurs) correspond exactement à notre
   besoin. Action : demander la grille tarifaire et l'accès sandbox.
2. **Piste n°2 : B2Brouter** — à tester en parallèle pendant la période
   gratuite ; bon plan B et levier de négociation.
3. **À éviter** : les PA qui sont aussi des suites de facturation grand
   public (conflit d'intérêt commercial).

## Décision d'architecture (indépendante du choix final)

Le module **`pa-connector`** isole l'API de la PA derrière une interface
unique (`submitInvoice`, `getLifecycle`, `fetchIncoming`, `submitEreporting`,
`lookupDirectory`). Le développement du MVP démarre sur la **sandbox** du
candidat n°1 sans engagement, et un changement de PA ne touche qu'un module.

## Prochaines actions

- [ ] Contacter Iopole et B2Brouter (grille tarifaire OD, conditions marque blanche, DPA)
- [ ] Vérifier sur impots.gouv.fr le statut d'immatriculation à date des candidats
- [ ] Confirmer la prise en charge des flux DOM/Réunion et de l'e‑reporting
- [ ] Obtenir les accès sandbox et lancer un POC d'envoi Factur‑X

## Sources

- [impots.gouv.fr — liste officielle des plateformes agréées](https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees)
- [impots.gouv.fr — facturation électronique et plateformes agréées](https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees)
- [Iopole — PDP API pour éditeurs et OD](https://www.iopole.com/)
- [B2Brouter — API facturation électronique France](https://www.b2brouter.net/fr/api-facturation-electronique/)
- [Pennylane — liste des plateformes agréées](https://www.pennylane.com/fr/fiches-pratiques/facture-electronique/liste-des-pdp)
- [Docaposte — liste officielle des PA](https://www.docaposte.com/blog/article/liste-pa)
