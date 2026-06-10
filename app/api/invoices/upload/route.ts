import { NextRequest, NextResponse } from 'next/server'
import { updateStore } from '@/lib/demo-store'
import { extractFromPDF, buildInvoiceFromExtraction } from '@/lib/extraction'
import { runFiscalChecks } from '@/lib/fiscal-engine'
import { generateId } from '@/lib/utils'
import { Invoice } from '@/lib/types'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const useSample = formData.get('useSample') === 'true'

  const fileName = file?.name ?? 'sample-invoice.pdf'
  const invoiceId = 'INV-' + generateId()

  // Extract data from PDF (mock)
  const extraction = await extractFromPDF(useSample ? 'sample' : fileName)
  const partial = buildInvoiceFromExtraction(extraction, invoiceId)
  const fiscalChecks = runFiscalChecks(partial)

  const invoice: Invoice = {
    ...(partial as Invoice),
    fiscalChecks,
    status: 'DRAFT',
    paHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  updateStore(state => ({
    ...state,
    invoices: [invoice, ...state.invoices],
  }))

  return NextResponse.json({ invoiceId, invoice, extraction })
}
