import { useEffect, useState } from 'react'
import { AccessibleMirror } from './AccessibleMirror'
import { AtlasScene } from './AtlasScene'
import { Controls } from './Controls'
import { Inspector } from './Inspector'

export default function MapExperience() {
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
    <main className="map-experience" aria-label="Mappa intelligente del Curriculum Atlas">
      <Controls />
      <div className="scene-shell"><AtlasScene reducedMotion={reducedMotion} /></div>
      <div className="legend" aria-hidden="true">
        <span><i className="dot accepted" /> fonte pilot</span>
        <span><i className="dot review" /> da rivedere</span>
        <span><i className="bar ready" /> proposta review-ready</span>
        <span><i className="bar blocked" /> raccordo bloccato</span>
      </div>
      <div className="helper">
        <strong>Una vista avanzata, non l'unica via.</strong>
        <span>Trascina · zoom · seleziona. Tutti i dati restano accessibili anche in HTML.</span>
      </div>
      <button className="mirror-toggle" onClick={() => setShowMirror((v) => !v)} aria-expanded={showMirror}>
        {showMirror ? 'Chiudi elenco accessibile' : 'Esplora come elenco'}
      </button>
      {showMirror && <AccessibleMirror />}
      <Inspector />
    </main>
  )
}
