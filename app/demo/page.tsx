'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, FileText, Inbox, BarChart3, AlertCircle, TrendingUp } from 'lucide-react'
import { DemoState, InvoiceStatus } from '@/lib/types'
import { INVOICE_STATUS_META, formatEur, formatDateTime } from '@/lib/utils'

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const m = INVOICE_STATUS_META[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>{m.label}</span>
}

const CHECKLIST = [
  { done: true,  label: 'SIREN renseigné sur toutes les factures' },
  { done: true,  label: 'Taux TVA DOM configurés (8,5 % / 2,1 %)' },
  { done: true,  label: 'Connexion Plateforme Agréée active' },
  { done: true,  label: 'Réception des factures fournisseurs activée' },
  { done: false, label: 'Partenaire PA signé (en cours de négociation)' },
  { done: false, label: 'Achat des domaines passfact974.re / .fr' },
  { done: false, label: 'Bêta test avec 5 PME réunionnaises' },
]

export default function DashboardPage() {
  const [state, setState] = useState<DemoState | null>(null)

  useEffect(() => {
    fetch('/api/demo/state').then(r => r.json()).then(setState)
  }, [])

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const emitted = state.invoices.filter(i => i.status !== 'DRAFT').length
  const accepted = state.invoices.filter(i => i.status === 'ACCEPTED').length
  const pendingReceived = state.receivedInvoices.filter(r => r.status === 'PENDING').length
  const pendingEreporting = state.ereporting.filter(e => e.status === 'PENDING').length
  const score = Math.round((CHECKLIST.filter(c => c.done).length / CHECKLIST.length) * 100)

  // Build activity feed
  const activity = [
    ...state.invoices
      .filter(i => i.paHistory.length > 0)
      .flatMap(i => i.paHistory.map(e => ({ label: `${i.number} — ${e.label}`, ts: e.timestamp, type: 'invoice' as const, status: e.status }))),
    ...state.receivedInvoices
      .filter(r => r.processedAt)
      .map(r => ({ label: `${r.senderName} (${r.number}) — ${r.status === 'APPROVED' ? 'Approuvée' : 'Traitée'}`, ts: r.processedAt!, type: 'received' as const, status: r.status })),
    ...state.ereporting
      .filter(e => e.transmittedAt)
      .map(e => ({ label: `E-reporting ${e.label} — Confirmé DGFiP`, ts: e.transmittedAt!, type: 'ereporting' as const, status: 'CONFIRMED' })),
  ].sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6)

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-dark)' }}>
          Tableau de bord
        </h1>
        <p className="text-slate-500 text-sm">{state.company.name} · {state.company.address}</p>
      </div>

      {/* Compliance alert */}
      <div className="mb-6 rounded-xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(244,169,60,0.08)', border: '1px solid rgba(244,169,60,0.25)' }}>
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--primary-dark)' }}>
            Obligation d&apos;émission PME : 1er septembre 2027
          </div>
          <div className="text-sm text-slate-600 mt-0.5">
            Vous êtes en cours de préparation. Score de conformité actuel : <strong>{score}%</strong>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Factures émises', value: emitted, sub: `${accepted} acceptées`, icon: FileText, color: 'var(--primary)', href: '/demo/emission' },
          { label: 'Factures reçues', value: state.receivedInvoices.length, sub: `${pendingReceived} à traiter`, icon: Inbox, color: '#6366f1', href: '/demo/reception', badge: pendingReceived },
          { label: 'E-reporting', value: state.ereporting.length, sub: `${pendingEreporting} à transmettre`, icon: BarChart3, color: '#0891b2', href: '/demo/ereporting', badge: pendingEreporting },
          { label: 'Score conformité', value: `${score}%`, sub: 'Objectif 100% avant 2027', icon: TrendingUp, color: score >= 80 ? 'var(--success)' : '#f59e0b', href: '#' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="block">
            <div className="rounded-xl p-5 bg-white border border-slate-100 hover:shadow-sm transition-shadow relative">
              {s.badge ? <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{s.badge}</span> : null}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--primary-dark)' }}>{s.value}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--primary-dark)' }}>Activité récente</h2>
          {activity.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune activité pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: a.status === 'ACCEPTED' || a.status === 'APPROVED' || a.status === 'CONFIRMED' ? 'var(--success)' : a.status === 'REJECTED' ? '#ef4444' : 'var(--primary)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-700 truncate">{a.label}</div>
                    <div className="text-xs text-slate-400">{formatDateTime(a.ts)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="font-semibold mb-1 text-sm" style={{ color: 'var(--primary-dark)' }}>Checklist de conformité 2027</h2>
          <div className="text-xs text-slate-400 mb-4">{CHECKLIST.filter(c => c.done).length}/{CHECKLIST.length} étapes complètes</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: 'var(--success)' }} />
          </div>
          <ul className="space-y-2.5">
            {CHECKLIST.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                {c.done
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                }
                <span className={c.done ? 'text-slate-700' : 'text-amber-700'}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { href: '/demo/emission', label: 'Nouvelle facture', icon: FileText, desc: 'Importer un PDF et transmettre' },
          { href: '/demo/reception', label: `${pendingReceived} facture(s) à traiter`, icon: Inbox, desc: 'Approuver ou refuser' },
          { href: '/demo/ereporting', label: `${pendingEreporting} e-reporting à transmettre`, icon: BarChart3, desc: 'Données B2C décembre 2025' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm hover:border-slate-200 transition-all">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface)' }}>
              <a.icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-slate-700 truncate">{a.label}</div>
              <div className="text-xs text-slate-400">{a.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
