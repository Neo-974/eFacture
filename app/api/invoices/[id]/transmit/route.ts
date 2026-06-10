import { NextRequest, NextResponse } from 'next/server'
import { updateStore, readStore } from '@/lib/demo-store'
import { generateFacturX } from '@/lib/facturx-generator'
import { initiateTransmission, generatePAReference } from '@/lib/pa-connector'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const state = readStore()
  const invoice = state.invoices.find(i => i.id === id)

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (invoice.status !== 'DRAFT' && invoice.status !== 'VALIDATED') {
    return NextResponse.json({ error: 'Invoice already transmitted' }, { status: 400 })
  }

  // Check for blocking errors
  const hasErrors = invoice.fiscalChecks.some(c => c.severity === 'ERROR')
  if (hasErrors) {
    return NextResponse.json({ error: 'La facture comporte des erreurs fiscales bloquantes' }, { status: 422 })
  }

  // Generate Factur-X XML
  const facturxXml = generateFacturX(invoice)
  const paReference = generatePAReference()
  const transmitted = initiateTransmission({ ...invoice, facturxXml }, paReference)

  updateStore(state => ({
    ...state,
    invoices: state.invoices.map(i => i.id === id ? transmitted : i),
  }))

  return NextResponse.json({ ok: true, paReference, invoice: transmitted })
}
