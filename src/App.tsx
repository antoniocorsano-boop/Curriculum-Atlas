import { useEffect, useState } from 'react'
import { AccessibleMirror } from './components/AccessibleMirror'
import { AtlasScene } from './components/AtlasScene'
import { Controls } from './components/Controls'
import { Inspector } from './components/Inspector'
import './styles.css'

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showMirror, setShowMirror] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <main className="app-shell">
      <Controls />
      <div className="scene-shell"><AtlasScene reducedMotion={reducedMotion} /></div>
      <div className="legend" aria-hidden="true">
        <span><i className="dot accepted" /> fonte pilot</span>
        <span><i className="dot review" /> da rivedere</span>
        <span><i className="bar ready" /> proposta review-ready</span>
        <span><i className="bar blocked" /> raccordo bloccato</span>
      </div>
      <div className="helper">
        <strong>Un unico spazio, più letture.</strong>
        <span>Trascina per orientarti · rotella/pinch per zoom · tocca un nodo per il dettaglio.</span>
      </div>
      <button className="mirror-toggle" onClick={() => setShowMirror((v) => !v)} aria-expanded={showMirror}>
        {showMirror ? 'Chiudi elenco accessibile' : 'Esplora come elenco'}
      </button>
      {showMirror && <AccessibleMirror />}
      <Inspector />
    </main>
  )
}
