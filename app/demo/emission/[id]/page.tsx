'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, AlertCircle, XCircle, ArrowLeft, Send, Download,
  Loader2, CheckCheck, Clock,
} from 'lucide-react'
import { Invoice, FiscalCheck, InvoiceStatus, PALifecycleEvent } from '@/lib/types'
import { INVOICE_STATUS_META, formatEur, formatDate, formatDateTime } from '@/lib/utils'

function FiscalBadge({ check }: { check: FiscalCheck }) {
  if (check.severity === 'OK') return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
  if (check.severity === 'WARNING') return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
}

const PA_STEPS: Array<{ status: InvoiceStatus; label: string; detail: string }> = [
  { status: 'DEPOSITED',  label: 'Dépôt sur la Plateforme Agréée', detail: 'Génération du Factur-X XML (EN 16931) + envoi' },
  { status: 'CHECKED',   label: 'Vérifications de fond (PA)', detail: 'Validation schématron, mentions obligatoires 2026' },
  { status: 'DELIVERED', label: 'Transmission au destinataire', detail: "Disponible dans l'espace client du destinataire" },
  { status: 'ACCEPTED',  label: 'Acceptation par le destinataire', detail: 'Cycle de vie complet — archivage automatique' },
]

const STATUS_ORDER: InvoiceStatus[] = ['DEPOSITED', 'CHECKED', 'DELIVERED', 'ACCEPTED']

