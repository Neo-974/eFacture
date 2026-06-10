import { NextResponse } from 'next/server'
import { readStore } from '@/lib/demo-store'

export async function GET() {
  const state = readStore()
  return NextResponse.json(state.ereporting)
}
