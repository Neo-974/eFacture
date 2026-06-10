'use client'
import { useEffect, useState } from 'react'
import { Check, X, AlertTriangle, FileText, Clock, Loader2 } from 'lucide-react'
import { ReceivedInvoice, ReceivedStatus } from '@/lib/types'
import { RECEIVED_STATUS_META, formatEur, formatDate, formatDateTime } from '@/lib/utils'

function StatusBadge({ status }: { status: ReceivedStatus }) {
  const m = RECEIVED_STATUS_META[status]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>{m.label}</span>
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export default function ReceptionPage() {
  const [invoices, setInvoices] = useState<ReceivedInvoice[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/reception')
    setInvoices(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAction(id: string, action: ReceivedStatus, notes?: string) {
    setActionId(id)
    await fetch(`/api/reception/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    })
    await load()
    setActionId(null)
  }

  const filtered = invoices.filter(i => filter === 'ALL' || i.status === filter)
  const pending = invoices.filter(i => i.status === 'PENDING').length

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-dark)' }}>Réception fournisseurs</h1>
        <p className="text-slate-500 text-sm">Factures électroniques reçues via la Plateforme Agréée.</p>
      </div>

      {pending > 0 && (
        <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-amber-700">{pending} facture(s) en attente</span>
            <span className="text-amber-600"> — À approuver ou refuser avant la date d'échéance</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as Filter[]).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
            style={filter === f ? { background: 'var(--primary)' } : {}}>
            {f === 'ALL' ? 'Toutes' : f === 'PENDING' ? 'À traiter' : f === 'APPROVED' ? 'Approuvées' : 'Refusées'}
            {f === 'PENDING' && pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Aucune facture dans cette catégorie</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <div key={inv.id} className={`bg-white rounded-xl border p-5 transition-all ${
              inv.status === 'PENDING' ? 'border-amber-200 hover:border-amber-300' : 'border-slate-100'
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-700">{inv.senderName}</span>
                    <StatusBadge status={inv.status} />
                    {inv.facturxAvailable && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">Factur-X</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mb-1">
                    N° {inv.number} · SIREN {inv.senderSiren}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Facture du {formatDate(inv.date)}</span>
                    <span>Reçue le {formatDateTime(inv.receivedAt)}</span>
                    {inv.processedAt && <span>Traitée le {formatDateTime(inv.processedAt)}</span>}
                  </div>
                  {inv.notes && (
                    <div className="mt-2 text-xs text-slate-500 italic">{inv.notes}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>{formatEur(inv.amountTTC)}</div>
                  <div className="text-xs text-slate-400">HT {formatEur(inv.amountHT)}</div>
                </div>
              </div>

              {inv.status === 'PENDING' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => handleAction(inv.id, 'APPROVED')}
                    disabled={actionId === inv.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: 'var(--success)' }}>
                    {actionId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approuver
                  </button>
                  <button
                    onClick={() => handleAction(inv.id, 'REJECTED', 'Erreur de montant — voir détail')}
                    disabled={actionId === inv.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 border border-red-200 text-red-600 transition-colors disabled:opacity-50">
                    <X className="w-4 h-4" /> Refuser
                  </button>
                  <button
                    onClick={() => handleAction(inv.id, 'DISPUTED', 'Montant en litige — en attente de vérification fournisseur')}
                    disabled={actionId === inv.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 border border-amber-200 text-amber-600 transition-colors disabled:opacity-50">
                    <AlertTriangle className="w-4 h-4" /> Litige
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {([
          { label: 'Total reçues', value: invoices.length, color: 'var(--primary)' },
          { label: 'À traiter', value: invoices.filter(i => i.status === 'PENDING').length, color: '#f59e0b' },
          { label: 'Approuvées', value: invoices.filter(i => i.status === 'APPROVED').length, color: 'var(--success)' },
          { label: 'Montant total', value: formatEur(invoices.reduce((s, i) => s + i.amountTTC, 0)), color: 'var(--primary-dark)' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
