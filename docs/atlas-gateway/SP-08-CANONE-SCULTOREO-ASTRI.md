# SP-08 — Canone scultoreo degli astri della conoscenza
Stato: studio artistico candidato, non implementato nel ramo della PR #105, non approvato, non pubblicabile.

## Riferimento e ragione del riesame
SP-07.5, commit be1b70b46a768c772bf6db58a9548b55d1ec9e17, run 44103958943, artefatti 14338151844 e 14336509718. Il modulo GLB è tecnicamente verificato: 277776 byte, 7412 vertici, 3 primitive, 6 formati WebGL, ricette base 4/4, nessuna richiesta esterna. La schermata del telefono mostra tuttavia nuclei percepibili come simboli ornamentali e Storie/Percorsi molto chiari. Non confondere riconoscibilità e conformità tecnica con qualità scultorea. Il modulo rimane riferimento riproducibile e reversibile; non è un'approvazione artistica.

## Intenzione
Quattro sculture sospese, ispirate alla cura costruttiva degli strumenti scientifici e alle opere di un museo contemporaneo. Meraviglia, curiosità e fiducia: non lusso ostentato, non icone da interfaccia, non gioielli o trofei. Appartengono alla stessa famiglia e convergono simbolicamente in Esperienze. Nessun nuovo portale, relazione curricolare o navigazione obbligatoria.

## Identità
| Astro | Forma primaria | Struttura e dettagli | Materiali proposti | Da evitare |
| --- | --- | --- | --- | --- |
| Storie — Il libro vivente | Due ali di pagine curve, aperte | Doppia curvatura controllata delle lamine, coperta più sottile, cerniera/dorso leggibile, bordi finiti | Bronzo caldo, toni avorio dorato moderati, dorso patinato | Libro monolitico bianco, decorazioni minute |
| Laboratori — L'officina della conoscenza | Tre moduli in una struttura triangolare aperta | Nodi smussati, giunti a collare e connessioni fisicamente plausibili, spazio negativo centrale, rilievi funzionali | Smalto blu profondo e bordi metallici coerenti | Cubi disgiunti o icona piatta di rete |
| Scoperte — La bussola del sapere | Rosa radiale tridimensionale | Quattro lame rastremate con creste, sede circolare centrale e asse percepibile in vista obliqua | Bronzo satinato, rame patinato; accenti limitati | Stella generica, centro monolitico |
| Percorsi — Il nastro dell'ascesa | Un nastro continuo ascendente | Traiettoria curva a S o raccordata, transizioni tangenti e spessore coerente, terminale direzionale integrato | Smalto blu e riflessi metallici controllati | Gradini separati, freccia da interfaccia, giunti a blocchi |

## Linguaggio comune
- Volumi primari leggibili anche in monocromia; la distinzione non dipende dal colore.
- Raccordi e bordi progettati come parte della forma; superficie lavorata e luce variabile con l'angolo di osservazione; evitare dettagli minuscoli non visibili nel contesto.
- Due famiglie PBR condivise (calda e fredda) e materiale di orbite/connessioni; differenziazione per attributi colore esportabili. Nessuna texture remota o shader non portabile. Evitare emissione abbagliante; controllare la luce contestuale e non presumere equivalenza Blender/WebGL.
- Constellazione A, camere, ARENA, portali e percorsi luminosi restano congelati per il primo confronto. Il precedente vincolo di identità pixel-per-pixel della silhouette apparteneva alla fase dei soli rilievi; una nuova forma può cambiare la silhouette interna, purché conservi posizione, ingombro e tutti i controlli di leggibilità e separazione. Nessun allentamento automatico delle soglie. Se il budget non consente il risultato, documentare il conflitto prima di proporre un cambiamento.
- Gli astri sono subordinati ai portali per l'orientamento dello studente. La presenza scenografica va valutata nell'atrio, non ricavata dall'ingrandimento arbitrario di un'anteprima isolata.

## Produzione in studio isolato
1. Costruire quattro prototipi modificabili con curve e superfici reali, giunti e profili arrotondati; discretizzazione deterministica. Conservare il modulo precedente intatto.
2. Verificare la qualità delle forme prima delle finiture: vista frontale, obliqua, laterale e monocromatica; confrontare con SP-07.5. Rifiutare il modello che resta una mera icona estrusa.
3. Selezionare la candidata sulla base di evidenze visuali: tavola unica con quattro dettagli a scala comparabile, viste contestuali panoramica e verticale. Valutazione 4/4 per ogni identità e qualità scultorea; osservazioni motivate, nessun punteggio automatico.
4. Integrare la selezione nella filiera adattiva e verificare le soglie geometriche/fotometriche esistenti; controllare la continuità delle giunzioni e i bordi. Budget esistente: tre primitive, massimo 1 MiB e 18000 vertici esportati; zero servizi a pagamento, zero richieste esterne runtime. Il limite locale per nucleo rimane vigente finché non si verifica e documenta l'eventuale necessità di riallocare la complessità senza superare il budget GLB.
5. Esportare e verificare il GLB reale e il rendering WebGL ai sei formati; integrare nella candidata architettonica coerente, testare navigazione e alternative accessibili. Una vista isolata non qualifica la sala e Chromium software non qualifica le prestazioni su dispositivi fisici.
6. Accettazione indipendente e consolidamento solo dopo revisione contestuale e conservazione di sorgenti, render, hash e ricevute. Nessuna pubblicazione, merge o modifica Home in questo studio.

## Decisione
Sperimentare la nuova direzione come alternativa artistica SP-08, non continuare con micro-variazioni cromatiche della versione SP-07.5. Le descrizioni sono specifiche di progetto, non modelli realizzati né risultato approvato. La prossima produzione deve realizzare davvero le nuove forme e presentare i confronti prima di cambiare la candidata qualificata.
