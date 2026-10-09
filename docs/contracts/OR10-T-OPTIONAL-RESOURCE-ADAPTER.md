# OR-10-T — Atlas Optional Resource Adapter

**Stato:** PROPOSED / READ_ONLY / NO_RUNTIME  
**Atlas role:** PUBLIC RESOURCE/NAVIGATION SURFACE  
**DOS-A1:** RUNTIME_DEFERRED

## Scopo

Definire un adapter read-only che esponga risorse Atlas a `lesson.preparation.observe` senza trasformare Atlas in passaggio obbligatorio o authority curricolare.

## Input

La ricerca può usare riferimenti derivati dal contesto:
- disciplina;
- annualità/grado;
- objective/source refs;
- tipo risorsa;
- publication/readiness state.

## Output

```ts
interface AtlasOptionalResourceRef {
  resourceId: string
  publicationPath?: string
  objectiveIds: readonly string[]
  provenanceRef: string
  publicationState: string
}
```

## Regole

- Atlas è opzionale;
- solo risorse con provenance valida possono essere restituite;
- nessuna pubblicazione viene avviata;
- nessuna rivendicazione di autorità sul curricolo;
- nessuna modifica dei materiali;
- fallimento Atlas non blocca Docente OS.

## Invarianti

- OR10-T-01 Atlas optionality;
- OR10-T-02 read-only discovery;
- OR10-T-03 provenance required;
- OR10-T-04 publication boundary unchanged;
- OR10-T-05 Arena authority unchanged;
- OR10-T-06 DOS-A1 invariato.

## Exit

La slice è qualificabile quando il mapping read-only è documentato e i gate Atlas restano PASS.
