export type TaxCategory =
  | 'DOM_85'    // TVA DOM taux normal 8.5%
  | 'DOM_21'    // TVA DOM taux réduit 2.1%
  | 'DOM_175'   // TVA DOM taux particulier 1.75%
  | 'DOM_105'   // TVA DOM taux particulier 1.05%
  | 'EXEMPT'    // Exonération art. 295 CGI
  | 'STANDARD_20' // Métropole 20% (warning in DOM context)
  | 'STANDARD_10' // Métropole 10% (warning in DOM context)

export const TAX_RATES: Record<TaxCategory, number> = {
  DOM_85: 0.085,
  DOM_21: 0.021,
  DOM_175: 0.0175,
  DOM_105: 0.0105,
  EXEMPT: 0,
  STANDARD_20: 0.20,
  STANDARD_10: 0.10,
}

export const TAX_LABELS: Record<TaxCategory, string> = {
  DOM_85: 'TVA DOM 8,5 %',
  DOM_21: 'TVA DOM 2,1 %',
  DOM_175: 'TVA DOM 1,75 %',
  DOM_105: 'TVA DOM 1,05 %',
  EXEMPT: 'Exonéré art. 295 CGI',
  STANDARD_20: 'TVA 20 % ⚠ non DOM',
  STANDARD_10: 'TVA 10 % ⚠ non DOM',
}

export interface Party {
  name: string
  siren: string
  siret?: string
  address?: string
  vatNumber?: string
}

export interface OctroisDeMer {
  amount: number
  rate: number
  type: 'OM' | 'OMR'
}

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxCategory: TaxCategory
  taxRate: number
  amountHT: number
  taxAmount: number
  amountTTC: number
  octroi?: OctroisDeMer
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'TRANSMITTING'
  | 'DEPOSITED'
  | 'CHECKED'
  | 'DELIVERED'
  | 'ACCEPTED'
  | 'REJECTED'

export interface PALifecycleEvent {
  status: InvoiceStatus
  label: string
  timestamp: string
  detail?: string
}

export type FiscalSeverity = 'OK' | 'WARNING' | 'ERROR'

export interface FiscalCheck {
  id: string
  label: string
  severity: FiscalSeverity
  detail: string
}

export interface InvoiceTotals {
  totalHT: number
  totalTVA: number
  totalOctroi: number
  totalTTC: number
  taxBreakdown: Array<{ category: TaxCategory; base: number; rate: number; amount: number }>
}

export interface Invoice {
  id: string
  number: string
  status: InvoiceStatus
  seller: Party
  buyer: Party
  lines: InvoiceLine[]
  totals: InvoiceTotals
  date: string
  dueDate?: string
  object?: string
  fiscalChecks: FiscalCheck[]
  facturxXml?: string
  paReference?: string
  paHistory: PALifecycleEvent[]
  transmittedAt?: string
  createdAt: string
  updatedAt: string
  isDemo?: boolean // if seeded from demo data
}

export type ReceivedStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED'

export interface ReceivedInvoice {
  id: string
  number: string
  senderName: string
  senderSiren: string
  date: string
  amountHT: number
  amountTTC: number
  taxCategory: TaxCategory
  status: ReceivedStatus
  receivedAt: string
  processedAt?: string
  notes?: string
  facturxAvailable: boolean
}

export type EReportingType = 'B2C' | 'INTERNATIONAL'
export type EReportingStatus = 'PENDING' | 'TRANSMITTING' | 'TRANSMITTED' | 'CONFIRMED'

export interface EReportingPeriod {
  id: string
  period: string // YYYY-MM
  label: string  // "Mai 2026"
  type: EReportingType
  transactionCount: number
  totalHT: number
  totalTVA: number
  status: EReportingStatus
  transmittedAt?: string
  dgfipReference?: string
  createdAt: string
}

export interface DemoCompany {
  name: string
  siren: string
  siret: string
  address: string
  territory: 'REUNION' | 'GUADELOUPE' | 'MARTINIQUE' | 'METROPOLE'
  vatRegime: 'DOM' | 'STANDARD' | 'EXEMPT'
  activity: string
}

export interface DemoState {
  company: DemoCompany
  invoices: Invoice[]
  receivedInvoices: ReceivedInvoice[]
  ereporting: EReportingPeriod[]
  lastReset: string
}
