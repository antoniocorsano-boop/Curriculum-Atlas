# ASP-01 — Atlas Scene Package e memoria progettuale

Stato: proposta operativa in bozza, 18 novembre 2026. Perimetro iniziale: AG-04 e antecedenze dirette. Nessuna autorizzazione a pubblicazione, deploy o utilizzo con studenti.

## Unità di conservazione

L'ASP-01 è un pacchetto versionato, non una fusione delle geometrie in un GLB monolitico. La versione iniziale è conservata in archivio separato dal repository, con SHA-256 e dimensione in `ops/atlas-scene-package/registry.json`. I riferimenti sono immutabili; non sovrascrivere una versione precedente.

- `manifest.json`: inventario dei file, dimensioni e SHA-256.
- `governance/catalog.json`: provenienza dei componenti, archivi sorgente, stato di qualificazione, commit.
- `governance/history.jsonl`: registro narrativo e strutturato delle decisioni, evidenze e criticità.
- `governance/decision-register.md`: criteri di conservazione e lacune da colmare.
- `scene/`: sorgenti Blender componenti, architettura, materiali, illuminazione, astri, configurazioni, riferimenti e qualificazione.
- `archives/`: ZIP originali, comprese prove negative e confronti.
- `tools/build_asp01.py`: costruzione e verifica offline con Python standard.

Il catalogo associa ciascun componente al membro esatto del suo archivio sorgente e alla sua impronta. Il verificatore confronta i file estratti con gli originali. Le otto risorse runtime possono essere recuperate dal pacchetto senza dipendere dalla disponibilità degli artefatti temporanei.

## Memoria progettuale

Il repository contiene l'indice cronologico `ops/atlas-scene-package/history.jsonl`. Ogni riga riceve un identificativo stabile ASP-Hnnn, numero di sequenza, data di registrazione, fase, natura, stato, riferimenti a PR/commit e artefatti, sintesi. Il registro esteso conservato nel pacchetto aggiunge motivazioni e dettagli; le due rappresentazioni si raccordano per ID, non sono copie byte-identiche. Il digest del registro esteso è fissato nel registro delle versioni.

Per ogni modifica sostanziale:
1. Registrare contesto, problema, alternative considerate, decisione, motivazione, impatto e vincoli.
2. Collegare commit, PR, ricevuta del collaudo, immagini, misure e, se pertinente, esito negativo. Dichiarare esplicitamente le verifiche mancanti.
3. Aggiungere una nuova riga; una rettifica usa `supersedes` con ID precedente. Non riscrivere le righe esistenti.
4. Se cambia il contenuto binario, generare una nuova versione del pacchetto; conservare la precedente e aggiungere la nuova ricevuta al registro.
5. Verificare integrità e possibilità di recupero, senza confondere PASS tecnico, approvazione artistica, collaudo su dispositivi fisici e autorizzazione al rilascio.

Gli ID ASP-H001–H015 rappresentano una ricognizione iniziale. Le date riportano la registrazione, non necessariamente le date originali degli eventi. Per una ricostruzione storica completa risalire alle fonti originali per ciascuna fase, senza inferire eventi mancanti. Il registro non contiene dati personali di studenti o credenziali.

## Stato e confini

La prima versione raccoglie 14 archivi originali, 47 componenti selezionati, 66 voci inventariate oltre al manifest e 15 registrazioni. L'archivio ha superato la verifica locale di integrità. Non contiene un singolo file Blender della biblioteca completa né uno snapshot integrale dei sorgenti e delle dipendenze dell'applicazione. Contiene i modelli Blender delle parti, i GLB della scena nativa e la provenienza del generatore master. La ricostruzione del master Blender unico, il pacchetto sorgente riproducibile, il ripristino completo automatico e la raccolta della storia antecedente restano aperti.

Il profilo runtime resta P1-spatial; M1/M2 sono qualificati in isolamento, non ancora integrati. La navigazione ha raggiunto 5/6 percorsi completi e l'intervento sulla chiusura è in riqualificazione al momento della fotografia. Nessuna modifica al runtime o al master artistico in questa PR.

ASP-01 è proposto come modello riutilizzabile per TRAMA, ma non è ancora adottato negli altri repository.

## Requisito di chiusura TRAMA-DE-01

Indirizzo approvato il 18 novembre 2026, decisione TRAMA-ADR-023 ([PR centrale #346](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/346)). Dalla voce ASP-H016 il registro richiede contesto, alternative, scelta, motivazione, vincoli, evidenze e attività residue. Una dichiarazione completed/qualified/closed richiede criteri di accettazione collegati a evidenze PASS e nessuna verifica obbligatoria residua. I primi quindici record rimangono fotografia storica immutata. Il controllo non sostituisce l'esame delle evidenze o l'approvazione umana, né rende obbligatorio lo stato di GitHub prima dell'integrazione e configurazione dei controlli richiesti. La nuova evidenza 14442822953 è conservata separatamente dal pacchetto 1.0.0-draft.1, senza alterarlo.
