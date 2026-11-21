# ATLAS ART-DIR-02 — MULTIWORK-R6-01

## Regia unica di una lavorazione a più mani

**Decisione:** 21 novembre 2026. **Stato:** struttura di coordinamento e mandati avviati, non produzione simultanea già eseguita. **Issue capo:** [#154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154). **PR esistente:** [#152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), in bozza. **Governance:** [TRAMA #354](https://github.com/antoniocorsano-boop/trama-ecosistema/issues/354).

**Vincolo artistico:** [ART-DIR-02-VISUAL-READING-02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md) ha 26 elementi, 16 relazioni e 12 campioni cromatici; il JPEG canonico è immutabile, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`. [Archivio R5 base e risorse originali](https://drive.google.com/file/d/1XK-acsH4E3jLrMIj5NghXSvfRcALwI4r/view).

## Tavolo di lavoro e incarichi

| Unità | Compito | Issue | Ramo indipendente | File a proprietà esclusiva |
|---|---|---|---|---|
| A | Volta poco metallica, lucernario, cielo luminosissimo e luce zenitale | [#155](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/155) | `work/atlas-artdir02-r6a-sky` | `scripts/atlas-gateway-production/r6a_sky_light.py` |
| B | Colonne scure, parapetti fumé, fascia balconate, fughe/riflessi pavimento | [#156](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/156) | `work/atlas-artdir02-r6b-materials` | `scripts/atlas-gateway-production/r6b_gallery_floor.py` |
| C | Fioriere alte e basse, due famiglie vegetali, librerie, stendardi | [#157](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/157) | `work/atlas-artdir02-r6c-furnishings` | `scripts/atlas-gateway-production/r6c_furnishings.py` |
| D | Pannelli blu e un **solo basamento metallico luminoso sottile** per portale; podio ATLAS | [#158](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/158) | `work/atlas-artdir02-r6d-portals` | `scripts/atlas-gateway-production/r6d_portals_podium.py` |
| E | Revisione artistica indipendente, verifica fonti/asset/web/smartphone | [#159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159) | `work/atlas-artdir02-r6e-assurance` | `docs/atlas-gateway/ATLAS-ART-DIR-02-R6-INDEPENDENT-REVIEW.md` |

## Contratto di collaborazione: come evitare conflitti

1. **Una sola fonte artistica:** nessuna unità sostituisce la lettura 02 o genera una nuova immagine come riferimento. La nuova soluzione sarà sempre confrontata al JPEG originale.
2. **Bloccare i file condivisi:** `scripts/atlas-gateway-foyer/blender_master.py`, gli script R2/R4/R5 di partenza e il registro canonico non vengono riscritti dalle unità. Risorse materiali e mesh source vengono aggiunte con nomi e ID propri. Se serve un aggiornamento comune, segnalarlo a #154 prima di modificare.
3. **Livelli separati sulla stessa scena:** le unità A-D lavorano su **una copia derivata del medesimo master R5**, fornendo script applicativi distinti, idempotenti quando praticabile e riferiti solo agli oggetti di competenza. Non creare foyer alternativi.
4. **Nomi riservati:** ogni nuovo oggetto/collezione/materiale usa il prefisso `ATLAS R6A •`, `ATLAS R6B •`, `ATLAS R6C •`, `ATLAS R6D •`. Nessuna unità rimuove gli oggetti creati da un'altra.
5. **Confronto controllato:** in ogni unità una HERO **con stessa camera, risoluzione, esposizione di baseline**, più un dettaglio dell'area di lavoro e una ricevuta. Dove una unità cambia intenzionalmente illuminazione, dichiarare l'intervento e ripetere anche un controllo con materiali precedenti per distinguere causa/effetto.
6. **Prova di composizione:** le modifiche vengono raccolte **una sola volta** in un Blender derivato integrato R6, con ordine `B → C → D → A` (la regia luci A per ultima). Questo ordine non conferisce precedenze artistiche; serve solo a riprodurre il montaggio. Qualunque conflitto viene restituito all'unità proprietaria.
7. **Revisione E indipendente:** valuta sia contributi individuali sia scena integrata rispetto alle 26 schede e 16 relazioni (non basta il completamento automatico). Deve controllare uso lecito delle risorse, assenza di dispositivi personali, leggibilità delle quattro scelte e divieto di pubblicare.
8. **Conservazione:** ogni unità produce commit, script, Blender derivato o diff degli asset, PNG reali, manifesto SHA-256, fonte/licenza e archivio Drive verificato. Senza file realmente prodotti lo stato resta `ASSEGNATO`, mai `COMPLETATO`.
9. **Rilascio:** le singole richieste di modifica restano in bozza e mirano al ramo di composizione, non direttamente a main. Nessuna fusione o distribuzione automatica. L'ideatore approva la vista finale.

## Criteri artistici di montaggio

- **A:** cielo azzurro-bianco vivo, anello luminoso raccolto, poche nervature sottili, intradosso blu-scuro continuo e fasci morbidi; nessun aspetto da cupola industriale.
- **B:** parapetti per lo più vetrati, cornici molto scure, balconate continue, colonne poco argentate, piano con giunti prospettici e riflessi oro/ciano non artificialmente uniformi.
- **C:** due categorie di vaso e di pianta; grandi fioriere in primo piano anche parzialmente ritagliate in modo naturale, alberelli ariosi, librerie con luce ambrata non protagoniste.
- **D:** quattro vetri blu profondi, oro caldo sui perimetri, ciano al piede, grafica dentro il vetro; singolo supporto luminoso basso in metallo, senza perfezionare l'incasso del vetro nella feritoia; podio blu notte e bordo oro.
- **E:** confronto complessivo ART-DIR-02 / R5 / R6 da un'unica HERO più dettagli; valutazione visiva senza confondere tecnica PASS con arte approvata.

## Stato e avvio concreto

L'attivazione degli incarichi si verifica **solo** con commit, agenti esplicitamente avviati in ambienti abilitati o contributori umani che lavorano nei rami; issue e branch da soli non eseguono il lavoro. Nessun accesso ai file personali degli studenti, nessuna dipendenza a pagamento, nessun deploy. Le parti sono progettate per essere assegnabili anche a collaboratori o agenti di codifica, senza richiedere di ricostruire il contesto di questa chat.

### Coordinamento prima di proseguire
Aggiornare la issue #154 con numeri PR specifiche, esiti dei controlli, collegamenti agli artefatti reali e decisione dell'ideatore. Non dichiarare che cinque agenti lavorano in parallelo finché non esiste un'esecuzione effettiva dimostrabile.
