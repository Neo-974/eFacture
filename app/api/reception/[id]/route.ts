import { NextRequest, NextResponse } from 'next/server'
import { updateStore } from '@/lib/demo-store'
import { ReceivedStatus } from '@/lib/types'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action, notes } = await req.json() as { action: ReceivedStatus; notes?: string }

  const updated = updateStore(state => ({
    ...state,
    receivedInvoices: state.receivedInvoices.map(inv =>
      inv.id !== id ? inv : {
        ...inv,
        status: action,
        notes: notes ?? inv.notes,
        processedAt: new Date().toISOString(),
      }
    ),
  }))

  return NextResponse.json(updated.receivedInvoices.find(i => i.id === id))
}
