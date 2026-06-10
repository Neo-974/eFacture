import { NextResponse } from 'next/server'
import { writeStore } from '@/lib/demo-store'
import { getSeedData } from '@/lib/demo-seed'

export async function POST() {
  const seed = getSeedData()
  writeStore(seed)
  return NextResponse.json({ ok: true, message: 'Démo réinitialisée' })
}
