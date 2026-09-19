import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasSection } from '../types'

const primaryItems: Array<[AtlasSection, string]> = [
  ['curriculum', 'Curricolo'],
  ['paths', 'Percorsi'],
  ['materials', 'Materiali'],
  ['map', 'Mappa'],
]

const desktopItems: Array<[AtlasSection, string]> = [
  ...primaryItems,
  ['sources', 'Fonti'],
]

export function PublicHeader() {
  const section = useAtlasStore((state) => state.section)
  const setSection = useAtlasStore((state) => state.setSection)

  const renderItem = ([id, label]: [AtlasSection, string]) => (
    <button
      key={id}
      className={section === id ? 'active' : ''}
      onClick={() => setSection(id)}
      aria-current={section === id ? 'page' : undefined}
    >
      {label}
    </button>
  )

  return (
    <header className="public-header">
      <button className="public-brand" onClick={() => setSection('home')} aria-label="Curriculum Atlas — Home">
        <span className="brand-mark" aria-hidden="true">CA</span>
        <span>
          <strong>Curriculum Atlas</strong>
          <small>Curricolo · percorsi · materiali</small>
        </span>
      </button>

      <nav className="public-nav desktop-nav" aria-label="Navigazione principale">
        {desktopItems.map(renderItem)}
      </nav>

      <button
        className={'mobile-sources' + (section === 'sources' ? ' active' : '')}
        onClick={() => setSection('sources')}
        aria-current={section === 'sources' ? 'page' : undefined}
        aria-label="Apri Fonti e provenienza"
      >
        Fonti
      </button>

      <nav className="public-nav mobile-nav" aria-label="Navigazione principale mobile">
        {primaryItems.map(renderItem)}
      </nav>
    </header>
  )
}
