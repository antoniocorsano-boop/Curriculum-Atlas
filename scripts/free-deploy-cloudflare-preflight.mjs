#!/usr/bin/env node
// FD-05/B: read-only metadata check for the existing synthetic Pages project.
// Never deploys, updates account state, infers costs, or grants publication.
import {pathToFileURL} from 'node:url';

export const PROJECT = 'trama-fd02';
export const HOST = 'trama-fd02.pages.dev';
export const HISTORICAL_WRANGLER = '4.142.0';
const MAX_BYTES = 512 * 1024;
const API = 'https://api.cloudflare.com/client/v4';
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const empty = v => v == null || (plain(v) && Object.keys(v).length === 0) ||
  (Array.isArray(v) && v.length === 0);

function stop(code) { throw new Error(code); }
function checkAnalytics(build) {
  if (build != null && !plain(build)) stop('STOP_BUILD_CONFIG');
  if (build?.web_analytics_tag || build?.web_analytics_token) stop('STOP_ANALYTICS');
}
function checkBindings(config) {
  if (!plain(config)) stop('STOP_DEPLOYMENT_CONFIG');
  for (const [key, value] of Object.entries(config)) {
    if ((['env_vars', 'browsers', 'mtls_certificates'].includes(key) || /binding|namespace|bucket|database|queue|hyperdrive|vectorize|durable_object|service|analytics|secret|placement/i.test(key)) && !empty(value)) {
      stop('STOP_RUNTIME_BINDING');
    }
  }
}
export function validateProject(payload) {
  if (!plain(payload) || payload.success !== true || !plain(payload.result) ||
      (payload.errors !== undefined && (!Array.isArray(payload.errors) || payload.errors.length !== 0))) {
    stop('STOP_API_RESPONSE');
  }
  const p = payload.result;
  if (p.name !== PROJECT || p.subdomain !== HOST) stop('STOP_PROJECT_IDENTITY');
  if (p.source != null) stop('STOP_GIT_SOURCE');
  if (p.domains != null && (!Array.isArray(p.domains) || p.domains.some(d => d !== HOST))) stop('STOP_CUSTOM_DOMAIN');
  if (p.uses_functions !== false || p.canonical_deployment?.uses_functions !== false) stop('STOP_FUNCTIONS_OR_UNKNOWN');
  if (p.latest_deployment?.uses_functions === true) stop('STOP_FUNCTIONS_OR_UNKNOWN');
  if (typeof p.production_branch !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/.test(p.production_branch) ||
      p.production_branch.includes('..')) stop('STOP_PRODUCTION_BRANCH');
  if (!plain(p.deployment_configs)) stop('STOP_DEPLOYMENT_CONFIG');
  checkBindings(p.deployment_configs.preview);
  checkBindings(p.deployment_configs.production);
  checkAnalytics(p.build_config);
  checkAnalytics(p.canonical_deployment?.build_config);
  checkAnalytics(p.latest_deployment?.build_config);
  const id = p.canonical_deployment?.id;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) stop('STOP_ROLLBACK_REFERENCE');
  return {
    state: 'PROJECT_METADATA_PASS',
    project: PROJECT, hostname: HOST,
    productionBranch: p.production_branch,
    currentProductionDeploymentId: id,
    historicalWranglerVersion: HISTORICAL_WRANGLER,
    syntheticOnly: true, readOnly: true, writesPerformed: false,
    credentialWritePermissionVerified: false,
    costVerified: false, quotaVerified: false,
    privacyQualified: false, remoteBytesVerified: false,
    deployAuthorized: false, studentPublicationAuthorized: false
  };
}

export async function readProject({accountId, token, request = fetch}) {
  if (typeof accountId !== 'string' || !/^[0-9a-f]{32}$/i.test(accountId) ||
      typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,256}$/.test(token)) stop('STOP_CREDENTIALS_UNAVAILABLE');
  let response;
  try {
    response = await request(API + '/accounts/' + accountId + '/pages/projects/' + PROJECT, {
      method: 'GET', redirect: 'error', cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: {Authorization: 'Bearer ' + token, Accept: 'application/json'}
    });
  } catch { stop('STOP_PROVIDER_UNREACHABLE'); }
  if (!response.ok) stop('STOP_PROVIDER_HTTP_' + response.status);
  if (!response.body) stop('STOP_API_RESPONSE');
  const reader = response.body.getReader();
  let bytes = 0;
  const parts = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        stop('STOP_RESPONSE_SIZE');
      }
      parts.push(Buffer.from(value));
    }
  } catch { stop('STOP_RESPONSE_READ'); }
  let payload;
  try { payload = JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { stop('STOP_API_RESPONSE'); }
  return validateProject(payload);
}

async function main() {
  // Only this explicit diagnostic uses environment credentials. Never print them
  // or the raw response, which may contain binding configuration.
  if (process.argv.length !== 3 || process.argv[2] !== '--read-only') {
    console.error('STOP_EXPLICIT_READ_ONLY_REQUIRED'); process.exitCode = 1; return;
  }
  try {
    const receipt = await readProject({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      token: process.env.CLOUDFLARE_API_TOKEN
    });
    console.log(JSON.stringify(receipt, null, 2));
  } catch (e) {
    const message = typeof e?.message === 'string' && /^STOP_[A-Z0-9_]+$/.test(e.message)
      ? e.message : 'STOP_UNEXPECTED';
    console.error(message);
    process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
