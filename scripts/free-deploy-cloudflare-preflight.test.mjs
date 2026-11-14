import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProject, readProject, PROJECT, HOST, HISTORICAL_WRANGLER} from './free-deploy-cloudflare-preflight.mjs';

function fixture() {
  return {success:true, errors:[], result:{
    name:PROJECT, subdomain:HOST, source:null, domains:[HOST],
    uses_functions:false, production_branch:'main',
    canonical_deployment:{id:'11111111-2222-3333-4444-555555555555', uses_functions:false},
    deployment_configs:{preview:{env_vars:{},r2_buckets:{}},production:{env_vars:{}}}
  }};
}
const credentials={accountId:'a'.repeat(32),token:'t'.repeat(40)};

test('exact static project, no implied authority',()=>{
  const r=validateProject(fixture());
  assert.equal(r.state,'PROJECT_METADATA_PASS');
  assert.equal(r.historicalWranglerVersion,HISTORICAL_WRANGLER);
  for(const k of ['writesPerformed','credentialWritePermissionVerified','costVerified','quotaVerified','privacyQualified','remoteBytesVerified','deployAuthorized','studentPublicationAuthorized']) assert.equal(r[k],false,k);
});
test('wrong name and hostname rejected',()=>{
  for(const [k,v] of [['name','other'],['subdomain','other.pages.dev']]){
    const p=fixture();p.result[k]=v;
    assert.throws(()=>validateProject(p),/STOP_PROJECT_IDENTITY/);
  }
});
test('git-linked project and custom domain rejected',()=>{
  const p=fixture();p.result.source={type:'github'};
  assert.throws(()=>validateProject(p),/STOP_GIT_SOURCE/);
  const q=fixture();q.result.domains.push('example.com');
  assert.throws(()=>validateProject(q),/STOP_CUSTOM_DOMAIN/);
});
test('functions and unknown functions fail closed',()=>{
  for(const v of [true,undefined,null]){
    const p=fixture();p.result.uses_functions=v;
    assert.throws(()=>validateProject(p),/STOP_FUNCTIONS_OR_UNKNOWN/);
  }
  const q=fixture();delete q.result.canonical_deployment.uses_functions;
  assert.throws(()=>validateProject(q),/STOP_FUNCTIONS_OR_UNKNOWN/);
});
test('both deployment configurations must exist and no runtime bindings',()=>{
  for(const mode of ['preview','production']){
    for(const k of ['r2_buckets','env_vars','kv_namespaces','d1_databases','ai_bindings','services','future_paid_binding','browsers','mtls_certificates']){
      const p=fixture();p.result.deployment_configs[mode][k]={x:{}};
      assert.throws(()=>validateProject(p),/STOP_RUNTIME_BINDING/);
    }
  }
  const q=fixture();delete q.result.deployment_configs.preview;
  assert.throws(()=>validateProject(q),/STOP_DEPLOYMENT_CONFIG/);
});
test('analytics and invalid rollback or branch rejected',()=>{
  const p=fixture();p.result.build_config={web_analytics_tag:'x'};
  assert.throws(()=>validateProject(p),/STOP_ANALYTICS/);
  const q=fixture();q.result.canonical_deployment.id='missing';
  assert.throws(()=>validateProject(q),/STOP_ROLLBACK_REFERENCE/);
  const r=fixture();r.result.production_branch='../elsewhere';
  assert.throws(()=>validateProject(r),/STOP_PRODUCTION_BRANCH/);
});
test('API errors fail closed',()=>{
  assert.throws(()=>validateProject({success:false,result:{}}),/STOP_API_RESPONSE/);
  const p=fixture();p.errors=[{code:1}];
  assert.throws(()=>validateProject(p),/STOP_API_RESPONSE/);
});
test('missing credentials do not invoke network',async()=>{
  let calls=0;
  await assert.rejects(readProject({accountId:'bad',token:'bad',request:()=>{calls++;}}),/STOP_CREDENTIALS_UNAVAILABLE/);
  assert.equal(calls,0);
});
test('GET fixed API path, no redirect, one request, no secret in receipt',async()=>{
  let calls=0;
  const r=await readProject({...credentials,request:async(url,opts)=>{
    calls++;assert.equal(url,'https://api.cloudflare.com/client/v4/accounts/'+credentials.accountId+'/pages/projects/'+PROJECT);
    assert.equal(opts.method,'GET');assert.equal(opts.redirect,'error');assert.equal(opts.headers.Authorization,'Bearer '+credentials.token);
    return new Response(JSON.stringify(fixture()),{status:200});
  }});
  assert.equal(calls,1);assert.ok(!JSON.stringify(r).includes(credentials.token));assert.ok(!JSON.stringify(r).includes(credentials.accountId));
});
test('403, network refusal, invalid JSON and excessive body stop',async()=>{
  for(const [request,pattern] of [
    [async()=>new Response('forbidden',{status:403}),/STOP_PROVIDER_HTTP_403/],
    [async()=>{throw new Error('redirect');},/STOP_PROVIDER_UNREACHABLE/],
    [async()=>new Response('bad'),/STOP_API_RESPONSE/],
    [async()=>new Response('x'.repeat(513*1024)),/STOP_RESPONSE_READ/]
  ]) await assert.rejects(readProject({...credentials,request}),pattern);
});
