import fixtureJson from '../data/s1-fixture.json'
import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasFixture, AtlasView, StatusFilter } from '../types'

const fixture = fixtureJson as unknown as AtlasFixture
const views: Array<[AtlasView, string]> = [
  ['universe', 'Universe'],
  ['galaxy', 'Galaxy'],
  ['verticale', 'Verticale'],
  ['timeline', 'Timeline'],
]
const filters: Array<[StatusFilter, string]> = [
  ['all', 'Tutti'],
  ['accepted', 'Accettati pilot'],
  ['review', 'Da rivedere'],
]

export function Controls() {
  const view = useAtlasStore((state) => state.view)
  const setView = useAtlasStore((state) => state.setView)
  const query = useAtlasStore((state) => state.query)
  const setQuery = useAtlasStore((state) => state.setQuery)
  const select = useAtlasStore((state) => state.select)
  const statusFilter = useAtlasStore((state) => state.statusFilter)
  const setStatusFilter = useAtlasStore((state) => state.setStatusFilter)

  const normalized = query.toLowerCase().trim()
  const results = normalized.length > 1
    ? [
        ...fixture.nodes
          .filter((node) =>
            (node.label + ' ' + node.theme + ' ' + node.nodeType).toLowerCase().includes(normalized))
          .map((node) => ({ id: node.id, title: node.theme, subtitle: node.label })),
        ...fixture.segments
          .filter((segment) =>
            (segment.grade + ' ' + segment.uda + ' ' + segment.focus).toLowerCase().includes(normalized))
          .map((segment) => ({
            id: segment.id,
            title: segment.grade + ' · UDA ' + segment.uda,
            subtitle: segment.focus,
          })),
      ].slice(0, 7)
    : []

  return (
    <header className="controls">
      <div className="brand">
        <span className="brand-dot" />
        <div><strong>Curriculum Atlas</strong><small>Spatial POC · S1</small></div>
      </div>

      <nav aria-label="Viste dell'atlante">
        {views.map(([id, label]) => (
          <button
            key={id}
            className={view === id ? 'active' : ''}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="search-wrap">
        <label className="sr-only" htmlFor="atlas-search">Cerca nel curriculum</label>
        <input
          id="atlas-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca obiettivo, UDA, tema…"
        />
        {results.length > 0 && (
          <div className="search-results" role="list">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  select(result.id)
                  setQuery('')
                }}
              >
                <strong>{result.title}</strong>
                <span>{result.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="status-filter" aria-label="Filtro stato">
        {filters.map(([id, label]) => (
          <button
            key={id}
            className={statusFilter === id ? 'active' : ''}
            onClick={() => setStatusFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}
