import { useEffect, useRef, useState } from 'react'
import fixtureJson from '../data/s1-fixture.json'
import { useAtlasStore } from '../store/useAtlasStore'
import type { AtlasFixture } from '../types'

const fixture = fixtureJson as unknown as AtlasFixture
type SheetStep = 0 | 1 | 2

export function Inspector() {
  const selectedId = useAtlasStore((state) => state.selectedId)
  const view = useAtlasStore((state) => state.view)
  const back = useAtlasStore((state) => state.back)
  const node = fixture.nodes.find((item) => item.id === selectedId)
  const segment = fixture.segments.find((item) => item.id === selectedId)
  const [sheetStep, setSheetStep] = useState<SheetStep>(0)
  const dragStart = useRef<{ y: number; step: SheetStep } | null>(null)

  useEffect(() => {
    setSheetStep(0)
  }, [selectedId])

  if (view !== 'focus' || (!node && !segment)) return null

  const links = fixture.links.filter(
    (link) => link.sourceNodeId === selectedId || link.targetSegmentId === selectedId,
  )

  const expand = () => setSheetStep((step) => Math.min(2, step + 1) as SheetStep)
  const collapse = () => setSheetStep((step) => Math.max(0, step - 1) as SheetStep)

  const onHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { y: event.clientY, step: sheetStep }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onHandlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return

    const delta = event.clientY - start.y
    if (delta < -42) expand()
    else if (delta > 42) collapse()
    else if (start.step < 2) expand()
    else collapse()
  }

  return (
    <aside
      className={'inspector mobile-sheet-step-' + sheetStep}
      aria-live="polite"
      aria-label="Dettaglio dell'elemento selezionato"
      tabIndex={-1}
    >
      <div className="mobile-sheet-header">
        <button
          className="sheet-handle"
          type="button"
          aria-label={sheetStep === 2 ? 'Riduci il pannello' : 'Espandi il pannello'}
          aria-expanded={sheetStep > 0}
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
        >
          <span aria-hidden="true" />
        </button>
        <div className="sheet-actions" aria-label="Controlli pannello">
          <button type="button" onClick={collapse} disabled={sheetStep === 0}>Riduci</button>
          <button type="button" onClick={expand} disabled={sheetStep === 2}>Espandi</button>
        </div>
      </div>

      <div className="inspector-scroll">
        <button className="back" onClick={back}>← Torna alla vista</button>

        {node && (
          <>
            <p className="eyebrow">{node.theme} · {node.nodeType}</p>
            <h1>{node.label}</h1>
            <div className={'status ' + (node.status === 'NEEDS_HUMAN_REVIEW' ? 'review' : 'accepted')}>
              {node.status === 'NEEDS_HUMAN_REVIEW'
                ? 'Da rivedere umanamente'
                : 'Fonte accettata per il pilot'}
            </div>

            <section>
              <h2>Dove porta</h2>
              {links.length ? links.map((link) => {
                const target = fixture.segments.find((item) => item.id === link.targetSegmentId)
                return (
                  <article key={link.id} className={'relation ' + link.status.toLowerCase()}>
                    <strong>{target?.grade} · UDA {target?.uda}</strong>
                    <span>{target?.focus}</span>
                    <small>{humanStatus(link.status)} · forza {link.strength.toLowerCase()}</small>
                    <p>{link.rationale}</p>
                  </article>
                )
              }) : <p>Nessun raccordo incluso in questo POC.</p>}
            </section>

            <details>
              <summary>Fonte e tracciabilità</summary>
              <dl>
                <dt>Riga sorgente</dt><dd>{node.row}</dd>
                <dt>SHA sorgente</dt><dd>{node.sourceSha}</dd>
                <dt>Atlas ID</dt><dd>{node.id}</dd>
                {node.qualityFlag && <><dt>Finding</dt><dd>{node.qualityFlag}</dd></>}
              </dl>
            </details>
          </>
        )}

        {segment && (
          <>
            <p className="eyebrow">{segment.grade} · {segment.planCode}</p>
            <h1>{segment.focus}</h1>
            <div className="status plan">Piano annuale · read-only</div>

            <section className="facts">
              <div><span>UDA</span><strong>{segment.uda}</strong></div>
              <div><span>Periodo</span><strong>{segment.period}</strong></div>
              <div><span>Ore</span><strong>{segment.hours}</strong></div>
              <div><span>Pack</span><strong>{segment.pack}</strong></div>
            </section>

            <section>
              <h2>Blocchi</h2>
              <p>{segment.blocks.join(' · ')}</p>
            </section>

            <section>
              <h2>Raccordi curricolari</h2>
              {links.map((link) => {
                const source = fixture.nodes.find((item) => item.id === link.sourceNodeId)
                return (
                  <article key={link.id} className={'relation ' + link.status.toLowerCase()}>
                    <strong>{source?.nodeType}</strong>
                    <span>{source?.label}</span>
                    <small>{humanStatus(link.status)}</small>
                  </article>
                )
              })}
            </section>

            <details>
              <summary>Fonte e tracciabilità</summary>
              <dl>
                <dt>Asset</dt><dd>{segment.assetId}</dd>
                <dt>Generazione</dt><dd>{segment.generationId}</dd>
                <dt>SHA modello</dt><dd>{segment.sourceSha}</dd>
                <dt>Atlas ID</dt><dd>{segment.id}</dd>
              </dl>
            </details>
          </>
        )}
      </div>
    </aside>
  )
}

function humanStatus(status: string) {
  if (status === 'REVIEW_READY_PROPOSED') return 'Proposta pronta per revisione'
  if (status === 'EXPLORATORY_PROPOSED') return 'Proposta esplorativa'
  return 'Bloccata: fonte da rivedere'
}
