'use client'
import { useEffect, useState } from 'react'
import { Send, CheckCircle2, Loader2, BarChart3, ShoppingCart, Globe } from 'lucide-react'
import { EReportingPeriod } from '@/lib/types'
import { EREPORTING_STATUS_META, formatEur, formatDateTime } from '@/lib/utils'

function StatusBadge({ status }: { status: EReportingPeriod['status'] }) {
  const m = EREPORTING_STATUS_META[status]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>{m.label}</span>
}

export default function EReportingPage() {
  const [periods, setPeriods] = useState<EReportingPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [transmittingId, setTransmittingId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/ereporting')
    setPeriods(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleTransmit(id: string) {
    setTransmittingId(id)
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, status: 'TRANSMITTING' as const } : p))
    try {
      const res = await fetch(`/api/ereporting/${id}/transmit`, { method: 'POST' })
      const updated = await res.json()
      setPeriods(prev => prev.map(p => p.id === id ? updated : p))
    } finally {
      setTransmittingId(null)
    }
  }

  const pending = periods.filter(p => p.status === 'PENDING').length
  const totalHT = periods.reduce((s, p) => s + p.totalHT, 0)
  const totalTVA = periods.reduce((s, p) => s + p.totalTVA, 0)

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-dark)' }}>E-Reporting</h1>
        <p className="text-slate-500 text-sm">Transmission des données de transactions B2C et internationales à l'administration fiscale.</p>
      </div>

      {/* Info box */}
      <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid #e2e8f0' }}>
        <div className="font-semibold mb-2" style={{ color: 'var(--primary-dark)' }}>Qu'est-ce que l'e-reporting ?</div>
        <div className="text-slate-600 space-y-1">
          <p>Obligatoire dès septembre 2027, l'e-reporting complète l'e-invoicing en couvrant les opérations <strong>non échangées entre assujettis à la TVA</strong> :</p>
          <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-500">
            <li><strong>B2C</strong> — ventes aux particuliers (commerce de détail, caisse)</li>
            <li><strong>International</strong> — opérations avec des entreprises étrangères</li>
          </ul>
          <p className="mt-1">Les données sont agrégées par période et transmises au rythme réglementaire selon le régime de TVA.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Périodes</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>{periods.length}</div>
          <div className="text-xs text-amber-600 mt-1">{pending} à transmettre</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total HT déclaré</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>{formatEur(totalHT)}</div>
          <div className="text-xs text-slate-400 mt-1">{periods.reduce((s, p) => s + p.transactionCount, 0)} transactions</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">TVA DOM collectée</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>{formatEur(totalTVA)}</div>
          <div className="text-xs text-slate-400 mt-1">taux DOM 8,5 % / 2,1 %</div>
        </div>
      </div>

      {/* Periods list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} /></div>
      ) : (
        <div className="space-y-4">
          {periods.map(period => (
            <div key={period.id} className={`bg-white rounded-xl border p-5 ${period.status === 'PENDING' ? 'border-amber-200' : 'border-slate-100'}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: period.type === 'B2C' ? 'rgba(99,102,241,0.1)' : 'rgba(8,145,178,0.1)' }}>
                  {period.type === 'B2C'
                    ? <ShoppingCart className="w-5 h-5 text-indigo-500" />
                    : <Globe className="w-5 h-5 text-cyan-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-700">{period.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: period.type === 'B2C' ? 'rgba(99,102,241,0.1)' : 'rgba(8,145,178,0.1)',
                        color: period.type === 'B2C' ? '#4f46e5' : '#0369a1' }}>
                      {period.type}
                    </span>
                    <StatusBadge status={period.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Transactions</div>
                      <div className="font-semibold text-slate-700">{period.transactionCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Montant HT</div>
                      <div className="font-semibold text-slate-700">{formatEur(period.totalHT)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">TVA DOM</div>
                      <div className="font-semibold text-slate-700">{formatEur(period.totalTVA)}</div>
                    </div>
                  </div>
                  {period.status === 'CONFIRMED' && period.transmittedAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Transmis le {formatDateTime(period.transmittedAt)}
                      {period.dgfipReference && (
                        <span className="ml-1 font-mono text-emerald-500">· Réf. DGFiP : {period.dgfipReference}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {period.status === 'PENDING' && (
                    <button
                      onClick={() => handleTransmit(period.id)}
                      disabled={transmittingId === period.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ background: 'var(--primary)' }}>
                      {transmittingId === period.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Transmission…</>
                        : <><Send className="w-4 h-4" /> Transmettre à la DGFiP</>
                      }
                    </button>
                  )}
                  {period.status === 'TRANSMITTING' && (
                    <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
                      style={{ background: 'rgba(14,124,134,0.1)', color: 'var(--primary)' }}>
                      <Loader2 className="w-4 h-4 animate-spin" /> En cours…
                    </div>
                  )}
                  {period.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
                      style={{ background: 'rgba(26,156,143,0.1)', color: 'var(--success)' }}>
                      <CheckCircle2 className="w-4 h-4" /> Confirmée
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
