import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync(new URL('../src/data/s1-fixture.json', import.meta.url), 'utf8'))
const assert = (condition, message) => { if (!condition) throw new Error(message) }

assert(data.meta.readOnly === true, 'S1 fixture must be read-only')
assert(data.nodes.length === 15, 'Expected 15 curriculum nodes')
assert(data.segments.length === 7, 'Expected 7 plan segments')
assert(data.links.length === 16, 'Expected 16 candidate links')

const nodeIds = new Set(data.nodes.map((n) => n.id))
const segmentIds = new Set(data.segments.map((s) => s.id))
assert(nodeIds.size === data.nodes.length, 'Duplicate curriculum node id')
assert(segmentIds.size === data.segments.length, 'Duplicate plan segment id')

for (const link of data.links) {
  assert(nodeIds.has(link.sourceNodeId), 'Missing source node for ' + link.id)
  assert(segmentIds.has(link.targetSegmentId), 'Missing target segment for ' + link.id)
  assert(link.status !== 'VALIDATED', 'S1 must not contain automatic VALIDATED link: ' + link.id)
}

const counts = data.links.reduce((m, l) => {
  m[l.status] = (m[l.status] ?? 0) + 1
  return m
}, {})

assert(counts.REVIEW_READY_PROPOSED === 9, 'Expected 9 review-ready links')
assert(counts.EXPLORATORY_PROPOSED === 2, 'Expected 2 exploratory links')
assert(counts.BLOCKED_PENDING_SOURCE_REVIEW === 5, 'Expected 5 blocked links in selected subset')

console.log(JSON.stringify({status:'PASS',nodes:data.nodes.length,segments:data.segments.length,links:data.links.length,linkStatuses:counts}, null, 2))
