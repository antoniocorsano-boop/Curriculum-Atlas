# ATLAS P2A — Master compositivo A · intervento architettonico mirato (23/11/2026)

## Decisione e perimetro
- **Unica base di produzione:** A Monumentale, derivata dallo stesso `.blend` P2 tecnicamente qualificato nella PR #188. B Equilibrata e C Scenografica sono conservate come alternative intatte.
- **Sorgente artistica:** ART-DIR-02, JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`. È un riferimento compositivo, non un rilievo metrico.
- **Ordine di lavoro:** completare architettura, posizione dei portali, materiali e luce sulla scena *vera* Blender; verificare un'immagine Cycles HERO; solo successivamente produrre il derivato interattivo ottimizzato.
- Nessuna approvazione artistica automatica, fusione di rami, attivazione pubblica, pubblicazione agli studenti o spesa.

## Difetti verificati e correzioni eseguite dallo script
| Difetto nel P2A originale | Intervento fisico sulla scena | Condizione oggettiva |
|---|---|---|
| Quattro vetri opachi e troppo ravvicinati | Riposizionamento su un arco reale di raggio 8,20 BU, orientamento verso la camera e lieve allungamento verticale | Centri proiettati ~0,205 / 0,365 / 0,635 / 0,795, in quest'ordine, senza tagli nell'inquadratura |
| Basamento centrale mascherato | Corridoio visivo centrale aperto, senza cancellare il podio né trasferirlo artificialmente in primo piano | Distanza proiettata fra secondo e terzo portale >=0,22 |
| Vetro senza trasparenza, bordi poco visibili | Materiale traslucido a nodi e profili metallici emissivi costituiti da geometria curve reale, solidale a ogni pannello | Quattro oggetti profilo, quattro pannelli ancora fisici e selezionabili |
| Fasce delle gallerie troppo chiare e pesanti | Materiale grafite satinata ai piani e bronzo discreto ai profili | Prima e seconda galleria restano oggetti distinti e visibili |
| Lucernario isolato, illuminazione povera | Accento luminoso al bordo del vero foro, area zenitale ampia e luci laterali/di riempimento del podio | Copertura unica originale conservata; sorgenti luminose 3D reali |
| Pannelli senza feritoie corrette nel pavimento | Quattro sottrazioni booleane al vero pavimento, con recessi fisici | Numero delle facce del pavimento cambia realmente; errore bloccante se non cambia |

## Catena di produzione
1. La procedura P2 già esistente genera e verifica A/B/C dal master P1F/ROOF-02 originale, controllando SHA e genealogia.
2. Lo script `scripts/atlas-gateway-production/p2a_art_direction_final_01.py` ricarica **solo A**, ne verifica SHA e ricostruisce i sei aspetti precedenti.
3. Blender Cycles rende la camera HERO a 1280×720, 40 campioni e riduzione del rumore. Lo script salva il nuovo file Blender modificabile e la ricevuta JSON con SHA di entrambe le uscite.
4. La procedura di verifica controlla integrità, quattro pannelli, gerarchia a tre livelli, feritoie effettive, conservazione della fonte, assenza di autorizzazioni automatiche.
5. I nuovi prodotti vengono archiviati come risorsa di qualificazione della stessa linea P2, senza alterare i tre modelli originali.

## Criteri di accettazione artistica (ulteriori alla verifica tecnica)
- I quattro pannelli devono apparire sottili e translucidi, distribuiti lateralmente e tutti distinguibili.
- Marchio e cupola del podio Atlas restano leggibili e prevalgono come punto focale.
- Il lucernario allungato non deve tagliare o schiacciare le gallerie; la luce zenitale deve restituire profondità.
- Piano terra e due gallerie sono riconoscibili senza fasce abbaglianti.
- Alloggiamenti dei pannelli coerenti col pavimento; assenza di artefatti geometrici.
- Le immagini di verifica devono provenire dai PNG Cycles effettivamente prodotti, non da una generazione illustrativa sostitutiva.
- Una decisione umana sul confronto visivo col riferimento è indispensabile per assegnare `ART_PASS`.

## Vincoli e successivo passaggio
La variante può diventare **master artistico selezionato** dopo esito tecnico positivo e giudizio artistico favorevole, ma non diventa automaticamente *prodotto Atlas utilizzabile*: mancano ancora file GLB completo, collegamenti navigabili, versione accessibile, profili smartphone e prova su dispositivo reale. Conservare la reversibilità e il costo zero.