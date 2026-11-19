# ASC-01/P2C2B — Collegamento della luce alla superficie reale
19 novembre 2026. Candidata sperimentale. Base esatta #135, 608233103c03c9b5dd20620351fd033c5d4c0ec8; 5/5 workflow positivi, run 44542018259, artifact 14539027805. AWC-A #136: 8 workflow positivi, ricostruzione master non eseguita; ramo parallelo, nessun merge o modifica qui.

## RCA-02: conservare insieme geometria e immagine
P2C1 ha registrato statistiche UV e immagini, non tutte le coordinate per loop. Non è possibile attestare identità delle UV originarie da sole statistiche. Non applicare l'EXR storico a coordinate rigenerate assumendole identiche. Conservare invece in una sola esecuzione master verificato, oggetto, mesh derivata, triangoli, posizioni world-space per corner, UV per corner, matrici camera e proiezione, texture lineare e impronte; eseguire una nuova prova con lo stesso oggetto e metodo, mantenendo il master originale. La cattura è un'opzione del laboratorio P2C1, disattivata normalmente. Gli artefatti precedenti vengono recuperati con hash per continuità, non riutilizzati come se avessero un binding provato. La nuova immagine EXR e la texture float derivano dallo stesso bake appena catturato.

## Gate B1: superficie effettiva isolata
- Verificare gli input immutabili, il target effettivo, UV e rollback già previsti in P2C1; acquisire la proiezione esatta della camera selezionata.
- Ricostruire solo l'oggetto bersaglio in Three.js r128, senza trasformazione degli assi (vertici world-space e matrici camera Blender nello stesso sistema). UV e texture lineari nearest per isolare il binding. Confronto indipendente CPU/GPU dei valori interpolati in prospettiva e del colore float atteso; escludere solo bordi e prossimità di cambio texel secondo soglie predefinite, registrare copertura e numero di campioni. Richiedere almeno 100 campioni UV e 50 colore, zero scostamenti oltre tolleranza.
- Conservare manifest, immagini native A/B/A, immagine GPU isolata, ricevute, hash e log. Non modificare la route pubblica, il motore, il master, la CSP produttiva o l'autorità. Il laboratorio usa loopback e Chromium con GPU software, senza richieste esterne durante la prova.

## Limiti e successivi gate
B1 non ricostruisce il contesto con gli altri occludenti e non qualifica la fedeltà del colore AgX. B2: contesto effettivo, occlusioni e confronto a parità di camera con trasformazione cromatica esplicita, evitando di interpretare sRGB come AgX. P2C3: componente speculare, microstruttura, padding/bleeding e confronto ART-100. Poi compatibilità di distribuzione e prestazioni fisiche, estrazione dei profili AWC-B. Una prova fallita produce evidenza negativa e un ciclo correttivo circoscritto, senza promozione automatica. Non introdurre nuovi servizi, acquisti, pubblicazione o accesso studenti.

Stato: codice e procedura predisposti; risultato da osservare sul commit esatto. Le evidenze CI hanno scadenza e devono essere archiviate durevolmente secondo ASP/TRAMA-DE-01 prima della promozione.
