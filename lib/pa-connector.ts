import { Invoice, InvoiceStatus, PALifecycleEvent } from './types'

// Simulated PA lifecycle timing (ms from transmittedAt)
const LIFECYCLE_DELAYS: Array<{ ms: number; status: InvoiceStatus; label: string; detail?: string }> = [
  { ms: 0,     status: 'DEPOSITED', label: 'Facture déposée sur la Plateforme Agréée', detail: 'Référence PA générée' },
  { ms: 4000,  status: 'CHECKED',   label: 'Vérifications de fond effectuées', detail: 'Format EN 16931 validé, mentions obligatoires OK' },
  { ms: 10000, status: 'DELIVERED', label: 'Transmise au destinataire', detail: 'Facture disponible dans l\'espace client du destinataire' },
  { ms: 20000, status: 'ACCEPTED',  label: 'Acceptée par le destinataire ✓', detail: 'Cycle de vie complet — archivage automatique' },
]

// Rejection scenario (for demo invoice DEMO-2025-002)
const REJECTION_DELAYS: Array<{ ms: number; status: InvoiceStatus; label: string; detail?: string }> = [
  { ms: 0,    status: 'DEPOSITED', label: 'Facture déposée sur la Plateforme Agréée' },
  { ms: 4000, status: 'REJECTED',  label: 'Rejetée par la Plateforme Agréée', detail: 'Erreur : mention de TVA incohérente détectée (simulation de rejet pour la démo)' },
]

export function generatePAReference(): string {
  const prefix = 'PA-RUN'
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${ts}-${rand}`
}

export function computeCurrentPAStatus(invoice: Invoice): {
  currentStatus: InvoiceStatus
  newEvents: PALifecycleEvent[]
} {
  if (!invoice.transmittedAt) return { currentStatus: invoice.status, newEvents: [] }

  const elapsed = Date.now() - new Date(invoice.transmittedAt).getTime()
  // Use rejection scenario for invoices that have "REJET" in their number (demo)
  const useRejection = invoice.number.includes('REJET')
  const timeline = useRejection ? REJECTION_DELAYS : LIFECYCLE_DELAYS

  // Determine the highest milestone reached
  let latestReached = timeline[0]
  for (const milestone of timeline) {
    if (elapsed >= milestone.ms) latestReached = milestone
  }

  // Compute which events are new (not yet in paHistory)
  const existingStatuses = new Set(invoice.paHistory.map(e => e.status))
  const newEvents: PALifecycleEvent[] = []

  for (const milestone of timeline) {
    if (elapsed >= milestone.ms && !existingStatuses.has(milestone.status)) {
      newEvents.push({
        status: milestone.status,
        label: milestone.label,
        timestamp: new Date(new Date(invoice.transmittedAt).getTime() + milestone.ms).toISOString(),
        detail: milestone.detail,
      })
    }
  }

  return { currentStatus: latestReached.status, newEvents }
}

export function initiateTransmission(invoice: Invoice, paReference: string): Invoice {
  const now = new Date().toISOString()
  return {
    ...invoice,
    status: 'DEPOSITED',
    paReference,
    transmittedAt: now,
    paHistory: [
      {
        status: 'DEPOSITED',
        label: 'Facture déposée sur la Plateforme Agréée',
        timestamp: now,
        detail: `Référence PA : ${paReference}`,
      },
    ],
    updatedAt: now,
  }
}
