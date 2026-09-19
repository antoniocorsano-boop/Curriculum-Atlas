import fs from 'node:fs'

const s1 = JSON.parse(fs.readFileSync(new URL('../src/data/s1-fixture.json', import.meta.url), 'utf8'))
const p1 = JSON.parse(fs.readFileSync(new URL('../src/data/p1-learning-objects.json', import.meta.url), 'utf8'))
const assert = (condition, message) => { if (!condition) throw new Error(message) }

assert(s1.meta.readOnly === true, 'S1 fixture must be read-only')
assert(s1.nodes.length === 15, 'Expected 15 curriculum nodes')
assert(s1.segments.length === 7, 'Expected 7 plan segments')
assert(s1.links.length === 16, 'Expected 16 candidate links')

const nodeIds = new Set(s1.nodes.map((n) => n.id))
const segmentIds = new Set(s1.segments.map((s) => s.id))
assert(nodeIds.size === s1.nodes.length, 'Duplicate curriculum node id')
assert(segmentIds.size === s1.segments.length, 'Duplicate plan segment id')

for (const link of s1.links) {
  assert(nodeIds.has(link.sourceNodeId), 'Missing source node for ' + link.id)
  assert(segmentIds.has(link.targetSegmentId), 'Missing target segment for ' + link.id)
  assert(link.status !== 'VALIDATED', 'S1 must not contain automatic VALIDATED link: ' + link.id)
}

const counts = s1.links.reduce((m, l) => {
  m[l.status] = (m[l.status] ?? 0) + 1
  return m
}, {})

assert(counts.REVIEW_READY_PROPOSED === 9, 'Expected 9 review-ready links')
assert(counts.EXPLORATORY_PROPOSED === 2, 'Expected 2 exploratory links')
assert(counts.BLOCKED_PENDING_SOURCE_REVIEW === 5, 'Expected 5 blocked links in selected subset')

assert(p1.meta.readOnly === true, 'P1 fixture must be read-only')
assert(p1.meta.personalData === false, 'P1 public fixture must contain no personal-data payload')
assert(p1.learningObjects.length === 3, 'Expected 3 pilot Learning Objects')

const loIds = new Set()
const artIds = new Set()
const allowedLifecycle = new Set(['DRAFT', 'GENERATED', 'REVIEWED', 'CANONICAL', 'RETIRED'])
const allowedRoles = new Set(['LIM', 'MAP', 'STUDENT', 'TEACHER', 'ASSESSMENT', 'RECEIPT'])

for (const lo of p1.learningObjects) {
  assert(!loIds.has(lo.loId), 'Duplicate LO_ID ' + lo.loId)
  loIds.add(lo.loId)
  assert(allowedLifecycle.has(lo.lifecycle), 'Invalid lifecycle for ' + lo.loId)
  assert(lo.version === '0.2', 'Pilot LO must expose version 0.2: ' + lo.loId)
  assert(lo.lifecycle === 'GENERATED', 'Pilot LO must remain GENERATED until human classroom validation: ' + lo.loId)
  assert(typeof lo.manifestUrl === 'string' && lo.manifestUrl.startsWith('https://'), 'Missing manifest URL for ' + lo.loId)
  assert(Array.isArray(lo.sourceRefs) && lo.sourceRefs.length > 0, 'Missing sourceRefs for ' + lo.loId)
  assert(Array.isArray(lo.assets) && lo.assets.length >= 3, 'Expected at least LIM/student/teacher assets for ' + lo.loId)

  const roles = new Set()
  for (const asset of lo.assets) {
    assert(!artIds.has(asset.artId), 'Duplicate ART_ID ' + asset.artId)
    artIds.add(asset.artId)
    assert(allowedRoles.has(asset.role), 'Invalid material role for ' + asset.artId)
    assert(asset.url.startsWith('https://'), 'Public material link must use HTTPS: ' + asset.artId)
    assert(asset.version === lo.version, 'Asset/LO version mismatch: ' + asset.artId)
    roles.add(asset.role)
  }

  for (const required of ['LIM', 'STUDENT', 'TEACHER']) {
    assert(roles.has(required), 'Missing required ' + required + ' asset for ' + lo.loId)
  }
}

const forbiddenKeys = ['studentName', 'studentId', 'email', 'phone', 'taxCode', 'fiscalCode']
const serialized = JSON.stringify(p1)
for (const key of forbiddenKeys) {
  assert(!serialized.includes('"' + key + '"'), 'Forbidden personal-data key in public fixture: ' + key)
}

console.log(JSON.stringify({
  status: 'PASS',
  s1: {
    nodes: s1.nodes.length,
    segments: s1.segments.length,
    links: s1.links.length,
    linkStatuses: counts,
  },
  p1: {
    learningObjects: p1.learningObjects.length,
    assets: artIds.size,
    readOnly: p1.meta.readOnly,
    personalData: p1.meta.personalData,
  },
}, null, 2))
