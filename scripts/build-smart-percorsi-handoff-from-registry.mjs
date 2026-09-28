import {buildSmartPercorsiHandoff} from "./build-smart-percorsi-handoff.mjs";
import {createGovernedSmartPercorsiBindingResolver} from "./smart-percorsi-binding-resolver.mjs";

export async function buildSmartPercorsiHandoffFromGovernedRegistry(manifest,context,{root=process.cwd()}={}){
  const resolver=createGovernedSmartPercorsiBindingResolver({root});
  return buildSmartPercorsiHandoff(manifest,context,resolver);
}
