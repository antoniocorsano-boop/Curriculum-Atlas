# ART-DIR-02 / P1F-PAVILION-01 — Nuova direzione architettonica (22 novembre 2026)

## Decisione progettuale
L'immagine canonica **ART-DIR-02** resta il riferimento di identità visiva (JPEG SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`) ma **non** un rilievo geometrico metrico. Il bordo superiore del lucernario è ritagliato; non è dimostrato che la sua apertura sia circolare. La prospettiva sintetica può essere incoerente con una costruzione euclidea univoca.

La direzione precedente P1D/P1E ha qualificato un oculo circolare e un raccordo anulare, senza approvazione artistica. **Non perseguire oltre la coincidenza anulare.** La PR #185 si conserva come esperimento storico, non come vincolo per il nuovo atrio.

**Scelta unica di prova:** una *volta longitudinale a padiglione con lucernario superellittico ad angoli morbidi*, ai lati quasi rettilineo, con larghezza controllata. Non introdurre nuove colonne, un'altra interfaccia dentro i portali o elementi metallici decorativi.

## Esecuzione sul modello effettivo
- Origine: P1D-OCULUS-03 **ARCH-B/J4**, .blend editabile qualificato e ricevuta con SHA, utilizzato anche nelle PR #183–#185. Non ripartire da una scena vuota.
- Il foro nativo è **trasformato parametricamente** da cerchio in superellisse `n=2.8` (non viene coperto da una geometria sovrapposta). Asse maggiore lungo la profondità della camera HERO, asse minore trasversale.
- Il coefficiente di deformazione orizzontale diminuisce gradualmente fino a zero sulla corona periferica. Mesh della volta/corona/oculo/schermo del cielo mantengono topologia e dati originali; si produce una copia autonoma .blend.
- La prima galleria e i quattro pannelli in vetro restano ancorati; la seconda galleria sale di circa **0,65 BU**, e la parte alta della volta guadagna progressivamente **ulteriori 1,10 BU**. Sono parametri iniziali, non proporzioni artistiche già approvate.
- Camera: HERO preservata nella sorgente; nella copia provvisoria lieve inclinazione verso la copertura e campo moderatamente più ampio, con verifica che i quattro portali restino inquadrati.
- Materiali esistenti per prima prova; aggiungere successivamente soltanto luce indiretta calda nelle gallerie, blu-grafite continuo nella volta, ringhiere fumé. Non applicare dettagli o illuminazione senza giudizio visivo.

## Perché è diversa dalle prove precedenti
La geometria ellittico-padilionale è una **scelta architettonica autonoma**, non una soluzione matematica al raccordo di un cerchio. Il criterio di successo è profondità, sviluppo verticale, sobrietà e leggibilità dei quattro ingressi nel frame, non sovrapposizione pixel a pixel con il JPEG originale.

## Requisiti web
1. Conservare un'unica scena senza duplicare gallerie, podio o portali; materiali riutilizzati e geometria ottimizzabile.
2. Esportare un elemento GLB diagnostico **solo della volta** e registrare byte, SHA-256 e numero di poligoni (non chiamarlo scena finale).
3. Obiettivo di produzione da validare su dispositivo reale: **massimo 5 MB** per l'elemento della volta e **massimo 15 MB** per il pacchetto tridimensionale iniziale; evitare texture 4K superflue, luci dinamiche costose e ombre in tempo reale diffuse.
4. Test successivi obbligatori: caricamento su Android reale, usabilità dei quattro accessi, reattività, movimento ridotto, leggibilità e performance su connessione mobile. Gli obiettivi non equivalgono a risultati misurati.
5. La resa WebGL potrà ricorrere a illuminazione precalcolata e materiali semplificati senza appesantire il file .blend artistico.

## Approvazione e reversibilità
- Sorgente Blender originalissima **immutata**, verificata per SHA-256.
- Nessuna integrazione su main, pubblicazione, dati degli studenti o costo.
- Questo è un **candidato estetico**; richiede render effettivo e giudizio umano sul riferimento.
- Si conserva traccia di fonte, commit, file .blend, PNG, GLB diagnostico e ricevuta. Gli artefatti temporanei delle Actions dovranno poi essere archiviati in Drive, senza dichiararli permanenti prima della copia verificata.
- Origine: chat Atlas World Composer del **22/11/2026**, osservazione dell'utente che il lucernario potrebbe essere ellittico/allungato e invito a privilegiare profondità, maggiore altezza, eleganza e leggerezza web; URL della chat non disponibile.
