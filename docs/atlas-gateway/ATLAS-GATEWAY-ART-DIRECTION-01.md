# ATLAS-GATEWAY / ART-DIR-01 — Direzione artistica e produzione dell'atrio

**Stato:** specifica artistica da usare per il prossimo master; non equivale ad approvazione del modello corrente.
**Data:** 20 novembre 2026. **Filone:** [ATLAS-GATEWAY-01 #151](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/151), [TRAMA AWC-DELIVERY-01 #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).
**Candidata tecnica conservata:** [PR #152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152).

## 0. Mandato irrevocabile senza nuova decisione dell'ideatore

Realizzare **un atrio tridimensionale vero**, di qualità visiva prossima all'immagine storica di Arena allegata alla conversazione, trasformato nell'identità Atlas. Non una biblioteca di scaffali, non uno screenshot sospeso, non un museo vasto da attraversare.

**Esperienza promessa:** aprendo Atlas, l'utente riconosce immediatamente uno spazio architettonico di qualità cinematografica con quattro grandi portali. Può orientarsi, ruotare leggermente il punto di vista, scegliere una destinazione realmente funzionante e tornare all'ingresso. Il 3D è parte del prodotto, ma la navigazione non deve ostacolare la scelta.

**Vincoli:** zero nuovi pagamenti obbligatori, risorse con licenze verificate, nessun dato personale degli studenti, nessun secondo runtime, nessuna sostituzione della home prima del collaudo e dell'autorizzazione.

## 1. La visione artistica che deve governare le scelte

**Concetto:** «La conoscenza è uno spazio aperto e riconoscibile». Un luogo istituzionale contemporaneo e accogliente, con la qualità di una visualizzazione architettonica cinematografica.

**Qualità emotive:** meraviglia sobria; fiducia; orientamento; senso della scoperta. Non videogioco aggressivo, non ufficio aziendale, non fantascienza eccessiva, non sala vuota illuminata da neon.

**Linguaggio formale:**
- Atrio semicircolare con volumetria reale; architettura compatta ma profonda, pareti e costoloni credibili.
- Corona/cupola centrale luminosa in alto, costruita per guidare lo sguardo, non per oscurare i portali.
- Quattro portali monumentali traslucidi su arco concavo, con gerarchia e spaziatura equilibrata; etichette reali **Curricolo**, **Esplora**, **Percorsi**, **Esperienze**. Il riferimento Arena aveva altre funzioni: conservarne il linguaggio visivo, non i nomi.
- Piattaforma centrale ellittica a sviluppo basso, con marchio **ATLAS** leggibile e non attraversato da geometria.
- Pavimento in pietra scura levigata, riflessi selettivi e continuità di profondità; elementi secondari architettonici, eventualmente vegetazione laterale molto discreta.
- Finiture coerenti: metallo brunito, dettagli ottone satinato, vetro blu controllato, superfici opache alternate a quelle riflettenti. Gli spessori, smussi e giunti devono essere plausibili.

**Palette indicativa, da convalidare sul render:**
- Blu notte e grafite: #0A1625, #13253B, #1E354A (superfici e volumi).
- Blu luminoso controllato: #3275B0 e #6DAEE2 (portali e lucernario).
- Ottone caldo: #B99562 e #E3C58A (bordi e luce architettonica).
- Avorio attenuato: #F4EEE3 (testi e punti focali).
Le proporzioni di colore devono favorire il contrasto e la leggibilità: il blu non è una luce uniforme che colora tutto.

**Da evitare:** cilindri e cerchi isolati che sembrano primitive, pareti senza spessore, illuminazione uniforme, elementi molto riflettenti su tutte le superfici, travi senza architettura, portali piccoli, scritte duplicate tra mesh e interfaccia, fasci volumetrici opachi, distorsioni grandangolari eccessive, ornamentazione gratuita.

## 2. Composizione: prima di qualsiasi modellazione di dettaglio

**Riferimento primario:** lo screenshot storico fornito dall'ideatore in chat il 20/11/2026. È una base compositiva; il fotogramma originale ad alta risoluzione **non è ancora archiviato nel repository** e non va spacciato per sorgente 3D.

**Telecamera principale / HERO-DESKTOP:** 16:9, 1280×720 o superiore; prospettiva centrale, asse dell'oculo allineato alla piattaforma; quatro portali grandi, sagome separate; profondità del pavimento ben percepibile; riflessi che conducono alla piattaforma. Il fulcro Atlas deve restare visibile e la corona superiore deve essere riconoscibile.

**Telecamera / HERO-MOBILE:** impaginazione dedicata per 390×844, non semplice ritaglio dell'immagine 16:9. Avvicinare il punto di osservazione, ridurre lo spazio del soffitto, mantenere piattaforma e portali riconoscibili; salvare sempre un accesso HTML equivalente e comandi con bersagli di almeno 44 px. Controllare anche 320 px e orientamento orizzontale.

**Camera matching:** sperimentare fSpy con i punti di fuga del riferimento; importare eventualmente la camera in Blender tramite l'importatore ufficiale se compatibile con la versione in uso. È una stima utile della prospettiva, non una ricostruzione automatica. Se l'immagine sintetica non presenta linee sufficientemente coerenti, fissare manualmente una camera e registrarla. Conservare la telecamera del render per confrontare la stessa vista dopo l'esportazione web.

**Controlli obbligatori prima dei materiali:** 3 immagini di blocco compositivo: 16:9, mobile e una vista laterale con parallasse. In grigio, senza effetti; verificare sagome, scala, visibilità e gerarchia. Se non funzionano, il lavoro non passa alla fase materiali.

## 3. Progettazione della luce e dei materiali

**Luce principale:** luce fredda diffusa in ingresso dalla corona superiore, che rivela grandi volumi e profondità.
**Secondaria:** linee architettoniche calde su cornici e base, senza bruciare il contrasto.
**Riempimento:** debole, di tono neutro, sufficiente a non perdere i contorni del fondo.
**Accenti:** valorizzare i portali e le discontinuità, non aumentare semplicemente la potenza di tutte le lampade.

**Materiali:** pochi materiali fisicamente plausibili, preparati come famiglia coerente; ruvidità, scala, texture e microimperfezioni devono evitare l'effetto «plastica levigata». Usare texture PBR di provenienza documentata, preferendo asset CC0 Poly Haven / ambientCG. I modelli architettonici possono essere assemblati modularmente; non modellare manualmente tutti gli arredi se esistono equivalenti autorizzati.

**Master offline:** Blender Cycles, profilo colore scelto e registrato (AgX da confrontare con l'output Atlas), immagine di riferimento e passaggi separati per valutare illuminazione, albedo e materiali. Il contrasto cinematografico deve essere prodotto dalla luce e dai materiali, non soltanto da postproduzione e bloom.

**Trasferimento web:** NON presumere che un GLB includa la luce di Cycles. L'esportatore glTF non trasferisce luci Area e illuminazione World come nel render di Blender. Per le superfici statiche scegliere consapevolmente baking, UV secondarie e gestione delle mappe nel runtime o incorporazione controllata nel materiale; verificare in Three.js r128 l'effettiva compatibilità. Le riflessioni del pavimento vanno progettate con una versione web economica; evitare costosi effetti continui sul telefono.

## 4. Competenze e responsabilità, anche con squadra ridotta

**Art director / responsabile della visione (una figura):** interpreta il riferimento, sceglie e scarta i modelli, blocca camera e composizione, approva palette e luce, difende leggibilità e qualità. Firma una decisione visiva prima di autorizzare l'esportazione. **Questa funzione non può essere sostituita dai soli test CI.**

**Artista di ambienti / visualizzazione architettonica:** assembla strutture modulari e asset professionali in Blender; cura scala architettonica, intersezioni, smussi, profondità, disposizione dei portali e dettaglio significativo.

**Artista materiali e illuminazione:** cura materiali PBR, fonti luminose, direzione e bilanciamento, resa Cycles e coerenza dei colori. Può coincidere con l'artista di ambienti se ha le competenze.

**Artista tecnico web:** traduce il master approvato in GLB e risorse precalcolate, controlla licenze, formati, chiamate grafiche e leggerezza senza demolire l'aspetto. Riusa la PR #152; non determina da solo la direzione estetica.

**Revisore del prodotto:** l'ideatore Atlas approva il fotogramma comparato e poi la fruibilità sul telefono fisico. Un secondo giudizio esperto su composizione/illuminazione è auspicabile, ma non richiede per forza un organigramma di cinque persone. È realistico lavorare con un bravo artista generalista e una funzione tecnica distinta.

**Assistente AI:** può organizzare riferimenti, proporre alternative, creare una distinta risorse, segnalare incongruenze, automatizzare controlli ripetitivi e confrontare render. Non può dichiarare da sola la qualità professionale ottenuta in assenza di valutazione visiva competente.

## 5. Processo rapido, vincolato a risultati

| Passaggio | Prodotto | Criterio di uscita |
|---|---|---|
| D0 — Riferimento e direzione (mezza/una giornata) | Scheda artistica, fonti, palette, cinque caratteristiche irrinunciabili, camera stimata | L'ideatore riconosce ciò che vogliamo ottenere |
| D1 — Scelta dei modelli (una giornata) | Set modulare utilizzabile e licenze | Basta materiale visivo di livello architettonico, non primitive da zero |
| D2 — Blocco compositivo (una giornata) | Tre viste grigie, desktop/mobile/laterale | Architettura, portali e piattaforma funzionano senza materiali |
| D3 — Primo render vero (1–2 giornate) | Render Cycles, stessa prospettiva del riferimento, luci e 5–8 materiali accurati | **Giudizio artistico favorevole**, diversamente cambiare kit/composizione |
| D4 — Conversione al web (2–3 giornate) | GLB e texture con luce trasferita/precotta, portali reali | Confronto A/B della stessa camera, senza regressioni evidenti |
| D5 — Qualifica d'uso (1–2 giornate) | Smartphone reale, trasferimento iniziale, fluidità, interazioni, fallback | Accettazione d'uso o elenco breve di riparazioni |

Le durate sono **ipotesi per un unico atrio con asset adeguati e competenza disponibile**, non scadenze garantite. Non avviare mesi di rifinitura procedurale: **se D3 non supera il controllo, cambiare risorse e impostazione invece di fare decine di piccole PR.**

## 6. Rubrica di revisione artistica (valutazione umana, non CI)

Ogni voce da 1 a 5, dove 1 = insufficiente, 3 = parzialmente convincente, 5 = pienamente convincente. La decisione richiede **nessuna voce critica sotto 4**, e giudizio esplicito dell'ideatore.

| Area | Peso indicativo | Segnale di qualità |
|---|---:|---|
| Architettura, forme e profondità | 25% | Atrio credibile e articolato, non geometria da laboratorio |
| Composizione, camera e scala | 25% | Portali leggibili e gerarchia centrale, desktop e mobile |
| Illuminazione e atmosfera | 20% | Luce fredda/calda bilanciata, profondità e contrasto realistico |
| Materiali e dettagli | 20% | Riflessi e microstruttura credibili, raccordi, struttura fisica |
| Identità Atlas e orientamento | 10% | Marca corretta, quattro destinazioni, nessun elemento distraente |

Le aree critiche sono **architettura, composizione e illuminazione**. Il punteggio supporta il confronto, non sostituisce il giudizio umano; la soglia indicata è una proposta di governo del progetto.

**Prova di leggibilità a tre secondi:** un osservatore capisce immediatamente che è un atrio tridimensionale contemporaneo, vede quattro direzioni praticabili e riconosce ATLAS. Non deve decifrare un'immagine buia o una foresta di linee luminose.

**Fidelità non significa copia cieca:** la composizione deve richiamare il riferimento, ma l'architettura deve reggere anche da un punto di vista laterale, la funzione è Atlas anziché Arena e il movimento reale non può svelare quinte piatte.

## 7. Registro delle risorse e consegne obbligatorie

Per ogni asset esterno: nome, fonte, URL, licenza verificata, file master, versione, modifiche, peso, responsabile e possibilità di redistribuzione. Non presumere che «gratis» significhi «CC0». Per la prima prova limitarsi a una raccolta minima e selezionata.

**Consegna artistica D3:** file .blend modificabile, tre immagini compositive (clay, luce, materiali), render principale 16:9, vista mobile, confronto affiancato con riferimento, distinta delle fonti e decisione «APPROVATO / DA RIPROGETTARE».

**Consegna tecnica D5:** GLB ottimizzato, texture, prove della luce trasferita e della camera equivalente, rapporto peso/compressione, schermate WEBGL desktop/mobile, collaudo Android fisico, riscontro destinazioni funzionanti, licenze.

**Stati di governo:** PROPOSTO → COMPOSIZIONE APPROVATA → MASTER ARTISTICO APPROVATO → WEB QUALIFICATO → UTILIZZABILE → PUBBLICATO (solo su distinta autorizzazione).

## 8. Riferimenti tecnici e metodologici verificati

**Studi ed esperienze professionali**
- Blender Studio — pipeline per asset / illuminazione: https://studio.blender.org/tools/pipeline-overview/introduction
- Blender Studio — modellazione di asset progettati: https://studio.blender.org/tools/pipeline-overview/asset-creation/modeling
- Viktoria Didenko — ideazione → blocco → luce → dettagli: https://80.lv/articles/lighting-mood-composition-in-environments
- Dominique Buttiens — composizione, luce, grandezza dei volumi, progetti piccoli e curati: https://80.lv/articles/dominique-buttiens-on-mastering-environment-art-and-finding-the-job
- Blender Artists — composizione e luce e revisione del realismo: https://blenderartists.org/t/interior-visualization-skills/1625654

**Strumenti specifici**
- fSpy, stima camera da immagine: https://github.com/stuffmatic/fspy
- Importatore Blender fSpy: https://github.com/stuffmatic/fSpy-Blender
- Export ufficiale Khronos glTF Blender: https://github.com/KhronosGroup/glTF-Blender-IO
- Ottimizzazione e ispezione glTF: https://github.com/donmccurdy/glTF-Transform
- Materiali/modelli CC0 Poly Haven: https://polyhaven.com/license
- Materiali CC0 ambientCG: https://docs.ambientcg.com/license/
- Gestione colore Blender AgX: https://docs.blender.org/manual/en/5.0/render/color_management/displays_views.html

**Nota metodologica:** la presente specifica traduce le fonti in un piano originale per Atlas. Le singole scelte cromatiche, la rubrica e i tempi sono **nostre decisioni progettuali**, non norme attribuite a Blender Studio o ai professionisti citati.
