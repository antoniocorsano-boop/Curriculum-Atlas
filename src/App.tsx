import { lazy, Suspense, useMemo } from 'react'
import fixtureJson from './data/s1-fixture.json'
import p1Json from './data/p1-learning-objects.json'
import { MaterialsHub } from './components/MaterialsHub'
import { PublicHeader } from './components/PublicHeader'
import { useAtlasStore } from './store/useAtlasStore'
import type { AtlasFixture, P1Fixture } from './types'
import './styles.css'

const MapExperience = lazy(() => import('./components/MapExperience'))
const fixture = fixtureJson as unknown as AtlasFixture
const p1 = p1Json as unknown as P1Fixture

export default function App() {
  const section = useAtlasStore((state) => state.section)
  const setSection = useAtlasStore((state) => state.setSection)
  const select = useAtlasStore((state) => state.select)

  const themes = useMemo(() => {
    const map = new Map<string, typeof fixture.nodes>()
    for (const node of fixture.nodes) {
      const items = map.get(node.theme) ?? []
      items.push(node)
      map.set(node.theme, items)
    }
    return [...map.entries()]
  }, [])

  return (
    <div className="public-app">
      <PublicHeader />

      {section === 'home' && (
        <main className="page-section home-page">
          <section className="hero">
            <p className="kicker">Curriculum Atlas · pilot read-only</p>
            <h1>Il curricolo diventa una mappa di lavoro.</h1>
            <p className="hero-copy">
              Esplora obiettivi e percorsi, trova i materiali della lezione e passa dalla
              comprensione all'uso in classe senza perdere fonti, versione e stato.
            </p>
            <div className="hero-actions">
              <button className="primary-action" onClick={() => setSection('materials')}>
                Apri i materiali delle lezioni
              </button>
              <button className="secondary-action" onClick={() => setSection('curriculum')}>
                Esplora il curricolo
              </button>
            </div>
          </section>

          <section className="task-grid" aria-label="Cosa puoi fare">
            <button onClick={() => setSection('curriculum')}>
              <span>01</span><strong>Curricolo</strong>
              <small>Leggi temi, obiettivi ed evidenze in modo non sequenziale.</small>
            </button>
            <button onClick={() => setSection('paths')}>
              <span>02</span><strong>Percorsi</strong>
              <small>Segui UDA, periodi, blocchi e progressione annuale.</small>
            </button>
            <button onClick={() => setSection('materials')}>
              <span>03</span><strong>Materiali</strong>
              <small>Apri LIM, scheda studente e guida docente dal Learning Object.</small>
            </button>
            <button onClick={() => setSection('map')}>
              <span>04</span><strong>Mappa</strong>
              <small>Usa Universe, Galaxy, Verticale e Timeline come viste intelligenti.</small>
            </button>
          </section>

          <section className="home-summary">
            <div><strong>{fixture.nodes.length}</strong><span>nodi pilot</span></div>
            <div><strong>{fixture.segments.length}</strong><span>segmenti piano</span></div>
            <div><strong>{p1.learningObjects.length}</strong><span>Learning Object v0.2</span></div>
            <div><strong>{fixture.links.length}</strong><span>raccordi tracciati</span></div>
          </section>
        </main>
      )}

      {section === 'curriculum' && (
        <main className="page-section">
          <div className="section-heading">
            <div>
              <p className="kicker">Curricolo</p>
              <h1>Esplora per tema, non per pagine</h1>
              <p>Il pilot espone il subset curricolare S1 mantenendo stato e provenienza.</p>
            </div>
            <div className="section-stat"><strong>{fixture.nodes.length}</strong><span>nodi</span></div>
          </div>

          <div className="theme-grid">
            {themes.map(([theme, nodes]) => (
              <section className="theme-card" key={theme}>
                <div className="card-meta"><span>Tecnologia</span><span>{nodes.length} nodi</span></div>
                <h2>{theme}</h2>
                <ul>
                  {nodes.map((node) => (
                    <li key={node.id}>
                      <button onClick={() => { setSection('map'); select(node.id) }}>
                        <span className={'mini-state ' + (node.status === 'NEEDS_HUMAN_REVIEW' ? 'review' : 'accepted')} />
                        <span>{node.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </main>
      )}

      {section === 'paths' && (
        <main className="page-section">
          <div className="section-heading">
            <div>
              <p className="kicker">Percorsi / UDA</p>
              <h1>Dove si colloca il lavoro nell'anno</h1>
              <p>Segmenti del Piano annuale collegabili al curricolo e ai futuri Learning Object.</p>
            </div>
            <div className="section-stat"><strong>{fixture.segments.length}</strong><span>segmenti</span></div>
          </div>

          <div className="path-list">
            {fixture.segments.map((segment) => (
              <article key={segment.id} className="path-row">
                <div className="path-grade">{segment.grade}</div>
                <div>
                  <p className="kicker">UDA {segment.uda} · {segment.period}</p>
                  <h2>{segment.focus}</h2>
                  <p>{segment.hours} ore · {segment.blocks.join(' · ')}</p>
                </div>
                <button onClick={() => { setSection('map'); select(segment.id) }}>Vedi raccordi</button>
              </article>
            ))}
          </div>
        </main>
      )}

      {section === 'materials' && <main><MaterialsHub /></main>}

      {section === 'sources' && (
        <main className="page-section">
          <div className="section-heading">
            <div>
              <p className="kicker">Fonti e provenienza</p>
              <h1>Ogni vista deve poter tornare alla propria fonte</h1>
              <p>Questa superficie non approva il curricolo: pubblica proiezioni read-only e mantiene identità e stato.</p>
            </div>
          </div>

          <div className="source-grid">
            <article className="detail-card">
              <p className="kicker">Curricolo S1</p>
              <h2>Registro canonico consolidato</h2>
              <p>{String(fixture.meta.generatedFrom)}</p>
              <dl>
                <dt>Read-only</dt><dd>Sì</dd>
                <dt>Raccordi VALIDATED automatici</dt><dd>Nessuno</dd>
              </dl>
            </article>
            <article className="detail-card">
              <p className="kicker">Visual Library</p>
              <h2>Learning Object v0.2</h2>
              <p>Registro materiali EDU-PRO utilizzato dal Materials Hub.</p>
              <dl>
                <dt>Dati personali</dt><dd>Non inclusi nel fixture pubblico</dd>
                <dt>Lifecycle corrente</dt><dd>GENERATED</dd>
              </dl>
            </article>
          </div>
        </main>
      )}

      {section === 'map' && (
        <Suspense fallback={<main className="page-section"><p>Caricamento della mappa intelligente…</p></main>}>
          <MapExperience />
        </Suspense>
      )}
    </div>
  )
}
