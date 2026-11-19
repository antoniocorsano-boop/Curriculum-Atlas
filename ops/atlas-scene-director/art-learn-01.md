# ART-LEARN-01 — Apprendimento artistico da scene Blender verificabili

**Stato:** implementato, qualificazione da eseguire. Nessuna approvazione artistica o pubblicazione.

## Decisione

La qualità artistica non si ottiene aggiungendo indefinitamente motori. Studio Atlas osserva scene di riferimento reali, separa osservazioni, prove causali e ipotesi trasferibili, quindi verifica una modifica sul proprio master prima di promuoverla nel repertorio. Non si tratta di addestrare un modello neurale.

Il master Blender resta la fonte autoritativa; ASD gestisce le proposte, ASI osserva e misura, ASP conserva provenienza ed evidenze. Gaffer resta un adattatore sperimentale qualificato P0/P1A, senza trasferimento fedele dei materiali. Nessuna sostituzione del master.

## Riferimento iniziale

- Classroom — Christophe Seux — CC0 1.0, secondo il catalogo ufficiale https://www.blender.org/download/demo-files/.
- Archivio ufficiale: https://mirror.blender.org/demo/test/classroom.zip.
- Impronta attesa: 0f0ecc58d45f12b2f4272a53e2d8e69135518e16e956b118f10c20d8dcfdf5e6; 70.279.690 byte. Provenienza dell'impronta: https://github.com/ArturPHD/blender_dataset_capture_kit/blob/main/docs/SCENE_ASSETS.md; da verificare sul download prima di aprire il file.
- Master Atlas: artefatto 14444143410; SHA-256 del blend f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab.
- Blender 4.2.23, CPU; nessuna infrastruttura a pagamento introdotta. Non si assumono crediti o capacità cloud illimitati.

## Metodo replicabile

1. Recupero di fonte autorizzata e verifica dell'integrità; apertura senza autoexec, sorgente non salvata.
2. Inventario di geometrie, camera, luci, materiali (nodi, collegamenti, input), texture, ambiente, compositore e gestione colore.
3. Rendering della scena di riferimento a risoluzione e campionamento ridotti, con ablazione di una luce e ripristino. Misura della differenza pixel e controllo del ripristino. Non equivale a un giudizio estetico.
4. Osservazione del master Atlas con lo stesso estrattore; confronto documentato. Nessun parametro trasferito automaticamente.
5. Proposta di una tecnica con fonte, motivazione, ambito, vincoli, parametri candidati, prova richiesta e rollback. I nomi candidati non costituiscono binding qualificati.
6. Solo dopo la revisione: prova isolata sul master derivato, rendering comparativo con camera e geometria protette, riesame artistico e qualificazione. Trasferibilità ad altri mondi da provare separatamente.

## Evidenze

Workflow Atlas Scene Observation — ASI-01 L2 Blender, job ART-LEARN-01. Artefatto atlas-art-learn-01-classroom: source.json, reference/observation.json, reference/reference.png, reference/light-ablation.png, reference/restored.png, atlas/observation.json, comparison.json, log. Il rapporto può essere parziale in caso di arresto. Nessuna copia degli asset sorgente nel repository.

## Criterio di promozione

PASS_REFERENCE_STUDY_ONLY attesta il primo studio e non la qualità di Atlas. Il repertorio contiene solo osservazioni e candidati fino a quando una prova su Atlas dimostra effetto, fedeltà, reversibilità e beneficio percepibile. La scelta di un ulteriore riferimento (Barcelona Pavilion o altra scena con licenza verificata) dipende dagli esiti, non da una promessa di fotorealismo. Nessuna autorizzazione a scrivere sul master, al rilascio o all'uso studenti.

## ART-LEARN-02 — Trasferimento controllato della gerarchia luminosa