function getStepIndex(status: InvoiceStatus): number {
  return STATUS_ORDER.indexOf(status)
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [transmitting, setTransmitting] = useState(false)
  const [txError, setTxError] = useState('')
  const [showXml, setShowXml] = useState(false)

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(setInvoice)
  }, [id])

  // Poll for lifecycle updates while in-progress
  useEffect(() => {
    if (!invoice?.transmittedAt) return
    if (['ACCEPTED', 'REJECTED'].includes(invoice.status)) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/invoices/${id}/status`)
      const data = await res.json()
      if (data.updated) {
        setInvoice(prev => prev ? { ...prev, status: data.status, paHistory: data.paHistory } : prev)
      }
      if (['ACCEPTED', 'REJECTED'].includes(data.status)) clearInterval(interval)
    }, 2000)

    return () => clearInterval(interval)
  }, [id, invoice?.transmittedAt, invoice?.status])

  async function handleTransmit() {
    if (!invoice) return
    setTxError('')
    setTransmitting(true)
    try {
      const res = await fetch(`/api/invoices/${id}/transmit`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvoice(data.invoice)
    } catch (e) {
      setTxError((e as Error).message)
    } finally {
      setTransmitting(false)
    }
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const hasErrors = invoice.fiscalChecks.some(c => c.severity === 'ERROR')
  const sm = INVOICE_STATUS_META[invoice.status]
  const inTransit = !['DRAFT', 'VALIDATED', 'ACCEPTED', 'REJECTED'].includes(invoice.status) && !!invoice.transmittedAt
  const isDone = invoice.status === 'ACCEPTED' || invoice.status === 'REJECTED'

  return (
    <div className="p-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/demo/emission" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary-dark)' }}>{invoice.number}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sm.color} ${sm.bg}`}>{sm.label}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {invoice.buyer.name} · {formatDate(invoice.date)} · {formatEur(invoice.totals.totalTTC)} TTC
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: invoice details + fiscal checks */}
        <div className="space-y-5">
          {/* Parties */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--primary-dark)' }}>Parties</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Émetteur</div>
                <div className="font-medium text-slate-700">{invoice.seller.name}</div>
                <div className="text-slate-500">SIREN {invoice.seller.siren}</div>
                {invoice.seller.address && <div className="text-xs text-slate-400 mt-1">{invoice.seller.address}</div>}
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Destinataire</div>
                <div className="font-medium text-slate-700">{invoice.buyer.name}</div>
                <div className="text-slate-500">SIREN {invoice.buyer.siren}</div>
                {invoice.buyer.address && <div className="text-xs text-slate-400 mt-1">{invoice.buyer.address}</div>}
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--primary-dark)' }}>Lignes de facture</h2>
            <div className="space-y-3">
              {invoice.lines.map(line => (
                <div key={line.id} className="text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="text-slate-700">{line.description}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {line.quantity} × {formatEur(line.unitPrice)} ·{' '}
                        <span className="font-medium" style={{ color: 'var(--primary)' }}>
                          {(line.taxRate * 100).toFixed(2).replace('.00', '')} % TVA DOM
                        </span>
                        {line.octroi && (
                          <span className="ml-1 text-amber-600">· OM {formatEur(line.octroi.amount)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold" style={{ color: 'var(--primary-dark)' }}>{formatEur(line.amountTTC)}</div>
                      <div className="text-xs text-slate-400">HT {formatEur(line.amountHT)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-sm space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Total HT</span><span>{formatEur(invoice.totals.totalHT)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TVA DOM</span><span>{formatEur(invoice.totals.totalTVA)}</span>
              </div>
              {invoice.totals.totalOctroi > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Octroi de mer</span><span>{formatEur(invoice.totals.totalOctroi)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t border-slate-100" style={{ color: 'var(--primary-dark)' }}>
                <span>Total TTC</span><span>{formatEur(invoice.totals.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Fiscal checks */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--primary-dark)' }}>
              Validation fiscale — TVA DOM & conformité 2026
            </h2>
            {invoice.fiscalChecks.length === 0 ? (
              <p className="text-slate-400 text-sm">Aucune vérification effectuée.</p>
            ) : (
              <ul className="space-y-2.5">
                {invoice.fiscalChecks.map(c => (
                  <li key={c.id} className="flex items-start gap-2.5 text-sm">
                    <FiscalBadge check={c} />
                    <div>
                      <div className={`font-medium ${c.severity === 'OK' ? 'text-slate-700' : c.severity === 'WARNING' ? 'text-amber-700' : 'text-red-700'}`}>
                        {c.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: transmission + lifecycle */}
        <div className="space-y-5">
          {/* Transmit action */}
          {invoice.status === 'DRAFT' && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--primary-dark)' }}>Transmettre via Plateforme Agréée</h2>
              {hasErrors ? (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
                  <strong>Blocage :</strong> {invoice.fiscalChecks.filter(c => c.severity === 'ERROR').length} erreur(s) fiscale(s) à corriger avant transmission.
                </div>
              ) : (
                <div className="p-3 rounded-lg text-sm mb-4"
                  style={{ background: 'rgba(26,156,143,0.08)', border: '1px solid rgba(26,156,143,0.2)', color: 'var(--success)' }}>
                  ✓ La facture est conforme — prête pour transmission
                </div>
              )}
              {txError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4">{txError}</div>}
              <div className="space-y-2 text-sm text-slate-500 mb-5">
                <div className="flex items-center gap-2"><CheckCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Génération du Factur-X (CII EN 16931)</div>
                <div className="flex items-center gap-2"><CheckCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Validation schématron</div>
                <div className="flex items-center gap-2"><CheckCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Envoi à la PA partenaire (simulation)</div>
                <div className="flex items-center gap-2"><CheckCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Cycle de vie automatique</div>
              </div>
              <button
                onClick={handleTransmit}
                disabled={transmitting || hasErrors}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: 'var(--primary)' }}>
                {transmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {transmitting ? 'Transmission en cours…' : 'Valider et transmettre'}
              </button>
            </div>
          )}

          {/* PA Lifecycle */}
          {invoice.transmittedAt && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm" style={{ color: 'var(--primary-dark)' }}>Cycle de vie — Plateforme Agréée</h2>
                {invoice.paReference && (
                  <span className="text-xs font-mono text-slate-400">{invoice.paReference}</span>
                )}
              </div>

              <div className="space-y-3">
                {PA_STEPS.map((step, i) => {
                  const event = invoice.paHistory.find(e => e.status === step.status)
                  const currentIdx = getStepIndex(invoice.status)
                  const isReached = event !== undefined
                  const isCurrent = invoice.status === step.status && inTransit
                  const isRejected = invoice.status === 'REJECTED'

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isRejected && i === getStepIndex(invoice.status)
                            ? 'bg-red-500 text-white'
                            : isReached
                            ? 'text-white'
                            : isCurrent
                            ? 'text-white animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`} style={isReached ? { background: 'var(--success)' } : isCurrent ? { background: 'var(--primary)' } : {}}>
                          {isReached ? '✓' : isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : i + 1}
                        </div>
                        {i < PA_STEPS.length - 1 && (
                          <div className="w-0.5 h-6 mt-1" style={{ background: isReached ? 'var(--success)' : '#e2e8f0' }} />
                        )}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className={`text-sm font-medium ${isReached ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</div>
                        <div className="text-xs text-slate-400">{event ? formatDateTime(event.timestamp) : step.detail}</div>
                        {event?.detail && <div className="text-xs text-slate-500 mt-0.5">{event.detail}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {invoice.status === 'ACCEPTED' && (
                <div className="mt-4 p-3 rounded-lg text-sm"
                  style={{ background: 'rgba(26,156,143,0.08)', border: '1px solid rgba(26,156,143,0.2)', color: 'var(--success)' }}>
                  ✓ Facture acceptée et archivée automatiquement
                </div>
              )}
              {invoice.status === 'REJECTED' && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  ✗ Facture rejetée — voir le détail ci-dessus
                </div>
              )}
              {inTransit && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Mise à jour automatique du statut en cours…
                </div>
              )}
            </div>
          )}

          {/* Factur-X download */}
          {invoice.facturxXml && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--primary-dark)' }}>Factur-X généré</h2>
              <p className="text-xs text-slate-500 mb-3">XML CII EN 16931 — profil standard Factur-X 1.0. Ce fichier est embarqué dans un PDF/A-3 pour l'archivage légal.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowXml(!showXml)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
                  <Download className="w-3.5 h-3.5" />
                  {showXml ? 'Masquer le XML' : 'Voir le XML'}
                </button>
              </div>
              {showXml && (
                <pre className="mt-3 p-3 rounded-lg bg-slate-900 text-slate-300 text-xs overflow-auto max-h-48 leading-relaxed">
                  {invoice.facturxXml}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
