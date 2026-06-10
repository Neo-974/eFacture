import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'PassFact974 — Passerelle de conformité facturation électronique',
  description: 'Mise en conformité des PME réunionnaises avec la facturation électronique obligatoire de 2027',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
