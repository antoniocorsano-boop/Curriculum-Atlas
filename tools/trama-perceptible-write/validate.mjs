import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const manifest = JSON.parse(fs.readFileSync('ops/trama-perceptible-write.json','utf8'))
const fail = (m) => { console.error('TRAMA-PW-01 FAIL: ' + m); process.exit(1) }
if (manifest.contract !== 'TRAMA-PW-01' || manifest.version !== 1) fail('invalid contract identity')
if (manifest.rule !== 'NO_SILENT_USER_INITIATED_WRITES') fail('silent-write rule missing')
for (const key of ['intent','pendingWhenAsync','explicitSuccess','explicitFailure','readableResultState','assistiveAnnouncement','nonColorOnly','criticalWriteNotToastOnly','implicitApprovalForbidden']) {
  if (manifest.guarantees?.[key] !== true) fail('required guarantee disabled: ' + key)
}
if (manifest.enforcement?.changedWriteRequiresFeedbackEvidence !== true || manifest.enforcement?.changedWriteRequiresTestEvidence !== true || manifest.enforcement?.failClosed !== true) fail('enforcement must fail closed')

const base = process.env.TRAMA_PW_BASE_SHA
const head = process.env.TRAMA_PW_HEAD_SHA
if (!base || !head || /^0+$/.test(base)) { console.log('TRAMA-PW-01 PASS: preventive contract active'); process.exit(0) }

const changed = execFileSync('git',['diff','--name-only',base + '...' + head],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
const source = changed.filter((p)=>/\.(tsx?|jsx?|mjs|cjs)$/.test(p) && fs.existsSync(p)).map((path)=>({path,text:fs.readFileSync(path,'utf8')}))
const mutationPattern = /(onSubmit\s*=|<form|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|localStorage\.setItem|indexedDB|\b(save|publish|approve|confirm|remove|delete|accept|dismiss|withdraw)[A-Z_a-z0-9]*\s*\()/i
const mutationFiles = source.filter((f)=>mutationPattern.test(f.text))
if (!mutationFiles.length) { console.log('TRAMA-PW-01 PASS: no changed mutation candidate'); process.exit(0) }

const feedbackPattern = /(aria-live|role=["']status["']|role=["']alert["']|toast|feedback|notice|pending|success|error|riuscit|fallit|salvat|aggiunt|rimoss|confermat|pubblicat|ritirat)/i
if (!source.some((f)=>feedbackPattern.test(f.text))) fail('future Atlas mutation introduced without perceivable feedback evidence')
const tests = source.filter((f)=>/(\.test\.|\.spec\.|__tests__|\/e2e\/|\/tests?\/)/.test(f.path))
if (!tests.some((f)=>feedbackPattern.test(f.text))) fail('future Atlas mutation introduced without feedback test evidence')
console.log('TRAMA-PW-01 PASS: Atlas mutation carries feedback and test evidence')