Decisione basata sullo studio ART-LEARN-01 qualificato alla revisione bca6ac4c07ce3d38a3737ca79f6d57e267528e6a, esecuzione 44392517820, artefatto 14467907953 (SHA-256 7fc44fa16faf32ff1db6f72a03c96d32981049d389582212abe6b9e76284031d). Classroom: ablazione del sole con variazione di 174.589 su 225.348 pixel e ripristino con MAE zero. Atlas: 47 sorgenti, di cui 36 scaffali, 8 corona, 1 sole, 1 cielo, 1 riempimento frontale. Il numero di luci non è un indice di qualità.

**Ipotesi AL-LIGHT-01:** gerarchia funzionale delle luci, con contributo naturale identificabile e luce pratica subordinata. Non trasferire i watt della scena Classroom.

| Prova | Sole | Cielo | Scaffali | Corona | Frontale |
|---|---:|---:|---:|---:|---:|
| 01 Riferimento | 1 | 1 | 1 | 1 | 1 |
| 02 Ablazione sole | nascosto | 1 | 1 | 1 | 1 |
| 03 Gerarchia pratica | 1 | 1 | 0,40 | 0,35 | 0,25 |
| 04 Gerarchia direzionale | 1,35 | 0,75 | 0,40 | 0,35 | 0,25 |
| 05 Ripristino | 1 | 1 | 1 | 1 | 1 |

Moltiplicatori relativi alla configurazione Atlas, proposti per la prova e non qualificati come ricetta universale. Prova 04 modifica insieme sole e cielo: è un confronto composito, non attribuibile separatamente ai due fattori. Nessuna modifica di geometria, camera, materiali, ambiente o esposizione. I cinque rendering usano lo stesso campionamento, risoluzione e gestione del colore. Misure di variazione RGB, luminanza e ripristino, impronte SHA-256 e inventario delle luci vengono conservati in transfer.json. Il master non è salvato e viene verificato a fine prova. Nessun asset Classroom trasferito.

**Stato:** implementato, collaudo e riesame artistico ancora necessari. PASS_CONTROLLED_TRANSFER_CANDIDATES indica solo prova tecnica; prima della promozione al repertorio ASD occorre confrontare le immagini effettive, verificare leggibilità degli elementi educativi, profondità, naturalezza, qualità delle superfici e stabilità delle altre inquadrature. Il principio è riutilizzabile come ipotesi; la configurazione numerica è specifica del mondo biblioteca. Nessuna pubblicazione, approvazione artistica o autorizzazione studenti.

## ART-LEARN-03 — Risposta superficiale e incidenza solare

**Esito precedente:** ART-LEARN-02, revisione ab9a2002cb4d2f5a48779491c45df55231ab8db2, esecuzione 44449755645, artefatto 14494883566 (SHA-256 db2600e87275d12ff234933824f23bfc2a12514693ce962809c8b3287a45284b). Cinque rendering completati, ripristino RGB esatto; la riduzione delle luci pratiche scurisce la scena e non dimostra un salto artistico. Nessuna variante promossa. Il controllo della navigazione nativa su schermo grande rimane intermittente e indipendente (44449755478).

**Osservazione:** Classroom contiene 38 materiali con nodo Bump; Atlas ne contiene 7. Il conteggio non misura qualità. Atlas possiede già texture, mappe normali, rumore procedurale e variazione di rugosità; non occorre sostituire le risorse. Studio aggiornato ART-LEARN-01: artefatto 14494956906, SHA-256 70b85168db65060fdfbd120b3ae84dad85564e31903e9705fd1402c0be4ad450. Il codice verifica le impronte delle osservazioni e la corrispondenza dei 14 controlli esistenti prima di qualsiasi modifica.

**Ipotesi:** la resa delle superfici dipende dalla risposta combinata di microrelievo e luce radente, non soltanto dal livello di illuminazione. Il gruppo materiali comprende pietra calcarea, pietra levigata, noce e noce incassato, ottone, marmo blu. Si sperimentano 14 controlli di forza del microrilievo, mappe normali e intervalli di rugosità, senza sostituire texture, aggiungere materiali, cambiare colori di base o modificare geometrie. I valori sono ipotesi locali, non ricette universali. Il secondo fattore cambia l'orientamento del sole (rotazione X +15°, Z +25°), senza modificarne potenza e colore; l'incidenza effettiva viene registrata.

