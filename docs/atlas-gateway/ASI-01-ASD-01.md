# ASI-01 / ASD-01 — Osservazione e regia della scena

Stato: candidata L1, sola lettura, nessuna autorizzazione runtime. La decisione dell'utente del 18 novembre 2026 autorizza il percorso di ricerca e realizzazione, non una promozione automatica delle decisioni.

## Raccordo con TRAMA

Non si crea una base di conoscenza concorrente. ASP-01 è la fonte di dominio per scene e dossier; ASD-01 è il contratto di regia; ASI-01 è il lettore specialistico delle evidenze. TRAMA-ADR-015 e ProjectContextSnapshot v1 governano la proiezione; il modello dual-speed separa fatti storici e osservazioni correnti. TRAMA-DE-01 (ADR-023, PR centrale #346) governa la documentazione delle decisioni. L'indice del Control Center resta derivato e in sola lettura. La presente tranche non cambia il Control Center, non abilita DOS-A1 né nuove scritture o pubblicazioni.

## L1 — Prima capacità effettiva

Il comando `python3 scripts/scene-intelligence.py` legge esclusivamente l'archivio decisionale, la ricevuta del master Blender e sei regole candidate versionate. `--tag repeated-meshes` restituisce una proposta motivata e le verifiche necessarie per una scena con geometrie ripetute. Ogni regola dichiara fonti, stato atteso, precondizioni, prova e limite. L'output è JSON derivato, non una nuova authority né una modifica al registro. Fonte assente, diversa o superata blocca il suggerimento relativo. L'osservazione del master è una fotografia di collaudo vincolata alla ricevuta, non telemetria in tempo reale; non si dichiara aggiornamento live né addestramento del modello.

La memoria positiva e negativa conserva culling, decodifica, ALS, confronto materico, rilievo di navigazione e ripristino. La qualifica isolata non equivale a qualifica applicativa; M1/M2 restano non integrati, il timeout non è dichiarato risolto. Il master Blender riaperto è un candidato artistico, non una scena approvata. Il pacchetto iniziale resta immutato; l'archivio del master è conservato separatamente.

## ASD-01 — Perimetro dichiarativo da attuare

Separare scena, regia, osservazione e proposta. La regia deve riferirsi agli identificativi stabili di asset e gruppi di ASP-01 e dichiarare stati, eventi, vincoli e parametri con unità e intervalli. Le sequenze devono essere finite e reversibili; niente codice arbitrario, URL, accessi o nuove authority nei manifest. Le capacità iniziali sono selezione di camera, profilo di illuminazione e movimento ALS, con default statico e rispetto di movimento ridotto. Un adattatore Blender e uno WebGL interpreteranno lo stesso contratto, senza pretendere identità fotometrica. Nella tranche L1 il contratto è progettuale: non esiste ancora un interprete ASD-01 né una UI operativa.

## Progressione governata

- L1: leggere inventario e prove, recuperare regole candidate con fonti e limiti; test reali e negativi.
- L2: acquisire una fotografia di scena effettiva mediante adattatori di sola lettura (Blender e WebGL), misurare cambiamenti di inventario e confrontare inquadrature. Aggiornamenti live effimeri; promozioni solo deliberate.
- L3: proporre una regia dichiarativa valida, spiegare alternative e richiamare fallimenti precedenti; verificare compatibilità, accessibilità e costo.
- L4: preparare una variante reversibile in ambiente isolato, conservare confronto ed esito; nessun effetto sul master.
- L5: solo procedure specificamente autorizzate dopo le necessarie verifiche e revisione umana. Non fa parte di questa PR.

## Gate L1

Sei regole collegate alle prove reali, query selettiva, inventario master, fonti mancanti e superate bloccate, nessuna promozione di authority, nessuna scrittura al runtime, risultato ripetibile a parità di input. Conservare ricevuta del collaudo e registrare l'esito nel dossier ASP-01. Il raccordo tecnico con Context Pack e l'osservazione del renderer sono fasi successive. Nessun dato personale o studente, nessun servizio esterno, nessuna spesa.
