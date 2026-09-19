import fixtureJson from '../data/s1-fixture.json'
import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasFixture } from '../types'

const fixture = fixtureJson as unknown as AtlasFixture

export function AccessibleMirror() {
  const select = useAtlasStore((s) => s.select)
  return (
    <section className="accessible-mirror" aria-label="Elenco accessibile dei contenuti">
      <h2>Esplora senza 3D</h2>
      <p>Gli stessi contenuti della scena sono disponibili come elenco HTML navigabile da tastiera e screen reader.</p>
      <div className="mirror-grid">
        {fixture.nodes.map((node) => (
          <button key={node.id} onClick={() => select(node.id)}>
            <strong>{node.theme}</strong>
            <span>{node.label}</span>
            <small>{node.status === 'NEEDS_HUMAN_REVIEW' ? 'Da rivedere' : 'Fonte pilot'}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
