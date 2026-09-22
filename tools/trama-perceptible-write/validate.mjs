import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const contract = JSON.parse(fs.readFileSync('ops/trama-perceptible-write.json','utf8'))
const surfaces = JSON.parse(fs.readFileSync('ops/trama-perceptible-write-surfaces.json','utf8'))
const fail = (m) => { console.error('TRAMA-PW-01 FAIL: ' + m); process.exit(1) }

if (contract.contract !== 'TRAMA-PW-01' || contract.version !== 1) fail('invalid contract identity')
if (contract.rule !== 'NO_SILENT_USER_INITIATED_WRITES') fail('silent-write rule missing')
if (surfaces.contract !== 'TRAMA-PW-01' || surfaces.version !== 1) fail('invalid surface manifest')
if (surfaces.product !== 'Atlas') fail('surface manifest product mismatch')

for (const key of ['intent','pendingWhenAsync','explicitSuccess','explicitFailure','readableResultState','assistiveAnnouncement','nonColorOnly','criticalWriteNotToastOnly','implicitApprovalForbidden']) {
  if (contract.guarantees?.[key] !== true) fail('required guarantee disabled: ' + key)
}
if (contract.enforcement?.changedWriteRequiresFeedbackEvidence !== true ||
    contract.enforcement?.changedWriteRequiresTestEvidence !== true ||
    contract.enforcement?.failClosed !== true) fail('enforcement must fail closed')

const base = process.env.TRAMA_PW_BASE_SHA
const head = process.env.TRAMA_PW_HEAD_SHA
if (!base || !head || /^0+$/.test(base) || /^0+$/.test(head)) fail('comparison base/head required')

const nameStatus = execFileSync('git',['diff','--name-status','--find-renames',base + '...' + head],{encoding:'utf8'})
  .trim().split('\n').filter(Boolean)

const changes = nameStatus.map((line) => {
  const parts = line.split('\t')
  const status = parts[0]
  const path = status.startsWith('R') ? parts[2] : parts[1]
  return { status, path }
}).filter((x) => x.path && !x.path.startsWith('tools/trama-perceptible-write/'))

const existingSourceChanges = changes
  .filter((x) => !x.status.startsWith('D') && /\.(tsx?|jsx?|mjs|cjs)$/.test(x.path) && fs.existsSync(x.path))
  .map((x) => ({...x,text:fs.readFileSync(x.path,'utf8')}))

const httpMutation = /(fetch\s*\([^)]*,\s*\{[\s\S]{0,800}?method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|axios\.(?:post|put|patch|delete)\s*\()/i
const dataMutation = /(\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|localStorage\.setItem\s*\(|sessionStorage\.setItem\s*\(|indexedDB[\s\S]{0,300}?\.(?:add|put|delete|clear)\s*\()/i
const namedMutation = /\b(?:save|publish|approve|confirm|remove|delete|accept|dismiss|withdraw|submit|create|update|attach|adopt)[A-Z_a-z0-9]*\s*\(/i
const explicitWrite = /@trama-write\b/i

const mutationFiles = existingSourceChanges.filter((f) =>
  httpMutation.test(f.text) || dataMutation.test(f.text) || namedMutation.test(f.text) || explicitWrite.test(f.text)
)

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§DOUBLESTAR§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§DOUBLESTAR§§/g, '.*')
  return new RegExp('^' + escaped + '$')
}
function matches(pattern, path) { return globToRegExp(pattern).test(path) }

for (const surface of surfaces.surfaces ?? []) {
  if (!surface.id || !Array.isArray(surface.sourcePatterns) || !surface.sourcePatterns.length) fail('surface entry missing id/sourcePatterns')
  if (!Array.isArray(surface.feedbackFiles) || !surface.feedbackFiles.length) fail(surface.id + ': feedbackFiles required')
  if (!Array.isArray(surface.testFiles) || !surface.testFiles.length) fail(surface.id + ': testFiles required')
  for (const file of [...surface.feedbackFiles, ...surface.testFiles]) {
    if (!fs.existsSync(file)) fail(surface.id + ': referenced evidence file missing: ' + file)
  }
  const feedbackText = surface.feedbackFiles.map((p)=>fs.readFileSync(p,'utf8')).join('\n')
  const testText = surface.testFiles.map((p)=>fs.readFileSync(p,'utf8')).join('\n')
  if (!/(aria-live|role=["']status["']|role=["']alert["']|Toast|toast\s*\(|@trama-feedback\b)/i.test(feedbackText)) {
    fail(surface.id + ': no observable UI feedback marker in declared feedbackFiles')
  }
  if (!/(getByRole\s*\(\s*['"](?:status|alert)['"]|findByRole\s*\(\s*['"](?:status|alert)['"]|toHaveTextContent|aria-live|@trama-feedback-test\b)/i.test(testText)) {
    fail(surface.id + ': tests do not assert perceived feedback')
  }
}

for (const file of mutationFiles) {
  const bound = (surfaces.surfaces ?? []).filter((s) => s.sourcePatterns.some((p)=>matches(p,file.path)))
  if (bound.length !== 1) fail(file.path + ': changed mutation must bind to exactly one declared write surface')
}

const baseManifestText = (() => {
  try { return execFileSync('git',['show',base + ':ops/trama-perceptible-write-surfaces.json'],{encoding:'utf8'}) } catch { return null }
})()
if (baseManifestText) {
  const baseManifest = JSON.parse(baseManifestText)
  const headIds = new Set((surfaces.surfaces ?? []).map((s)=>s.id))
  for (const oldSurface of baseManifest.surfaces ?? []) {
    if (!headIds.has(oldSurface.id)) {
      const sourceStillExists = (oldSurface.sourcePatterns ?? []).some((pattern) =>
        existingSourceChanges.some((f)=>matches(pattern,f.path)) ||
        listTrackedFiles().some((p)=>matches(pattern,p))
      )
      if (sourceStillExists) fail(oldSurface.id + ': write surface removed while source still exists')
    }
  }
}

function listTrackedFiles() {
  return execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
}

console.log(JSON.stringify({
  contract:'TRAMA-PW-01',
  result:'PASS',
  changedMutationFiles:mutationFiles.map((f)=>f.path),
  declaredSurfaces:(surfaces.surfaces ?? []).map((s)=>s.id)
},null,2))
