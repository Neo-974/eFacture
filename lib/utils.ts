import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { InvoiceStatus, ReceivedStatus, EReportingStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  DRAFT:        { label: 'Brouillon',         color: 'text-gray-600',     bg: 'bg-gray-100' },
  VALIDATED:    { label: 'Validée',           color: 'text-blue-700',     bg: 'bg-blue-100' },
  TRANSMITTING: { label: 'Transmission…',     color: 'text-yellow-700',   bg: 'bg-yellow-100' },
  DEPOSITED:    { label: 'Déposée (PA)',       color: 'text-cyan-700',     bg: 'bg-cyan-100' },
  CHECKED:      { label: 'Vérifiée (PA)',      color: 'text-indigo-700',   bg: 'bg-indigo-100' },
  DELIVERED:    { label: 'Livrée au client',  color: 'text-purple-700',   bg: 'bg-purple-100' },
  ACCEPTED:     { label: 'Acceptée ✓',        color: 'text-emerald-700',  bg: 'bg-emerald-100' },
  REJECTED:     { label: 'Rejetée',           color: 'text-red-700',      bg: 'bg-red-100' },
}

export const RECEIVED_STATUS_META: Record<ReceivedStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'À traiter',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
  APPROVED:  { label: 'Approuvée', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  REJECTED:  { label: 'Refusée',   color: 'text-red-700',     bg: 'bg-red-100' },
  DISPUTED:  { label: 'Litige',    color: 'text-orange-700',  bg: 'bg-orange-100' },
}

export const EREPORTING_STATUS_META: Record<EReportingStatus, { label: string; color: string; bg: string }> = {
  PENDING:      { label: 'À transmettre',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  TRANSMITTING: { label: 'Transmission…',  color: 'text-blue-700',   bg: 'bg-blue-100' },
  TRANSMITTED:  { label: 'Transmise',       color: 'text-indigo-700', bg: 'bg-indigo-100' },
  CONFIRMED:    { label: 'Confirmée DGFiP', color: 'text-emerald-700',bg: 'bg-emerald-100' },
}