**Matrice di prova:** due camere originali (atrium, detail), ciascuna con cinque stati: riferimento, superfici, sole obliquo, combinazione, ripristino. Tutte le luci partono dal master originale, non dalle varianti non approvate di ART-LEARN-02. Risoluzione 60%, 24 campioni CPU, seed fisso. Confronti pixel, luminanza e impronte; protezione dell'inventario, trasformazioni non autorizzate, collegamenti dei nodi, immagini, parametri camera, illuminazione non oggetto del test e gestione colore. Il file master non viene salvato.

**Decisione:** l'eventuale PASS_SURFACE_DIRECTION_CANDIDATES attesta solamente effetto e reversibilità. Riesame visivo di entrambe le viste obbligatorio: evitare rilievi eccessivi, riflessi artificiali, perdita di leggibilità, ombre incoerenti. Nessuna modifica permanente o promozione senza evidenze. La gestione fotografica del colore sarà un esperimento distinto dopo la scelta delle superfici e della direzione luminosa; non si cambia ora per non confondere i fattori. Nessuna autorizzazione a pubblicare, utilizzare con studenti o trasferire automaticamente ad altri mondi.

**Stato:** implementato; collaudo da verificare. Evidenze: atlas-art-learn-03-surface-direction, surface-study.json, dieci PNG e log.


## ART-LEARN-04 — Costruzione originale di una superficie calcarea

**Esito ART-LEARN-03:** revisione 533a4e6d381fb9ea1cc0bc663acd6fd80d01fa15, esecuzione 44451529202, artefatto 14495734118 (SHA-256 6ebb5cf1bfb07536ab8c9ef6f9a5b71dd908ea7fd8b0d3968301198348ede096). Otto immagini comparative più due ripristini qualificati; la variazione di parametri preesistenti non dimostra il salto artistico richiesto. Nessuna variante promossa. NAV-STAB-01 qualificata separatamente, run 44453050469, 14/14 prove; mantenere il percorso di navigazione invariato.

**Osservazione verificata:** il materiale beigeWall di Classroom usa due immagini miscelate e lo stesso segnale per colore (via Hue/Saturation) e altezza Bump. Il materiale Warm limestone di Atlas usa marble_01_diff.jpg, marble_01_rough.jpg, marble_01_nor_gl.jpg, un rumore a scala 24 e un singolo Bump. La denominazione calcarea non garantisce una risposta visiva appropriata. Studio di riferimento artefatto 14495079642, SHA-256 d65d8ddf22f3aaded1aa8dcd1baffaf28042c316c7345080219d17631d248b77.

**Decisione:** sperimentare una rete originale multiscala su un solo materiale esistente: variazione minerale a scala 2,5, grana a 32, pori a 155 (coordinate geometriche globali, scale inverse delle unità Blender, non una caratterizzazione fisica misurata). Colore minerale stratificato, risposta di rugosità correlata alla grana, due microrilievi concatenati. Variante ibrida con 28% del colore esistente, 22% della rugosità esistente e normale originale; variante minerale interamente procedurale. Nessuna texture Classroom trasferita, nessuna nuova risorsa esterna. I parametri cromatici, di scala e di rilievo sono ipotesi locali, non valori universali o certificazione petrografica.

**Protocollo:** atrium e detail, riferimento/ibrida/minerale/ripristino (otto PNG, 75% risoluzione, 32 campioni CPU, seed fisso). Conservare grafi completi dei candidati, impronte, differenze pixel, inventario delle proprietà protette e ripristino del grafo originale. Nessuna modifica permanente al master, agli altri materiali, geometrie, luci, camera o gestione colore. La prova valuta il solo materiale; non prova che i candidati migliorino artisticamente Atlas. Riesame su naturalezza, scala della grana, variazione tonale, leggibilità, continuità architettonica e risposta a luce radente prima di ogni promozione. Il trasferimento ad altri mondi e WebGL richiede qualificazione separata; eventuale cottura delle mappe PBR non ancora attuata. 

