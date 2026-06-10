'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Upload, FileText, Plus, Loader2, CheckCircle2, Eye, ArrowRight } from 'lucide-react'
import { Invoice } from '@/lib/types'
import { INVOICE_STATUS_META, formatEur, formatDate } from '@/lib/utils'

type ExtractionStep = 'idle' | 'reading' | 'extracting' | 'checking' | 'done'

const STEPS: Record<ExtractionStep, string> = {
  idle: '',
  reading: 'Lecture du PDF en cours…',
  extracting: "Extraction des données par IA…",
  checking: 'Validation fiscale TVA DOM…',
  done: 'Extraction terminée !',
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const m = INVOICE_STATUS_META[status]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>{m.label}</span>
}

export default function EmissionPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [step, setStep] = useState<ExtractionStep>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/demo/state').then(r => r.json()).then(d => setInvoices(d.invoices ?? []))
  }, [])

  async function processUpload(file: File | null, useSample = false) {
    setError('')
    setStep('reading')
    await new Promise(r => setTimeout(r, 800))
    setStep('extracting')
    await new Promise(r => setTimeout(r, 1200))
    setStep('checking')

    const fd = new FormData()
    if (file) fd.append('file', file)
    fd.append('useSample', String(useSample || !file))

    try {
      const res = await fetch('/api/invoices/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Erreur lors du traitement')
      const data = await res.json()
      setStep('done')
      await new Promise(r => setTimeout(r, 600))
      router.push(`/demo/emission/${data.invoiceId}`)
    } catch (e) {
      setError((e as Error).message)
      setStep('idle')
    }
  }

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) processUpload(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: step !== 'idle',
  })

  const isProcessing = step !== 'idle' && step !== 'done'

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-dark)' }}>Émettre une facture</h1>
        <p className="text-slate-500 text-sm">Importez votre facture PDF habituelle — PassFact974 s'occupe du reste.</p>
      </div>

      {/* Upload area */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-primary bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
          } ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
          style={{ borderColor: isDragActive ? 'var(--primary)' : undefined }}>
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{STEPS[step]}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)', width: step === 'reading' ? '30%' : step === 'extracting' ? '65%' : '90%', transition: 'width 0.5s' }} />
              </div>
            </div>
          ) : step === 'done' ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
              <p className="text-sm font-medium text-emerald-700">Traitement réussi, redirection…</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600 mb-1">
                {isDragActive ? 'Déposez votre PDF ici' : 'Glissez-déposez un PDF de facture'}
              </p>
              <p className="text-sm text-slate-400">ou cliquez pour sélectionner</p>
              <p className="text-xs text-slate-300 mt-3">Formats : PDF · Taille max : 10 Mo</p>
            </>
          )}
        </div>

        {/* Sample invoice */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--surface)' }}>
            <Plus className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--primary-dark)' }}>Facture de démo</h3>
          <p className="text-sm text-slate-500 mb-5">Simulez le dépôt sans avoir de PDF — données pré-remplies réalistes avec TVA DOM et octroi de mer.</p>
          <button
            onClick={() => processUpload(null, true)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            <FileText className="w-4 h-4" />
            Utiliser une facture de démo
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Invoice list */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--primary-dark)' }}>
          Factures émises ({invoices.length})
        </h2>
        {invoices.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Aucune facture émise pour le moment</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100" style={{ background: 'var(--surface)' }}>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Facture</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Montant TTC</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{inv.number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700 truncate max-w-[180px]">{inv.buyer.name}</div>
                      <div className="text-xs text-slate-400">SIREN {inv.buyer.siren}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(inv.date)}</td>
                    <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--primary-dark)' }}>{formatEur(inv.totals.totalTTC)}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-4">
                      <Link href={`/demo/emission/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        style={{ color: 'var(--primary)' }}>
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
