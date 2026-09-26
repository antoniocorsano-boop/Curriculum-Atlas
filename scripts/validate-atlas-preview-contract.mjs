#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [previewDir, expectedExactHead] = process.argv.slice(2);

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!previewDir || !expectedExactHead) fail('usage: validate-atlas-preview-contract.mjs <preview-dir> <exact-head>');
if (!/^[0-9a-f]{40}$/.test(expectedExactHead)) fail('exact_head must be a lowercase full Git SHA');

const headPath = path.join(previewDir, 'EXACT_HEAD.txt');
const manifestPath = path.join(previewDir, 'PREVIEW-MANIFEST.json');
if (!fs.existsSync(headPath)) fail('EXACT_HEAD.txt missing');
if (!fs.existsSync(manifestPath)) fail('PREVIEW-MANIFEST.json missing');

const actualHead = fs.readFileSync(headPath, 'utf8').trim();
if (actualHead !== expectedExactHead) fail('exact-head binding mismatch');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch {
  fail('PREVIEW-MANIFEST.json invalid');
}

if (manifest.exactHead !== expectedExactHead) fail('manifest exactHead mismatch');
if (manifest.channel !== 'artifact-only') fail('manifest channel must remain artifact-only');
if (manifest.studentAuthorized !== false) fail('studentAuthorized must remain false');

console.log('Atlas preview contract PASS');
