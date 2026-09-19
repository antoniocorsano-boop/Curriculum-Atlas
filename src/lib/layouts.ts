import type { AtlasFixture, AtlasView, Vec3 } from '../types'

const themeCenters: Record<string, Vec3> = {
  'Progettazione e problem solving': [-5, 2.7, 0],
  'Dati e strumenti digitali': [-2.5, -2.8, 0],
  'Coding e pensiero computazionale': [0, 3.6, 0],
  'Rappresentazione tecnica': [4.8, 3.0, 0],
  'Reti e cloud': [4.8, -0.4, 0],
  'IA literacy': [1.8, -3.1, 0],
}

const gradeX: Record<string, number> = { Prima: -5.5, Seconda: 0, Terza: 5.5 }
const orderX: Record<string, number> = { INFANZIA: -6, PRIMARIA: -3.5, SECONDARIA_I_GRADO: 2.5 }

function offset(index: number): Vec3 {
  const angle = index * 2.399963
  const radius = 0.55 + Math.floor(index / 3) * 0.45
  return [Math.cos(angle) * radius, Math.sin(angle) * radius, (index % 3 - 1) * 0.18]
}

function monthPosition(period: string): number {
  const map: Array<[string, number]> = [
    ['Settembre', -6], ['Ottobre', -4.7], ['Novembre', -3.4], ['Dicembre', -2.1],
    ['Gennaio', -0.8], ['Febbraio', 0.5], ['Marzo', 1.8], ['Aprile', 3.1],
    ['Maggio', 4.4], ['Giugno', 5.7],
  ]
  const hits = map.filter(([name]) => period.includes(name)).map(([, x]) => x)
  return hits.length ? hits.reduce((a, b) => a + b, 0) / hits.length : 0
}

export function positionsFor(view: AtlasView, fixture: AtlasFixture, selectedId: string | null) {
  const positions = new Map<string, Vec3>()

  fixture.nodes.forEach((node, index) => {
    if (view === 'universe') {
      const center = themeCenters[node.theme] ?? [0, 0, 0]
      const localIndex = fixture.nodes.filter((n) => n.theme === node.theme).findIndex((n) => n.id === node.id)
      const d = offset(localIndex)
      positions.set(node.id, [center[0] + d[0], center[1] + d[1], d[2]])
    } else if (view === 'galaxy') {
      const angle = index * 1.73
      const r = 2.3 + (index % 5) * 0.65
      positions.set(node.id, [Math.cos(angle) * r, Math.sin(angle) * r * 0.72, Math.sin(angle * 0.7) * 2.2])
    } else if (view === 'verticale') {
      const x = orderX[node.schoolOrder]
      const same = fixture.nodes.filter((n) => n.schoolOrder === node.schoolOrder)
      const local = same.findIndex((n) => n.id === node.id)
      positions.set(node.id, [x, 4.8 - local * 0.75, (local % 2) * 0.35])
    } else if (view === 'timeline') {
      const linked = fixture.links.filter((link) => link.sourceNodeId === node.id)
      const seg = linked.length ? fixture.segments.find((s) => s.id === linked[0].targetSegmentId) : undefined
      if (seg) {
        const y = seg.grade === 'Prima' ? 3.4 : seg.grade === 'Seconda' ? 0 : -3.4
        positions.set(node.id, [monthPosition(seg.period), y + 1.25, 0])
      } else {
        positions.set(node.id, [-6.5 + (index % 5) * 0.6, -5.2, -1.5])
      }
    } else {
      const connected = fixture.links.filter((l) => l.sourceNodeId === selectedId || l.targetSegmentId === selectedId)
      const connectedIds = new Set(connected.flatMap((l) => [l.sourceNodeId, l.targetSegmentId]))
      if (node.id === selectedId) positions.set(node.id, [-2.2, 0, 1])
      else if (connectedIds.has(node.id)) positions.set(node.id, [-4.5, (index % 5 - 2) * 1.2, 0])
      else positions.set(node.id, [0, -9 - index * 0.2, -6])
    }
  })

  fixture.segments.forEach((segment, index) => {
    if (view === 'universe') {
      positions.set(segment.id, [gradeX[segment.grade], -5.5, -2.5])
    } else if (view === 'galaxy') {
      const angle = index * 0.9 + 0.4
      positions.set(segment.id, [Math.cos(angle) * 6.7, Math.sin(angle) * 4.2, -1.2])
    } else if (view === 'verticale') {
      positions.set(segment.id, [gradeX[segment.grade], -4.4 + (index % 3) * 0.8, -0.8])
    } else if (view === 'timeline') {
      const y = segment.grade === 'Prima' ? 3.4 : segment.grade === 'Seconda' ? 0 : -3.4
      positions.set(segment.id, [monthPosition(segment.period), y, 0])
    } else {
      const connected = fixture.links.filter((l) => l.sourceNodeId === selectedId || l.targetSegmentId === selectedId)
      const connectedIds = new Set(connected.flatMap((l) => [l.sourceNodeId, l.targetSegmentId]))
      if (segment.id === selectedId) positions.set(segment.id, [2.2, 0, 1])
      else if (connectedIds.has(segment.id)) positions.set(segment.id, [3.8, (index % 4 - 1.5) * 1.6, 0])
      else positions.set(segment.id, [0, -10 - index * 0.2, -6])
    }
  })

  return positions
}

export function visibilityFor(view: AtlasView, id: string, fixture: AtlasFixture, selectedId: string | null) {
  if (view !== 'focus') return 1
  if (id === selectedId) return 1
  const connected = fixture.links.some((l) =>
    (l.sourceNodeId === selectedId && l.targetSegmentId === id) ||
    (l.targetSegmentId === selectedId && l.sourceNodeId === id)
  )
  return connected ? 0.9 : 0.03
}
