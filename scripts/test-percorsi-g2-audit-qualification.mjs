import assert from 'node:assert/strict';
import {qualifyAudit} from './qualify-percorsi-g2-audit.mjs';
const base={metadata:{vulnerabilities:{info:0,low:0,moderate:0,high:0,critical:0,total:0}},vulnerabilities:{}};
assert.equal(qualifyAudit(base).status,'PASS');
assert.equal(qualifyAudit({}).status,'BLOCKED');
assert.equal(qualifyAudit({...base,vulnerabilities:{x:{severity:'high'}}}).status,'FAIL');
assert.equal(qualifyAudit({...base,vulnerabilities:{x:{severity:'critical'}}}).status,'FAIL');
assert.equal(qualifyAudit({...base,vulnerabilities:{x:{severity:'moderate'}}}).status,'PASS');
console.log('PASS audit qualification: valid clean, malformed blocked, HIGH/CRITICAL fail closed');
