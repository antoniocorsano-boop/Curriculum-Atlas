# ASC-01/P2C2-GLB — Collegamento della derivata precalcolata al motore r128

20 novembre 2026. Questa lavorazione è **complementare**, non sostitutiva, alle PR #135–#146. Il filone #134–#146 ha già prodotto e qualificato un trasferimento lineare, un adattamento AgX, prove di qualità materica e un'anteprima locale di tutta la campata 04-0, con workflow della PR #146 concluso positivamente. Evitare nuovi sistemi o ricostruzioni ridondanti.

## Problema specifico da risolvere
La PR #149 ha generato una **seconda** derivata isolata, più semplice: un GLB di 366208 byte ricavato dalla superficie reale Walnut della campata 04-0, con texture 512×512 contenente diffusione diretta, indiretta e colore, incorporata nella texture emissiva con `TEXCOORD_1`. Prova P2C1 workflow 44704855562, artifact 14614203407 SHA-256 ca2603da6ce05cecb546550651aa09babb96ad8a5c799702f0e9af242d2492e7. GLB SHA-256 442791262d07bb48bb51800d89a149046067047163d117a04d4fad3395e2a856. Materiale sorgente glTF non dichiarato KHR_materials_unlit. Non promuovere un materiale emissivo/pbr soltanto perché la texture è completa: rischio doppia illuminazione.

## Adattamento isolato verificabile
Caricare **esattamente** il GLB di P2C1 nel vero Three.js r128, con lo stesso GLTFLoader r128 e lo stesso decoder `TextureLoader` già adottato dal runtime locale; bloccare ogni accesso non incorporato. Validare `emissiveTexture.texCoord===1`, presenza dell'immagine incorporata e distinzione UV0/UV2. Clonare la geometria senza alterare il sorgente, collegare `geometry.uv = geometry.uv2` sulla derivata e rendere con `MeshBasicMaterial` e texture sRGB. Questo è il collegamento richiesto da r128: `MeshBasicMaterial.map` legge UV0, non la UV2 originale. Il materiale di prova è davvero non illuminato; `MeshBasicMaterial` non usa luci ambientali o direzionali.

## Gate concreto
- Ambiente temporaneo locale, CSP `connect-src 'none'`, scripts e foglio stile dal servizio locale effimero, immagine PNG solo `blob:`; nessuna risorsa pubblica o richiesta esterna.
- Esatta libreria Three r128 e Loader verificati per impronte upstream; nessun aggiornamento motore o modifica a `src/app/gateway`.
- Simulatore Chromium/SwiftShader: accendere e spegnere luci anche a intensità esagerate senza alterare **un solo pixel** del materiale precalcolato. Verificare che la UV2 della luce venga effettivamente usata.
- Interazione reale con puntatore, rotazione visibile, ritorno pixel-identico alla vista iniziale e seconda dimensione 320×240. Acquisire immagini reali e ricevute con impronte; nessuna pretesa di prestazioni su smartphone.
- I file generati, compreso il codice del pacchetto di prova, rimangono solo nei temporanei CI. Nessun cambiamento al GLB principale, nessuna pubblicazione studenti.
- Il test si limita alla **singola superficie già qualificata in P2C1** e al canale di trasporto unlit; NON qualifica il rendering fotografico, la gestione colore AgX, l'intera campata, l'applicazione o la fedeltà artistica di scena. Conservare la versione fisica #146 quale riferimento di contesto.
- Se il gate non passa, non fondere #149 nella sequenza #134–#146. Identificare e correggere la causa osservata prima di scegliere quale variante usare in produzione.

Il valore aggiunto rispetto a #146 è verificare la **portabilità del GLB precalcolato** e il trattamento locale con materiali stock r128, senza introdurre l'ennesimo shader o cambiare i contratti della biblioteca.
