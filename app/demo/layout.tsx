'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  BarChart3, FileText, Home, Inbox, Archive, Settings,
  ChevronLeft, ChevronRight, RotateCcw,
} from 'lucide-react'

const NAV = [
  { href: '/demo', icon: Home, label: 'Tableau de bord' },
  { href: '/demo/emission', icon: FileText, label: 'Émettre' },
  { href: '/demo/reception', icon: Inbox, label: 'Recevoir' },
  { href: '/demo/ereporting', icon: BarChart3, label: 'E-Reporting' },
  { href: '/demo/archivage', icon: Archive, label: 'Archivage', soon: true },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function resetDemo() {
    setResetting(true)
    await fetch('/api/demo/reset', { method: 'POST' })
    window.location.href = '/demo'
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-200 flex-shrink-0"
        style={{
          width: collapsed ? 64 : 240,
          background: '#0b1e30',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <Link href="/demo" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white">
                PassFact<span style={{ color: 'var(--accent)' }}>974</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-md flex items-center justify-center mx-auto" style={{ background: 'var(--primary)' }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Demo badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-2 py-1 rounded text-center text-xs font-semibold"
            style={{ background: 'rgba(244,169,60,0.15)', color: 'var(--accent)', border: '1px solid rgba(244,169,60,0.25)' }}>
            MODE DÉMO
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(item => {
            const isActive = item.href === '/demo' ? pathname === '/demo' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.soon ? '#' : item.href}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  item.soon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
                } ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}
                style={isActive ? { background: 'rgba(14,124,134,0.3)' } : {}}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-1 truncate">
                    {item.label}
                    {item.soon && <span className="ml-1 text-xs opacity-60">bientôt</span>}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div className="mb-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-xs font-semibold text-white truncate">Réunion Import & Services</div>
              <div className="text-xs text-slate-500 mt-0.5">SIREN 123 456 789 · La Réunion</div>
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--success)' }}>● TVA DOM 8,5 %</div>
            </div>
          )}
          <button
            onClick={resetDemo}
            disabled={resetting}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            title="Réinitialiser la démo">
            <RotateCcw className={`w-4 h-4 flex-shrink-0 ${resetting ? 'animate-spin' : ''}`} />
            {!collapsed && <span>{resetting ? 'Réinit…' : 'Réinitialiser'}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
