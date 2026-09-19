import { useMemo, useState } from 'react'
import dataJson from '../data/p1-learning-objects.json'
import { useAtlasStore } from '../store/useAtlasStore'
import type { LearningObjectRef, MaterialRole, P1Fixture } from '../types'

const data = dataJson as unknown as P1Fixture
const gradeOptions = ['Tutte', 'Prima', 'Seconda', 'Terza'] as const

const roleLabels: Record<MaterialRole, string> = {
  LIM: 'Proietta',
  MAP: 'Mappa',
  STUDENT: 'Scheda studente',
  TEACHER: 'Guida docente',
  ASSESSMENT: 'Valutazione',
  RECEIPT: 'Ricevuta',
}

export function MaterialsHub() {
  const selectedId = useAtlasStore((state) => state.selectedLearningObjectId)
  const selectLearningObject = useAtlasStore((state) => state.selectLearningObject)
  const [grade, setGrade] = useState<(typeof gradeOptions)[number]>('Tutte')

  const visible = useMemo(
    () => data.learningObjects.filter((item) => grade === 'Tutte' || item.grade === grade),
    [grade],
  )

  const selected = data.learningObjects.find((item) => item.loId === selectedId)

  if (selected) {
    return <LearningObjectDetail item={selected} onBack={() => selectLearningObject(null)} />
  }

  return (
    <section className="page-section materials-page" aria-labelledby="materials-title">
      <div className="section-heading">
        <div>
          <p className="kicker">Materiali delle lezioni</p>
          <h1 id="materials-title">Dal curricolo all'aula, senza cercare nelle cartelle</h1>
          <p>
            Learning Object pubblicati in sola lettura. Le versioni attuali sono pilot
            <strong> GENERATED</strong>: utilizzabili per prova docente, non ancora canoniche.
          </p>
        </div>
        <div className="section-stat" aria-label="Tre Learning Object disponibili">
          <strong>{data.learningObjects.length}</strong>
          <span>Learning Object</span>
        </div>
      </div>

      <div className="filter-row" aria-label="Filtra per classe">
        {gradeOptions.map((option) => (
          <button
            key={option}
            className={grade === option ? 'active' : ''}
            onClick={() => setGrade(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="material-grid">
        {visible.map((item) => (
          <article className="material-card" key={item.loId}>
            <div className="card-meta">
              <span>{item.discipline} · {item.grade}</span>
              <span>v{item.version}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.activity}</p>
            <div className="card-badges">
              <span className="state-badge generated">GENERATED · da validare</span>
              {item.styleProfile && <span className="plain-badge">{item.styleProfile}</span>}
            </div>
            <dl className="card-facts">
              <div><dt>Durata</dt><dd>{item.durationMinutes ? formatDuration(item.durationMinutes) : '—'}</dd></div>
              <div><dt>Materiali</dt><dd>{item.assets.length}</dd></div>
            </dl>
            <button className="primary-action" onClick={() => selectLearningObject(item.loId)}>
              Apri il materiale
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function LearningObjectDetail({ item, onBack }: { item: LearningObjectRef; onBack: () => void }) {
  return (
    <section className="page-section lo-detail" aria-labelledby="lo-title">
      <button className="text-back" onClick={onBack}>← Materiali</button>

      <div className="lo-hero">
        <div>
          <p className="kicker">{item.discipline} · {item.grade}</p>
          <h1 id="lo-title">{item.title}</h1>
          <p>{item.activity}</p>
          <div className="card-badges">
            <span className="state-badge generated">GENERATED · da validare</span>
            <span className="plain-badge">v{item.version}</span>
            {item.styleProfile && <span className="plain-badge">{item.styleProfile}</span>}
          </div>
        </div>
        <div className="lo-time">
          <strong>{item.durationMinutes ? formatDuration(item.durationMinutes) : '—'}</strong>
          <span>durata prevista</span>
        </div>
      </div>

      <section className="classroom-panel" aria-labelledby="classroom-actions">
        <div>
          <p className="kicker">Usa in classe</p>
          <h2 id="classroom-actions">Apri ciò che ti serve adesso</h2>
        </div>
        <div className="asset-actions">
          {orderedAssets(item).map((asset) => (
            <a
              key={asset.artId}
              className={asset.role === 'LIM' ? 'asset-link primary' : 'asset-link'}
              href={asset.url}
              target="_blank"
              rel="noreferrer"
            >
              <span>{roleLabels[asset.role]}</span>
              <small>{asset.format} · v{asset.version}</small>
            </a>
          ))}
        </div>
      </section>

      <div className="detail-columns">
        <section className="detail-card">
          <p className="kicker">Evidenza</p>
          <h2>Che cosa resta della lezione</h2>
          <p>{item.evidence ?? 'Evidenza non dichiarata nel fixture corrente.'}</p>
        </section>

        <section className="detail-card">
          <p className="kicker">Nel curricolo</p>
          <h2>Fonti e struttura</h2>
          <p>{item.sourceRefs.join(' · ')}</p>
          {item.patternApplication && (
            <p className="technical-note">
              Pattern: {item.patternApplication.primaryPatternId}
              {item.patternApplication.secondaryPatternIds?.length
                ? ' · ' + item.patternApplication.secondaryPatternIds.join(' · ')
                : ''}
            </p>
          )}
        </section>
      </div>

      <details className="provenance-panel">
        <summary>Provenienza e identità</summary>
        <dl>
          <dt>LO_ID</dt><dd>{item.loId}</dd>
          <dt>Versione</dt><dd>{item.version}</dd>
          <dt>Lifecycle</dt><dd>{item.lifecycle}</dd>
          {item.patternApplication && <><dt>APP_ID</dt><dd>{item.patternApplication.appId}</dd></>}
          <dt>Manifest</dt>
          <dd><a href={item.manifestUrl} target="_blank" rel="noreferrer">Apri manifest canonico</a></dd>
        </dl>
      </details>
    </section>
  )
}

function orderedAssets(item: LearningObjectRef) {
  const order: MaterialRole[] = ['LIM', 'STUDENT', 'TEACHER', 'ASSESSMENT', 'MAP', 'RECEIPT']
  return [...item.assets].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))
}

function formatDuration(minutes: number) {
  if (minutes < 60) return String(minutes) + ' min'
  if (minutes % 60 === 0) return String(minutes / 60) + ' h'
  return String(Math.floor(minutes / 60)) + ' h ' + String(minutes % 60) + ' min'
}
