# ASC-01/P1 — Baseline effettiva, campata pilota e priorità di riduzione

19 novembre 2026. Estende ASC-01/P0 (PR #130, 94e9eb6767336c14d01766644f2a14b06feec545). Nessuna variazione artistica o runtime. Stato: procedura di osservazione predisposta; qualificazione della nuova esecuzione da verificare.

## Evidenze pregresse verificate
- Master ASP: artifact 14444143410, archivio SHA-256 c7154de191cb6d25890a2881f470f6d6eeba74b2dcab897842f4753403e685c6, file f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab. Riapertura indipendente già documentata; in P1 si recuperano e si verificano nuovamente i byte.
- ART-LEARN-05E, PR #127 head aa7ee147ea65250543cafc16b060d788d4ea9a6e, run 44523720805 SUCCESS, artifact 14530010771 SHA-256 940568e08397d16a7d4445b5027ccdbb2b6f4534d0a16e239b2bef6c1707f0df. 77 libri, 8 sostituzioni in 04-0, nove immagini, protezione e ripristino. Il PASS è tecnico; approvazione artistica e integrazione non effettuate. Il workflow WebGL separato (44523720535) è fallito al passo Install Chromium, non prova un difetto geometrico. Conservare questa distinzione.
- PERF-05A, PR #121 head 900ff114c75709b33a72a44a3525826aa167dc0f, run 44472237574, job 135384293929, artifact 14504877437 SHA-256 fcee5c185fe98ac2f998d38553f649fbacf524616261be1c79823251847b3542. Esito PASS_EXACT_VISUAL_REDUCTION; cinque viste, pixel identici e rollback; nessuna promozione implicita. Misure SwiftShader, non hardware fisico.

| Vista | Sfera: triangoli | Sfera+box: triangoli | Draw call candidata |
| --- | ---: | ---: | ---: |
| atrio | 601646 | 594842 | 60 |
| wide | 601646 | 594842 | 60 |
| wide-left | 652566 | 612606 | 61 |
| wide-right | 646250 | 609638 | 60 |
| portrait | 371822 | 362210 | 60 |

Attribuzione per radice nella variante atrio: campate 355212 triangoli (25 batch, 215 istanze visibili), shell 164324, scenografia 26280, cupola 23760, astri 19784, portali 12274, punti astrali 18 (punti, non triangoli). Somma triangoli 594842; le campate pesano 59,7%, shell 27,6%. Priorità: campate, poi shell; mantenere portali e astri protetti. Non ripetere instancing/culling. L'inventario Blender misura triangoli delle mesh sorgenti, non quelli realmente visibili nel renderer: conservare i due livelli di misura separati.

## Esecuzione P1
Una sola procedura su runner pubblico già usato, Blender 4.2 LTS fissato dalla bootstrap esistente. Recupero di tre archivi esatti (master, 05E, PERF-05A), verifica SHA-256, estrazione dei soli membri attesi senza eseguire materiale proveniente dagli artefatti. Master sola lettura; nessun rendering aggiuntivo in P1. Inventario di ogni mesh originale, gruppi, materiali, UV, riuso, peso triangolare teorico, modificatori, oggetti della campata 04-0, camere e luci. Classifica delle mesh condivise per costo teorico moltiplicato per istanze. Incrocio con misurazioni WebGL reali e ricevuta artistica, copia delle nove immagini originali per il riesame (nessuna approvazione automatica). Ricevuta legata all'head esatto e impronte.

## Piano P2 (non eseguito)
1. Scegliere una sola superficie statica della campata da inventario e riesame 05E, conservando silhouette, iscrizioni e identificativi. Definire UV secondarie e padding; testare bake di una superficie prima della campata intera. Camera e luce fisse, versione non compressa.
2. A master Cycles; B colore+luce precalcolati unlit; C PBR e lightmap separata. Confronto colore e luce sulla stessa geometria prima di qualsiasi decimazione. R128: verificare mapping UV, spazio colore, lightmap, loader locale e CSP; nessun nuovo servizio.
3. Dopo esito positivo, esperimento geometrico distinto per i soli libri ambientali o mesh dominanti evidenziate. Confrontare silhouette, dorsi, ombre e portali; LOD non deve cambiare semantica. Non applicare modificatori al master.
4. Conservare immagini comparabili, triangoli, chiamate di disegno, memoria stimata, latenza e rollback; revisione ART-100 umana. I risultati della prova 05E devono essere osservati prima della scelta finale. Nessuna pubblicazione o autorizzazione studenti.

Evidenze future da registrare in ASP/TRAMA-DE-01 dopo qualificazione e conservazione durevole. Un esito tecnico non certifica realismo o prestazioni fisiche.
