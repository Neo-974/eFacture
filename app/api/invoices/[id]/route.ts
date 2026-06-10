import { NextRequest, NextResponse } from 'next/server'
import { readStore, updateStore } from '@/lib/demo-store'
import { runFiscalChecks, computeTotals } from '@/lib/fiscal-engine'
import { Invoice, InvoiceLine } from '@/lib/types'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const state = readStore()
  const invoice = state.invoices.find(i => i.id === id)
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json() as Partial<Invoice>

  const updated = updateStore(state => {
    const invoices = state.invoices.map(inv => {
      if (inv.id !== id) return inv
      const merged = { ...inv, ...body, updatedAt: new Date().toISOString() }
      // Re-run fiscal checks if lines or parties changed
      if (body.lines || body.buyer || body.seller) {
        merged.fiscalChecks = runFiscalChecks(merged)
        if (body.lines) merged.totals = computeTotals(body.lines as InvoiceLine[])
      }
      return merged
    })
    return { ...state, invoices }
  })

  const invoice = updated.invoices.find(i => i.id === id)
  return NextResponse.json(invoice)
}
