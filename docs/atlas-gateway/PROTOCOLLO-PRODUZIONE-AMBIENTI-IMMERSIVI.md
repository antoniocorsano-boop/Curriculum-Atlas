# Protocollo operativo — Produzione di ambienti educativi immersivi

Stato: METODO CANDIDATO / PILOTA ATLAS GATEWAY / NESSUN COMPONENTE AGGIUNTIVO AUTONOMO.
Decisione del 16 novembre 2026: la pagina Atlas Gateway rimane la priorità; il metodo nasce dalla sua realizzazione, senza aprire un progetto parallelo.

## Sequenza ripetibile e prodotti verificabili

| Fase | Ingresso | Azione | Evidenza di uscita |
| --- | --- | --- | --- |
| P0 | Finalità educativa, pubblico, vincoli | Definire compito, destinazioni, privacy, costo e accessibilità | Contratto di esperienza approvato |
| P1 | Riferimenti e bozzetto | Definire architettura, regia, luce, materiali, identità | Immagine approvata, impronta, provenienza, criteri |
| P2 | Sorgente funzionante | Congelare commit, inventario e schermate | Ramo archivio, confronto senza differenze, ricevuta |
| P3 | Motore e risorse | Verificare licenze, impronte, dipendenze locali; distinguere risorse da oggetti interattivi | Manifest di produzione |
| P4 | Contratto e riferimento | Tradurre il progetto in geometria, materiali, illuminazione, oggetti semantici e interazioni | Scena derivata versionata; registro delle modifiche |
| P5 | Scena | Comporre inquadrature dedicate, comandi e accessi alternativi | Prove nei sei formati; schermate prima/dopo |
| P6 | Candidata | Eseguire verifiche funzionali, sicurezza, accessibilità, recupero e prestazioni | Esiti automatici, misure fisiche e rilievi |
| P7 | Evidenze | Confronto percettivo con il riferimento approvato e revisione indipendente | Decisione motivata, scostamenti e correzioni |
| P8 | Candidata approvata | Integrare solo previa autorizzazione; distribuire con decisione separata | Commit, ricevuta, archivio e possibilità di ripristino |

## Registro da compilare per ogni incremento
Identificativo della scena e revisione; commit di partenza e arrivo; riferimento approvato con impronta; obiettivo percettivo; modifica concreta e alternativa scartata; motivazione; file e funzioni coinvolti; risorse con licenza e impronta; invarianti da preservare; risultati reali delle prove; schermate; rilievi; decisione di avanzamento o ripristino. Separare sempre ipotesi, implementazione, prove automatiche e approvazione umana. Non riscrivere i riferimenti storici.

## Contratto futuro del componente aggiuntivo (ipotesi, non implementato)
Ingressi tipizzati: brief educativo, riferimento approvato, inventario risorse, descrizione parametrica della scena, ancore semantiche, mappa delle destinazioni, profili dispositivo, criteri di accettazione.
Uscite attese: progetto modificabile, scena eseguibile, manifest delle risorse, registro decisioni, rapporto di qualificazione e archivio di recupero.
Separare adattatore del motore, generatore geometrico, materiali/illuminazione, regia, interazioni e qualificazione. Il motore corrente è Three.js r128; nessuna scelta di motore universale è ancora qualificata. Un adattatore non può decidere le autorizzazioni editoriali.
Ogni futura estrazione deve derivare da almeno un ambiente completato e da una seconda prova di riuso; non creare adesso infrastrutture, servizi, account o interfacce per il componente aggiuntivo. Prima completare il pilota.

## Pilota: situazione reale
- AG-03/B: d4448be0e7a47bd050677df0272e0cb8dca64f1b; archivio archive/atlas-gateway-ag03b-qualified; 10/10 procedure PASS.
- AG-04/B: f2b1436c5f24505a04b6f5acaa0b25482ce57e1d; archivio archive/atlas-gateway-ag04b-qualified; 4/4 procedure PASS.
- AG-04/B2: riferimento grafico approvato e conservato; vedere AG-04B2-RIFERIMENTO-APPROVATO.md. Il modello visivo non è ancora realizzato in 3D.
- Incremento prioritario: apertura superiore al cielo, apertura posteriore, scaffalature protette e materiali architettonici. Poi portali e medaglione ATLAS, regia e verifica.
- Invarianti: nessuna cupoletta, tre portali semantici, destinazioni autorizzate, protezione Studio, alternativa HTML, scena locale isolata, nessun dato personale, nessun costo aggiuntivo. Home e distribuzione non autorizzate.
- Il preparatore corrente verifica le impronte e applica sostituzioni univoche alla fonte immutabile. È una procedura concreta del pilota, non ancora un generatore generale. Conservare questa distinzione.
- Il collaudo Chromium con WebGL software non attesta fotorealismo o prestazioni su dispositivi reali.
