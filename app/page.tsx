'use client'
import Link from 'next/link'
import { ArrowRight, CheckCircle, FileText, Send, Shield, TrendingUp, Zap } from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Import PDF intelligent', desc: "Déposez vos factures existantes. L'IA extrait les données et pré-remplit le formulaire de conformité en quelques secondes." },
  { icon: Shield, title: 'Validation fiscale DOM', desc: 'Contrôle automatique des taux TVA 8,5 %/2,1 %, exonérations art. 295 CGI et octroi de mer propres à La Réunion.' },
  { icon: Send, title: 'Transmission Plateforme Agréée', desc: "Envoi via notre PA partenaire immatriculée DGFiP. Suivi du cycle de vie en temps réel jusqu'à l'acceptation." },
  { icon: TrendingUp, title: 'E-reporting B2C', desc: "Transmission automatique des données de ventes aux particuliers et à l'international au rythme réglementaire." },
  { icon: Zap, title: 'Archivage légal 10 ans', desc: 'Conservation des originaux structurés (Factur-X) avec intégrité garantie, hébergement UE.' },
  { icon: CheckCircle, title: 'Score de conformité', desc: "Tableau de bord avec score live et checklist de préparation pour l'échéance de septembre 2027." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--primary-dark)' }}>
            PassFact<span style={{ color: 'var(--accent)' }}>974</span>
          </span>
        </div>
        <Link href="/demo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}>
          Démo interactive <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #0b2e4a 0%, #0e5e6e 60%, #0e7c86 100%)' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-sm font-medium"
          style={{ background: 'rgba(244,169,60,0.15)', color: 'var(--accent)', border: '1px solid rgba(244,169,60,0.3)' }}>
          ⏰ Obligation PME : 1er septembre 2027 — Préparez-vous maintenant
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl mb-6">
          La passerelle de conformité pour les{' '}
          <span style={{ color: 'var(--accent)' }}>PME réunionnaises</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
          Déposez vos factures PDF habituelles. PassFact974 les transforme en factures électroniques conformes,
          valide les spécificités fiscales de La Réunion et les transmet via une Plateforme Agréée immatriculée DGFiP.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform"
            style={{ background: 'var(--accent)' }}>
            Tester la démo <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="mailto:neotechno.ingenierie@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-lg text-white"
            style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
            Nous contacter
          </a>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold mb-8" style={{ color: 'var(--primary-dark)' }}>
            Calendrier réglementaire — La Réunion soumise aux mêmes dates que la métropole
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-5 border-t-4 bg-white border-slate-200">
              <div className="font-bold text-lg mb-2" style={{ color: 'var(--primary-dark)' }}>1er sept. 2026</div>
              <p className="text-slate-600 text-sm">Toutes les entreprises doivent pouvoir recevoir des factures électroniques</p>
            </div>
            <div className="rounded-xl p-5 border-t-4 bg-amber-50 border-amber-400">
              <div className="font-bold text-lg mb-2 text-amber-700">1er sept. 2027</div>
              <p className="text-slate-600 text-sm">PME / TPE : obligation d'émettre et de transmettre l'e-reporting</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-800">Votre prochaine échéance</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-2" style={{ color: 'var(--primary-dark)' }}>Tout ce dont une PME réunionnaise a besoin</h2>
          <p className="text-center text-slate-500 mb-10">Sans changer vos outils actuels</p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--surface)' }}>
                  <f.icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--primary-dark)' }}>{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Prêt à voir PassFact974 en action ?</h2>
        <p className="text-slate-500 mb-6">La démo simule le parcours complet : dépôt PDF → Factur-X → Plateforme Agréée → e-reporting</p>
        <Link href="/demo"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}>
          Lancer la démo interactive <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="py-6 px-6 text-center text-xs text-slate-400 border-t border-slate-100">
        PassFact974 · Neotechno Ingénierie · La Réunion · neotechno.ingenierie@gmail.com
      </footer>
    </div>
  )
}