**Stato:** implementato; collaudo e riesame visivo da verificare. Evidenza prevista: atlas-art-learn-04-limestone, limestone-study.json, otto PNG e log. Nessun merge, deploy o accesso studenti.


## ART-LEARN-05A — Costruzione scenografica dei libri e delle campate

**Esito ART-LEARN-04:** revisione 1b6888551953fee8603d37c1aed0b7e4168e0fe7, run 44455000142, artefatto 14497991405 (SHA-256 4f54efeaa39f3b913893ac345435ee40856112d23e7c4878fba2682c92e7276d), PASS_LIMESTONE_CANDIDATES. Otto rendering e ripristino qualificati, nessuna promozione artistica. La pietra minerale è una candidata; il riesame non dimostra un salto complessivo. NAV-STAB-01 riconfermata sullo stesso head. Non modificare il percorso di navigazione.

**Evidenze strutturali:** master f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab, ricevuta originale nel pacchetto 14444143410: 495 oggetti in 02 Campate condivise, 25 mesh uniche. Il campione ENGINE-01 P1A (14463507077) contiene quattro campate, 02-0, 03-0, 04-0, 05-0; ciascuna usa sei oggetti Book 0–5 e un oggetto Paper. L'inventario delle mesh valutate suggerisce 77 libri per campata (9+12+19+13+11+13); il numero effettivo è una precondizione da verificare mediante componenti connesse sul master, non un risultato già acquisito. In caso di mancato abbinamento copertina/pagine, arrestare l'esperimento e conservare diagnostica.

**Decisione:** primo incremento circoscritto del realismo architettonico/scenografico: libri. Alternative: sostituire indiscriminatamente gli asset (scartato), variare solo il colore dei materiali (insufficiente), modellare dettagli fisici originali e ridurre la ripetitività mediante geometria misurata (scelta). Procedura originale, nessun asset esterno. Identificazione delle componenti connesse; abbinamento biunivoco copertina/pagine mediante centri misurati, tolleranze sulle coordinate tangenziali e verticali. In quattro campate, fino a 308 libri verificati. Variazione deterministica di altezza (fattore 0,83–1,0) mantenendo larghezza, profondità e pivot alla base; applicare lo stesso fattore al blocco pagine. Non spostare i libri orizzontalmente. Quattro stili, incluso dorso senza decorazione, fasce sottili e targhe in oro opaco, avorio e pelle scura; niente scritte simulate o marchi. Dettagli raggruppati in una mesh per campata, sulla faccia interna derivata dalla matrice effettiva del libro; variazione di forma su copie temporanee delle mesh, non sulla sorgente condivisa.

**Protocollo:** atrium e closeup (riferimento/combinazione/ripristino); detail (riferimento/forma/dorsi/combinazione/ripristino), undici rendering. Closeup originale derivato dal centro dei libri della campata 04-0, 43 mm, distanza 3,55 unità dalla superficie, senza alterare le camere del master. Risoluzione 75%, 24 campioni CPU, seed fisso. Inventario completo degli abbinamenti, conteggi di geometria, impronte, verifica dei materiali e trasformazioni protetti, impronta dei vertici/edge/facce originali, ripristino delle 28 associazioni a mesh condivise e confronto pixel in tre viste. Nessuna modifica di architettura, luci, materiali esistenti, arredi e vegetazione. Le copie temporanee possono incrementare il numero di mesh uniche: prima di estensione a 45 campate è indispensabile progettare varianti riutilizzabili e misurare budget triangoli/draw call su WebGL. L'immagine e il livello di dettaglio devono essere riesaminati, inclusi possibili disallineamenti, intersezioni, decorazioni eccessive e leggibilità della biblioteca. Il PASS tecnico non costituisce approvazione artistica o fisica.

