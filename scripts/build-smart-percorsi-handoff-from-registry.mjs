import {buildSmartPercorsiHandoff} from "./build-smart-percorsi-handoff.mjs";
import {createGovernedSmartPercorsiBindingResolver} from "./smart-percorsi-binding-resolver.mjs";

export async function buildSmartPercorsiHandoffFromGovernedRegistry(manifest,context){
  return buildSmartPercorsiHandoff(manifest,context,createGovernedSmartPercorsiBindingResolver());
}
