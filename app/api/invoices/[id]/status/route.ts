import { NextRequest, NextResponse } from 'next/server'
import { readStore, updateStore } from '@/lib/demo-store'
import { computeCurrentPAStatus } from '@/lib/pa-connector'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const state = readStore()
  const invoice = state.invoices.find(i => i.id === id)

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!invoice.transmittedAt) return NextResponse.json({ status: invoice.status, paHistory: invoice.paHistory })

  const { currentStatus, newEvents } = computeCurrentPAStatus(invoice)

  if (newEvents.length > 0) {
    const updatedInvoice = {
      ...invoice,
      status: currentStatus,
      paHistory: [...invoice.paHistory, ...newEvents],
      updatedAt: new Date().toISOString(),
    }
    updateStore(state => ({
      ...state,
      invoices: state.invoices.map(i => i.id === id ? updatedInvoice : i),
    }))
    return NextResponse.json({ status: currentStatus, paHistory: updatedInvoice.paHistory, updated: true })
  }

  return NextResponse.json({ status: currentStatus, paHistory: invoice.paHistory, updated: false })
}
