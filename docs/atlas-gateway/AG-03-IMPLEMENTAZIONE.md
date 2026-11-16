# AG-03/A — Candidata funzionale del Gateway Atlas

Stato: IMPLEMENTATA / PROVE LOCALI PASS / QUALIFICAZIONE INCOMPLETA / NON PUBBLICARE.

## Componenti
- src/app/gateway/page.tsx: ingresso candidato, disabilitato per impostazione predefinita.
- src/app/esperienze/page.tsx: biblioteca candidata, usa il caricatore autorizzativo Percorsi esistente.
- src/features/atlas-gateway/: risolutore dei tre portali, navigazione Next, ricerca e filtri, alternativa accessibile, contenitore della scena.
- scripts/prepare-atlas-gateway-scene.mjs: prepara una copia derivata della scena, verifica le impronte dei sorgenti e delle dipendenze, rimuove CDN/font remoti, normalizza due etichette storiche, applica CSP e canale isolato.
- scripts/test-atlas-gateway-ag03.mjs: prove ripetibili con Node 22.

## Confini
Curricolo apre la rotta reale /curricolo; Esperienze apre /esperienze; Studio mostra una spiegazione, senza collegamento professionale non verificato. La biblioteca filtra i percorsi attivi e autorizzati, esclude lab e URL non canonici, lascia vuote le categorie non ancora classificate. I cataloghi materiali/risorse sono accessi distinti: non trasformare le loro voci in esperienze autorizzate. Nessun dato dimostrativo aggiunto. La Home non è modificata.

L'iframe ha sandbox allow-scripts senza allow-same-origin; origine opaca, verifica della finestra sorgente, canale casuale e lista chiusa dei messaggi. La scena invia al solo origin del contenitore. Non riceve dati di identità o di contenuto; quando si lascia la sala viene smontata. Alternativa HTML sempre disponibile. Il preparatore elimina le richieste a CDN, non crea un motore fittizio in produzione.

## Prova locale (non pubblicare)
Con le dipendenze del repository installate:
- `node --experimental-strip-types --test scripts/test-atlas-gateway-ag03.mjs`
- `ATLAS_GATEWAY_PREVIEW=true pnpm dev` consente la vista semplificata su /gateway e /esperienze.
- Per il motore: procurare il bundle locale Three.js r128 e il CSS completo generato per la scena, verificando licenze e impronte da fonti affidabili. Eseguire `node scripts/prepare-atlas-gateway-scene.mjs THREE SHA256_THREE CSS SHA256_CSS OUTPUT`. OUTPUT non deve esistere.
- In un ambiente locale impostare anche ATLAS_GATEWAY_SCENE_FILE e ATLAS_GATEWAY_SCENE_SHA256 con il percorso e l'impronta del risultato. Nessun flag di anteprima va configurato nei deploy pubblici.
- Senza bundle approvato o digest valido la scena non si avvia e resta la vista semplificata.

## Evidenze e limiti
5/5 test Node superati su copie con impronte Git coincidenti con il ramo: politica portali, rotte, autorizzazione del catalogo, protocollo messaggi, preparatore. L'ultima prova usa stub di dipendenze, non un renderer reale. Sorgenti della baseline immutati. Verificata la sintassi degli script della scena derivata con stub.
I primi controlli del repository hanno rilevato due etichette nella copia storica e la falsa classificazione di un calcolo di hash come scrittura. Risoluzione: eccezione terminologica puntuale nella sola fonte storica e inventario relativo; normalizzazione delle etichette nella copia candidata; uso della funzione hash priva di mutazione persistente. Nessuna regola disabilitata.

Restano: completare il pacchetto locale reale e le licenze; controllare build e test browser (flag disattivo/attivo, tastiera, smartphone, basePath, CSP, eventi origine/finestra), collaudare qualità visiva, gesti e prestazioni WebGL. Il catalogo editoriale unificato deve acquisire metadati autorizzativi per le tre categorie non Percorsi; Studio richiede origine e identità professionale qualificate. Nessuna pubblicazione o modifica della Home.
