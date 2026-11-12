import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {addPrologueVideo} from './missione118-prologue-video.mjs';
const source=readFileSync('artifacts/missione118-runtime/Missione118.html','utf8');
// Synthetic header for structural tests only; not a playable movie or an educational asset.
const fixture=Buffer.from('000000186674797069736f6d0000000069736f6d69736f32','hex');
const sha=createHash('sha256').update(fixture).digest('hex');
test('preserves exact supplied bytes and requires explicit matching hash',()=>{
 const r=addPrologueVideo(source,fixture,sha);
 assert.equal(r.sha256,sha);
 assert.ok(r.html.includes('data:video/mp4;base64,'+fixture.toString('base64')));
 assert.ok(r.html.includes('prologueMode===\'video\''));
 assert.ok(r.html.includes('Leggi la trascrizione'));
 assert.throws(()=>addPrologueVideo(source,fixture,'0'.repeat(64)),/PROLOGUE_HASH_MISMATCH/);
 assert.throws(()=>addPrologueVideo(source,fixture),/PROLOGUE_HASH_MISMATCH/);
});
test('rejects invalid header and missing runtime anchors',()=>{
 assert.throws(()=>addPrologueVideo(source,Buffer.alloc(32),'0'.repeat(64)),/PROLOGUE_MP4_INVALID/);
 assert.throws(()=>addPrologueVideo('<html></html>',fixture,sha),/VIDEO_ANCHOR/);
});
