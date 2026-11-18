# ART-100 — Direzione artistica e mondo parametrico

Stato: CANDIDATE / PLAN_ONLY. Riferimento qualificato conservato: 5ff458d51f48d4bf984525b1206b58aca35c0ab1. Decisione utente del 18 novembre: ogni mondo è parametrico; obiettivo artistico cinematografico fantasy educativo originale. Nessuna autorizzazione di pubblicazione o nuova spesa.

## Invariante di prodotto

Ogni mondo, anche 2D, 3D o ibrido, ha un'identità, uno stato iniziale versionato, proprietà tipizzate, azioni, transizioni, conseguenze osservabili e prove. Parametrico non significa imporre le stesse luci o la stessa meccanica a mondi differenti, né permettere all'AI di cambiare liberamente tutto. Il mondo dichiara le proprie capacità; una proprietà non dichiarata è indisponibile, una proprietà senza adattatore è solo intenzione progettuale. Estensioni di dominio (variabili scientifiche, oggetti, dialoghi, regole, audio e simulazioni) richiederanno contratti specifici, non valori universali arbitrari.

Raccordo: TRAMA-ADR-020 e Compact Learning World Specification v1, revisione TRAMA 99879f3e7edc4097f71a7e66060280a4be7b8e88. World Brief e Pathway Authoring Package restano le fonti di authoring; non vengono sostituiti. Arena conserva l'autorità curricolare. Studio Atlas è l'ambiente dell'ideatore. ASD è l'autorità del piano, ASI osserva, ASP conserva. Il nuovo catalogo è un'estensione candidata di ASD, non un secondo editor/registro autorevole. Non modifica i contratti centrali.

## Visione biblioteca — primo banco artistico, non stile imposto agli altri mondi

Conservare cupola, geometrie identitarie, librerie, portali, astri, paesaggio e accessibilità. Elevare la scena a un ambiente educativo monumentale e accogliente, con luce narrativa, ombre leggibili, matericità nobile, atmosfera e meraviglia discreta; qualità da film fantasy scolastico, senza riprodurre scenografie o simboli distintivi di opere esistenti. Palette di riferimento: noce, pietra avorio, ottone brunito, oro caldo, cielo freddo tenue. Contrasto motivato, non oscurità generalizzata. Ogni altro mondo ha una propria visione derivata dal World Brief e dal suo scopo educativo.

## Parametri e modello di esecuzione

Il catalogo art-parameters.json contiene 49 voci in otto famiglie: mondo (5), identità (5), composizione (4), luce (11), materiali (9), ambiente (5), meraviglia (5), interazione (5). Le scale 0–1 sono coordinate progettuali, non misure fisiche già calibrate. Cinque riferimenti P1 recuperano tipi e intervalli esistenti, verificati contro parameters.json; i coefficienti WebGL sono legati alla prova biblioteca, non universali. La modalità di rappresentazione e il profilo esplicito delimitano la disponibilità. Il prototipo di pianificazione produce variazione e rollback con identità mondo/scena, revisione, hash del profilo e del catalogo; rifiuta richieste su altro mondo, proprietà ignote, valori fuori intervallo, mutamenti dello stato educativo tramite regia artistica e attivazione di movimento/audio senza contratto di consenso/accessibilità. Non legge ancora World Brief automaticamente, non è un interprete runtime generale.

Per ogni mondo: World Brief -> manifesto di capacità e riferimenti alle risorse -> osservazione del riferimento -> piano di modifica -> validazione di vincoli e prerequisiti -> adattatore isolato -> confronto -> rollback -> revisione umana -> conservazione della scelta. Le transizioni didattiche devono avere un contratto separato, con precondizioni, causalità, conseguenze e accessibilità; l'intenzione estetica non può alterare la validità pedagogica.

## Rubrica artistica, 100 punti

| Dimensione | Peso | Evidenza richiesta |
|---|---:|---|
| Architettura/composizione | 15 | gerarchia, profondità, silhouette e focus |
| Luce/fotografia | 20 | controllo zone chiare/scure, ombre, gerarchia, comfort |
| Materiali | 20 | dettaglio ravvicinato, scala texture, patina, riflessi |
| Ambiente | 15 | continuità interno-esterno, profondità e plausibilità |
| Meraviglia | 10 | identità, sobrietà, funzione narrativa |
| Interfaccia | 10 | integrazione visiva, leggibilità, orientamento |
| Esperienza | 10 | mobile/desktop, fluidità, accessibilità |

Valutazione umana per dimensione: 0 assente, 1 debole, 2 adeguato, 3 convincente, 4 eccellente. Punti = peso × livello / 4. Annotare osservazioni e immagini per ciascun livello; elementi non valutabili restano non valutati, non automaticamente eccellenti. Soglia finale proposta 95/100, non promessa di perfezione. Il precedente 63/100 è una stima non qualificata: non costituisce baseline ufficiale. Le metriche pixel e luminanza sono diagnosi, non punteggio artistico. Il confronto richiede almeno vista principale desktop, smartphone, materiali, astri, paesaggio, portali; stessa camera e condizioni salvo il parametro sotto prova. Nessun punteggio sostituisce i gate tecnici.

## Piano di implementazione e gate

1. ART-100/P0: catalogo, profilo, pianificatore di intento, rifiuti negativi e prova contrattuale su due mondi dimostrativi 2D/3D. Non è ancora prova di riuso di renderer.
2. LIGHT-01: confronto isolato sulla biblioteca qualificata. Riferimento esposizione .82, cielo .22, sole 1.05, riempimento .18. Due profili: chiaroscuro (.78/.14/1.18/.10), luce aperta (.90/.27/1.10/.20). Stesso master e camera, istogramma della luminanza visualizzata, zone scure/chiare, differenze RGB, immagini e ripristino esatto. Questi sono esperimenti, non profili approvati; non introducono ancora ombre volumetriche o nuove luci. Prima si vede il risultato, poi si decide se adottare o progettare un adattatore aggiuntivo.
3. LIGHT-02: studio ombre di contatto, direzione/temperatura, luce indiretta e volumetria; scegliere solo gli interventi con beneficio percepibile e costo sostenibile. Confronto Blender/WebGL senza pretendere equivalenza fotometrica. Verifica mobile.
4. MATERIAL-01: noce/pietra/ottone, rugosità, microstruttura, patina; mantenere M1/M2 non integrati finché separatamente qualificati.
5. ENV-01: paesaggio coerente, profondità, cielo, vegetazione e transizione luminosa.
6. WONDER-01/UI-01: astri e portali, identità, movimento facoltativo e accessibile, comandi chiari e navigazione non regressiva.
7. ART-REVIEW: mostrare immagini reali e attribuire punteggio motivato con revisione umana; poi prova di trasferimento su Museo Zero (World Brief canonico, esperienza 2D preservata) e altro mondo con adattatori espliciti. Non duplicare motore.

Vincoli trasversali: master immutabile durante le prove, risorse verificate, nessun nuovo servizio a pagamento, nessuna pubblicazione/integrazione in main, nessun dato personale. Non confondere qualificazione automatizzata, approvazione estetica, autorizzazione didattica e pubblicazione.
