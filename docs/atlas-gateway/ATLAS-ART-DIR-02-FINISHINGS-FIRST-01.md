# ATLAS ART-DIR-02 — FINISHINGS-FIRST-01
## Rivestimenti, materiali e arredi preesistenti come nuova priorità produttiva

**Decisione dell'ideatore:** 21 novembre 2026. **Stato:** priorità approvata; singole risorse soltanto CANDIDATE fino a download, licenza specifica, test in Blender 5.0.1 e verifica nel derivato web.
**Continuità:** ART-DIR-02 → ASSET-KIT-01 → MASTER-BLENDER-01 → ART-PROOF-01B/R2/R3A → FINISHINGS-FIRST-01. Non è un nuovo progetto; stesso ramo della PR Atlas #152 e controllo TRAMA #354.
**Riferimento canonico:** JPEG 1536×864 in Drive, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
**Impostazione:** **congelare temporaneamente** grandi volumi R2/R3A e fermare le microcalibrazioni geometriche. Concentrare lo sviluppo su rivestimenti, risposte dei materiali alla luce, profondità degli spazi e arredi reali in catalogo. Una sola revisione geometrica macroscopica finale è consentita se l'inquadratura rimane compromessa (podio o oculo tagliati, spazi ingressi, occlusioni).

## Obiettivo verificabile
Una prima vista HERO più convincente grazie a superfici PBR, vegetazione e arredi professionali ricontestualizzati, senza cambiare la natura dei quattro portali vetrati, la cupoletta ATLAS o la scenografia. Evitare finto fotorealismo ottenuto tramite aumento di emissione o aggiunta di decorazioni prive di ruolo. Preservare un unico master Blender e un derivato web leggero in Three.js già adottato.

## Fonti controllate (21/11/2026)
1. **ambientCG**: [licenza CC0](https://docs.ambientcg.com/license/) estesa ai file scaricabili e alla loro redistribuzione; [Marble 013](https://ambientcg.com/view?id=Marble013), [Onyx 013](https://ambientcg.com/view?id=Onyx013), [Metal 010](https://ambientcg.com/view?id=Metal010). **Candidati** per pavimento pietra nero-blu, podio/lucernario e metalli satinati. L'originale 1K JPG di Onyx013 risulta circa 4 MB nell'archivio di scaricamento (il derivato web va ulteriormente selezionato e compresso).
2. **Poly Haven**: [licenza CC0](https://polyhaven.com/about-contact), [Potted Plant 04](https://polyhaven.com/a/potted_plant_04), modello piccolo (6K triangoli dichiarati; file sorgente completo 27,72 MB), per decorazione di dimensioni contenute; [Floor Tiles 02](https://polyhaven.com/a/floor_tiles_02), beige, **solo campione tecnico**, cromia predefinita non compatibile con scena Atlas se non rielaborata. [Potted Plant 01](https://polyhaven.com/a/potted_plant_01) ha 96K triangoli ed è **non raccomandato in prima istanza per il web**, salvo riduzione preventiva. **Nessun modello importato o testato in questa decisione.**
3. **Blender Asset Browser**: [manuale ufficiale 5.0](https://docs.blender.org/manual/en/5.0/editors/asset_browser.html). Registrare libreria locale, distribuire materiali/oggetti come asset; usare Link per modifiche centralizzate, Append (Reuse Data) per duplicazioni che condividono mesh/materiali, e Pack per evitare dipendenze esterne alla consegna di un `.blend`. In Blender 5.0.1 preferire importazione manuale di asset: il componente online Poly Haven apparso in ottobre 2026 dichiara compatibilità Blender 5.3+, quindi non dipenderne senza test.
4. **Altre librerie**: Blendkit solo come ricerca secondaria e previa verifica della licenza specifica; Sketchfab richiede controllo individuale CC e attribuzioni. Non introdurre servizi a pagamento, autenticazioni obbligatorie o dipendenze non riproducibili nella prima produzione.

## Trattamento dell'ambiente per priorità

| Priorità | Zona ATLAS | Fonte da provare e adattamento | Conservazione |
| --- | --- | --- | --- |
| P0 | Grande pavimento | Onyx 013 o Marble 013, normal e roughness, tint blu-grafite; texture ripetibile, riflessioni selettive, giunti sobri; evitare specchio | Mantiene la geometria/canale di posa dei vetri |
| P0 | Podio ATLAS e anelli | Materiale scuro lucido con imperfezioni controllate e ottone satinato; logo originale invariato | Mantiene forma e marchio |
| P0 | Quattro vetri emergenti | Materiale unico vetro blu con trasparenza misurata; cornice luminosa sottile e luce di feritoia fisicamente credibile | Nessun basamento autonomo, 4 grafiche originali |
| P1 | Pilastri, parapetti, gallerie | PBR più plausibili; un solo sistema di profili riutilizzabili; vetri opachi o trasparenti dove serve | Volumi base non riscritti |
| P1 | Due lati dell'atrio | Modelli realistici di piante/vasi selezionati per qualità/peso; Potted Plant 04 solo come prima prova di fedeltà del processo, non come grande pianta | Arredo secondario, non ostruisce i portali |
| P1 | Lucernario | Brunitura, metallo satinato, vetro e riflessi di cielo; i moduli già presenti devono sembrare materiali costruiti | Profilo e finestra esistenti |
| P2 | Stendardi/elementi espositivi | Tessuto e poche forme modulari semplici; recuperare marchio originale | Evitare decorazione ridondante |

## Sviluppo in un solo percorso
1. **Campione A / materiali**: applicare tre materiali candidati (pietra, ottone, vetro) alle mesh esistenti in una **copia non distruttiva** del file R2/R3A. Preservare rig e luci di prova. Produrre HERO prima/dopo con stessa camera; aggiungere una vista ravvicinata delle superfici.
2. **Campione B / arredi**: inserire una coppia di asset vegetali, eventualmente adattando vasi e piante separatamente. Ripetere con istanze; mantenere tutta la scena visivamente leggibile. Verificare licenze e provenienza **per file reale** con hash e dati di importazione.
3. **Campione C / illuminazione**: mantenere luce zenitale fredda e accenti caldi coerenti; correggere intensità, dimensione delle sorgenti e superfici prima di aggiungere lampade o effetti volumetrici.
4. **Decisione visiva umana**: confronto canonico vs HERO migliorata; approvare/rifiutare superfici e arredi per differenza visibile senza imporre millimetri non ricavabili dall'originale. Non dichiarare il lavoro completo senza le immagini vere.
5. **Campione Web**: esportare solo una campata e un portale con un arredo, controllare glTF/GLB e rendering nel Three.js r128 già presente. Ridurre texture a 1K/2K dove possibile, eliminare displacement e materiali duplicati; provare codifiche solo con decodifica effettivamente compatibile e senza aumentare il peso del caricamento.
6. **Integrazione solo dopo approvazione**: estendere gli stessi materiali e arredi all'atrio; prova smartphone fisico con qualità visiva, accessi funzionanti e tempi di caricamento misurati. Senza esito artistico, nessun merge e nessuna pubblicazione.

## Registrazione e autorizzazioni
Per ogni file scaricato: ID, link preciso, autore, licenza, data, SHA-256, risoluzioni, triangoli, texture, interventi, adattamenti, stato di approvazione, disponibilità in Drive, commit e tavola di confronto. Il semplice link a un catalogo non equivale a un asset scaricato o integrato. Conservare ZIP R2 e R3A e ogni master anteriore. Nessun nuovo costo obbligatorio, nessuna diffusione agli studenti, nessun dato personale.
