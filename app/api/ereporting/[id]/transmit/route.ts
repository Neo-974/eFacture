import { NextRequest, NextResponse } from 'next/server'
import { updateStore } from '@/lib/demo-store'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date().toISOString()
  const ref = 'DGFIP-EREP-' + Date.now().toString(36).toUpperCase()

  // Simulate transmission delay
  await new Promise(r => setTimeout(r, 2000))

  const updated = updateStore(state => ({
    ...state,
    ereporting: state.ereporting.map(p =>
      p.id !== id ? p : {
        ...p,
        status: 'CONFIRMED' as const,
        transmittedAt: now,
        dgfipReference: ref,
      }
    ),
  }))

  return NextResponse.json(updated.ereporting.find(p => p.id === id))
}