**Stato:** implementato; collaudo non ancora osservato. Evidenza attesa: atlas-art-learn-05a-books, scenography-study.json, undici PNG e log. Gli interventi su irregolarità architettoniche, vegetazione, arredi e luce coerente saranno incrementi distinti dopo il riesame; nessuna promozione automatica, merge o pubblicazione.


## ART-LEARN-05B — Laboratorio originale delle rilegature

**Esito 05A:** revisione 8c622ec0c4354804cb510233bf6348dbb5ebd4fc, run 44457563088, job 135336238723, artefatto 14498509624 (SHA-256 0e572b199df3696006299a4b2fdfe4585f2316f925b8a3d7c8a78b4bbee44782). PASS_BOOK_SCENOGRAPHY_CANDIDATES; 308 abbinamenti copertina/pagine, undici rendering. MAE RGB combinato: atrium 0,00068977; detail 0,00249955; closeup 0,00967151. Ripristino MAE zero in tutte le viste. Il riesame artistico ha rilevato differenze ravvicinate ma aspetto ancora assimilabile a solidi colorati; non estendere le copie temporanee a tutte le campate. NAV-STAB-01 riconfermata, run 44457563278.

**Decisione:** modellare una collezione originale riutilizzabile di quattro rilegature, fuori dalla scena architettonica. Osservare le 77 componenti dei sei gruppi Book 0–5 della campata 04-0 e derivare quattro profili dimensionali ai quantili 15%, 38%, 63%, 86% ordinati per altezza. Le misure sono in unità Blender, non rilevazioni metrologiche di libri reali. Titoli originali ATLANTE, NATURA, STORIA, GEOMETRIA; palette rosso bruno, verde, blu, ocra. Ogni candidato ha tavole di copertina, spigoli arrotondati, dorso a sezione curva chiusa, nervature, filetti metallici, blocco pagine, risguardi e tipografia vettoriale. Tre rivestimenti in pelle procedurale e uno in tessuto; variazione cromatica e rugosità a più scale, rilievo minuto correlato. Pagine con segnale periodico sulla coordinata dello spessore e variazione di invecchiamento. Nessuna immagine o modello esterno, nessun marchio; i titoli indicano soggetti generici e non riproducono edizioni esistenti.

**Protocollo:** studio neutro separato; comparatore semplificato ricostruito con le stesse dimensioni e palette (non è un rendering originale Atlas). Posizioni, orientamenti, camere, luci, risoluzione 1000×750, esposizione e campionamento 40 CPU invariati tra comparatore e candidato. Vista dorsi e pagine con riferimento/candidato/ripristino, macro con riferimento/candidato: otto PNG. Verifica della firma di stato della scena originale e SHA-256 del master in ogni rendering. Il master non viene salvato. Nessuna sostituzione delle campate in questa fase.

**Riuso:** scrittura separata Atlas-Book-Collection.blend mediante Blender library write, contenente esclusivamente quattro collezioni originali contrassegnate come asset e dipendenze proprie. Secondo processo Blender pulito: append delle quattro collezioni, confronto degli inventari geometrici, trasformazioni, materiali assegnati, testo e metadata; nessuna dipendenza da librerie o immagini esterne. Il conteggio triangoli base non è una misura di costo GPU finale. WebGL richiederà semplificazione controllata, valutazione dei modificatori e conversione tipografica, cottura PBR e budget texture/draw call; non si alterano la navigazione e il renderer attuale.

**Criteri di riesame:** naturalezza del profilo, rapporto tavole/blocco pagine, coerenza delle nervature, leggibilità della tipografia, scala del microrilievo, risposta alla luce delle pagine e della rilegatura, assenza di intersezioni visibili. Il comparatore controllato misura il contributo complessivo dei dettagli, non isola ogni tecnica; eventuali difetti dovranno essere analizzati nei rendering. Nessun PASS artistico automatico o approvazione di estensione. Evidenze: atlas-art-learn-05b-book-library, file Blender, book-library-study.json, library-roundtrip.json, otto PNG e log. Stato: implementato, verifica ancora da osservare. Nessun merge, deploy, uso studenti o qualificazione WebGL.
