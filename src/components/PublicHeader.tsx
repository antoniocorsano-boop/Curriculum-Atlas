import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasSection } from '../types'

const items: Array<[AtlasSection, string]> = [
  ['curriculum', 'Curricolo'],
  ['paths', 'Percorsi'],
  ['materials', 'Materiali'],
  ['map', 'Mappa'],
  ['sources', 'Fonti'],
]

export function PublicHeader() {
  const section = useAtlasStore((state) => state.section)
  const setSection = useAtlasStore((state) => state.setSection)

  return (
    <header className="public-header">
      <button className="public-brand" onClick={() => setSection('home')} aria-label="Curriculum Atlas — Home">
        <span className="brand-mark" aria-hidden="true">CA</span>
        <span>
          <strong>Curriculum Atlas</strong>
          <small>Curricolo · percorsi · materiali</small>
        </span>
      </button>

      <nav className="public-nav" aria-label="Navigazione principale">
        {items.map(([id, label]) => (
          <button
            key={id}
            className={section === id ? 'active' : ''}
            onClick={() => setSection(id)}
            aria-current={section === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
