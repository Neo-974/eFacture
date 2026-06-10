import { Invoice, InvoiceLine, FiscalCheck, TaxCategory, TAX_RATES } from './types'

const DOM_RATES = new Set<TaxCategory>(['DOM_85', 'DOM_21', 'DOM_175', 'DOM_105', 'EXEMPT'])
const MAINLAND_RATES = new Set<TaxCategory>(['STANDARD_20', 'STANDARD_10'])

function checkId() {
  return Math.random().toString(36).slice(2, 8)
}

export function runFiscalChecks(invoice: Partial<Invoice>): FiscalCheck[] {
  const checks: FiscalCheck[] = []
  const lines = invoice.lines ?? []

  // 1. Buyer SIREN present (2026 mandatory)
  checks.push({
    id: checkId(),
    label: 'SIREN acheteur',
    severity: invoice.buyer?.siren ? 'OK' : 'ERROR',
    detail: invoice.buyer?.siren
      ? `SIREN ${invoice.buyer.siren} renseigné`
      : 'Le SIREN de l\'acheteur est obligatoire depuis sept. 2026',
  })

  // 2. Invoice date present
  checks.push({
    id: checkId(),
    label: 'Date de facture',
    severity: invoice.date ? 'OK' : 'ERROR',
    detail: invoice.date ? `Facture datée du ${invoice.date}` : 'Date de facture manquante',
  })

  // 3. DOM tax rates (main check for La Réunion)
  const mainlandLines = lines.filter(l => MAINLAND_RATES.has(l.taxCategory))
  if (mainlandLines.length > 0) {
    checks.push({
      id: checkId(),
      label: 'Taux de TVA DOM',
      severity: 'ERROR',
      detail: `${mainlandLines.length} ligne(s) utilisent des taux métropole (20% / 10%) — à La Réunion les taux sont 8,5% / 2,1%`,
    })
  } else {
    checks.push({
      id: checkId(),
      label: 'Taux de TVA DOM',
      severity: 'OK',
      detail: 'Tous les taux appliqués sont des taux DOM (8,5 % / 2,1 %)',
    })
  }

  // 4. Exempt lines — check mention
  const exemptLines = lines.filter(l => l.taxCategory === 'EXEMPT')
  if (exemptLines.length > 0) {
    const hasExemptMention = exemptLines.every(l =>
      l.description.toLowerCase().includes('art') || l.description.toLowerCase().includes('295')
    )
    checks.push({
      id: checkId(),
      label: 'Mention exonération CGI',
      severity: hasExemptMention ? 'OK' : 'WARNING',
      detail: hasExemptMention
        ? 'Mention "art. 295 CGI" détectée sur les lignes exonérées'
        : 'Ajouter la mention "TVA non applicable - art. 295 du CGI" sur les lignes exonérées',
    })
  }

  // 5. Octroi de mer check
  const octroiLines = lines.filter(l => l.octroi)
  if (octroiLines.length > 0) {
    const octroiOk = octroiLines.every(l => l.octroi!.amount > 0 && l.octroi!.rate > 0)
    checks.push({
      id: checkId(),
      label: 'Octroi de mer',
      severity: octroiOk ? 'OK' : 'WARNING',
      detail: octroiOk
        ? `Octroi de mer / OMR renseigné sur ${octroiLines.length} ligne(s)`
        : 'Vérifier les montants d\'octroi de mer',
    })
  }

  // 6. Seller SIREN
  checks.push({
    id: checkId(),
    label: 'SIREN vendeur',
    severity: invoice.seller?.siren ? 'OK' : 'ERROR',
    detail: invoice.seller?.siren
      ? `SIREN ${invoice.seller.siren} renseigné`
      : 'Le SIREN du vendeur est obligatoire',
  })

  // 7. Invoice number
  checks.push({
    id: checkId(),
    label: 'Numéro de facture',
    severity: invoice.number ? 'OK' : 'ERROR',
    detail: invoice.number ? `N° ${invoice.number}` : 'Numéro de facture manquant',
  })

  // 8. Totals coherence
  if (lines.length > 0) {
    const computedHT = lines.reduce((s, l) => s + l.amountHT, 0)
    const computedTVA = lines.reduce((s, l) => s + l.taxAmount, 0)
    const expected = computedHT + computedTVA
    const actual = invoice.totals?.totalTTC ?? 0
    const diff = Math.abs(expected - actual)
    checks.push({
      id: checkId(),
      label: 'Cohérence des totaux',
      severity: diff < 0.02 ? 'OK' : 'ERROR',
      detail: diff < 0.02
        ? 'Total TTC cohérent avec le détail des lignes'
        : `Écart de ${diff.toFixed(2)} € entre le total TTC et le détail des lignes`,
    })
  }

  return checks
}

export function computeTotals(lines: InvoiceLine[]): Invoice['totals'] {
  const taxBreakdownMap = new Map<TaxCategory, { base: number; rate: number; amount: number }>()

  let totalHT = 0
  let totalTVA = 0
  let totalOctroi = 0

  for (const line of lines) {
    totalHT += line.amountHT
    totalTVA += line.taxAmount
    totalOctroi += line.octroi?.amount ?? 0

    const existing = taxBreakdownMap.get(line.taxCategory)
    if (existing) {
      existing.base += line.amountHT
      existing.amount += line.taxAmount
    } else {
      taxBreakdownMap.set(line.taxCategory, {
        base: line.amountHT,
        rate: line.taxRate,
        amount: line.taxAmount,
      })
    }
  }

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalOctroi: Math.round(totalOctroi * 100) / 100,
    totalTTC: Math.round((totalHT + totalTVA + totalOctroi) * 100) / 100,
    taxBreakdown: Array.from(taxBreakdownMap.entries()).map(([category, v]) => ({
      category,
      base: Math.round(v.base * 100) / 100,
      rate: v.rate,
      amount: Math.round(v.amount * 100) / 100,
    })),
  }
}
