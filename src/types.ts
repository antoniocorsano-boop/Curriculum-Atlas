export type AtlasView = 'universe' | 'galaxy' | 'verticale' | 'timeline' | 'focus'
export type StatusFilter = 'all' | 'accepted' | 'review'
export type Vec3 = [number, number, number]

export interface CurriculumNode {
  id: string
  row: number
  schoolOrder: 'INFANZIA' | 'PRIMARIA' | 'SECONDARIA_I_GRADO'
  nodeType: 'MILESTONE' | 'OBJECTIVE' | 'EVIDENCE'
  label: string
  status: 'SOURCE_ACCEPTED_FOR_PILOT' | 'NEEDS_HUMAN_REVIEW'
  qualityFlag?: string
  theme: string
  sourceSha: string
}

export interface PlanSegment {
  id: string
  grade: 'Prima' | 'Seconda' | 'Terza'
  planCode: string
  uda: string
  period: string
  hours: number
  focus: string
  pack: string
  blocks: string[]
  assetId: string
  generationId: string
  sourceSha: string
}

export interface AtlasLink {
  id: string
  sourceNodeId: string
  targetSegmentId: string
  strength: 'EXPLICIT' | 'STRONG' | 'CONTEXTUAL'
  status: 'REVIEW_READY_PROPOSED' | 'EXPLORATORY_PROPOSED' | 'BLOCKED_PENDING_SOURCE_REVIEW'
  rationale: string
}

export interface AtlasFixture {
  meta: Record<string, string | boolean>
  nodes: CurriculumNode[]
  segments: PlanSegment[]
  links: AtlasLink[]
}
