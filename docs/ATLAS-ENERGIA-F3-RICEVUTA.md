# Atlas — Ricevuta F3, edizione 0.5

15 novembre 2026. Baseline F2 448ead025aa6fb40dd134269b4cc7c702a5ce1fa. Candidato di revisione, non pubblicazione.

Edizione autonoma index-v0.5.html, SHA-256 36b303fafa039ab9cec777dbc5100970b73d3092ae8dc3600f6bfd401635b54e, conservata su GitHub e nella Libreria. Biblioteca locale Atlas_biblioteca_F3.html SHA-256 531de726ef06aefb5807e2ff0afc1a102efc35724b4c94df43d9422f7dadba9b, conservata nella Libreria. Sorgente strutturata edition-v0.5.json; generatore e prova in scripts. Edizione 0.4, tavola master, quattro immagini e cinque materiali F2 preservati.

## REV-04 — Scienza ed evidenze
L'affievolimento è osservato ma non diagnosticato. Ipotesi distinte da dati simulati e dalla nuova dimostrazione docente. Modello semplificato di due lampade con 20 J utili, 100/50 J in ingresso, 80/30 J trasferiti come calore, quote utili 20%/40%; bilanci verificati. Stesso intervallo, spettro e distribuzione equivalenti; non misure reali né prova di uguale illuminazione per lampade reali. Confine della lampada e assenza di accumulo dichiarati. Nessuna istruzione per prove elettriche.

## REV-05 — Narrativa e pedagogia
Matteo sceglie di presentare limiti e risultati invece di nascondere l'incertezza. Elena organizza l'indagine, Samir collega bilancio e poesia. La nuova dimostrazione non dimostra una causa del difetto. Quattro capitoli, poesia originale conservata. Guida separata dalla narrazione: tre obiettivi, prerequisiti, 40–50 minuti indicativi, tre attività differenziate, evidenze, rubrica di tre criteri per quattro livelli (12 descrittori, non conversione automatica in voto). Raccordo documentale Arena invariato: b355be71, PROVISIONAL_COMPLETE, ricevuta assente.

## REV-07 — Identità
Scheda identita-visiva-v1.md: mondo autonomo, tre protagonisti, ambiente e continuità grafica desunti dalle quattro scene. Non modifica Museo Zero. Nessuna rigenerazione, diagrammi decorativi distinti dal modello scientifico.

## Prove
scripts/build-atlas-energy-edition.py <edizione-v04> <biblioteca-F2-locale> <edition-v0.5.json> <edizione-v05-locale> <biblioteca-F3-locale>
scripts/test-atlas-energy-edition.py <edizione-v04> <biblioteca-F2-locale> <edizione-v05-locale> <biblioteca-F3-locale> <edition-v0.5.json> <cartella-evidenze>
Prerequisiti Python, BeautifulSoup, Playwright e Chromium. Test con Chromium set_content, attivazione programmatica dei collegamenti dell'indice e navigazione reale biblioteca→storia→materiale, simulazione 320/360/430/1920, reflow normale/200%, immagini e cinque materiali invariati, 12 descrittori, bilanci esatti, 8/8 combinazioni superate, nessuna richiesta HTTP esterna o errore JS osservato. Il primo tentativo di test è scaduto; la ripetizione con scorrimento immediato e attivazione programmatica ha superato le verifiche. Non attesta nuova revisione completa via tastiera, fisica o assistiva. Risultati in qualification-v0.5.json. Output esclusivamente locale, nessuna rotta pubblica.

F3 IN_VERIFICA; revisione umana scientifica, narrativa, pedagogica, artistica ancora aperta. F1/F2 restano IN_VERIFICA. F0 diritti, autorità e autorizzazione bloccano rilascio; repository pubblico non è canale riservato. Nessuna integrazione in main, nuova spesa o distribuzione. studentAuthorized=false.
