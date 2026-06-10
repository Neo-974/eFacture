import { Invoice, InvoiceLine, TaxCategory, TAX_RATES } from './types'
import { computeTotals } from './fiscal-engine'
import { generateId } from './utils'

export interface ExtractionResult {
  confidence: number // 0-1
  fields: {
    number: { value: string; confidence: number }
    date: { value: string; confidence: number }
    dueDate: { value: string; confidence: number }
    sellerName: { value: string; confidence: number }
    sellerSiren: { value: string; confidence: number }
    buyerName: { value: string; confidence: number }
    buyerSiren: { value: string; confidence: number }
    lines: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxCategory: TaxCategory
      confidence: number
    }>
  }
  warnings: string[]
}

// Mock extraction that simulates AI reading a PDF
// In production this would call Claude API with the PDF content
export async function extractFromPDF(fileName: string): Promise<ExtractionResult> {
  // Simulate processing time
  await new Promise(r => setTimeout(r, 1500))

  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + 30)

  const invoiceNum = `FACT-${today.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`

  return {
    confidence: 0.87,
    fields: {
      number: { value: invoiceNum, confidence: 0.95 },
      date: { value: today.toISOString().slice(0, 10), confidence: 0.92 },
      dueDate: { value: dueDate.toISOString().slice(0, 10), confidence: 0.88 },
      sellerName: { value: 'Réunion Import & Services', confidence: 0.97 },
      sellerSiren: { value: '123456789', confidence: 0.94 },
      buyerName: { value: 'SODIFAC SAS', confidence: 0.83 },
      buyerSiren: { value: '987654321', confidence: 0.71 },
      lines: [
        { description: 'Prestation de conseil en gestion', quantity: 1, unitPrice: 1200, taxCategory: 'DOM_85', confidence: 0.89 },
        { description: 'Formation réglementation TVA DOM', quantity: 2, unitPrice: 350, taxCategory: 'DOM_85', confidence: 0.91 },
      ],
    },
    warnings: [
      'SIREN acheteur extrait avec confiance modérée (71%) — veuillez vérifier',
      'Adresse de livraison non détectée dans le document',
    ],
  }
}

export function buildInvoiceFromExtraction(
  result: ExtractionResult,
  invoiceId: string
): Partial<Invoice> {
  const lines: InvoiceLine[] = result.fields.lines.map(l => {
    const taxRate = TAX_RATES[l.taxCategory]
    const amountHT = Math.round(l.quantity * l.unitPrice * 100) / 100
    const taxAmount = Math.round(amountHT * taxRate * 100) / 100
    return {
      id: generateId(),
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxCategory: l.taxCategory,
      taxRate,
      amountHT,
      taxAmount,
      amountTTC: amountHT + taxAmount,
    }
  })

  const totals = computeTotals(lines)

  return {
    id: invoiceId,
    number: result.fields.number.value,
    date: result.fields.date.value,
    dueDate: result.fields.dueDate.value,
    seller: {
      name: result.fields.sellerName.value,
      siren: result.fields.sellerSiren.value,
      address: '12 Rue du Commerce, 97400 Saint-Denis, La Réunion',
    },
    buyer: {
      name: result.fields.buyerName.value,
      siren: result.fields.buyerSiren.value,
    },
    lines,
    totals,
    status: 'DRAFT',
    fiscalChecks: [],
    paHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
