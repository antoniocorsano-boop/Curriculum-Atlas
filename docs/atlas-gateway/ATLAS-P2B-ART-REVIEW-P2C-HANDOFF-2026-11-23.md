# ATLAS — Riesame artistico P2B/R2 e consegna alla scena WebGL P2C
**Data:** 23 novembre 2026 · **Perimetro:** sviluppo privato, nessuna pubblicazione.

## Decisioni separate
- **Architettura approvata dall'ideatore:** P2A/R4 A Monumentale. Gli elementi geometrici restano fermi. File Blender R4 SHA-256 `3e425897ccf6092110d27955b3c25dfe28c6a52046aa0576acaf33b67959e56f`.
- **Finitura tecnicamente qualificata:** P2B/R2, Blender SHA-256 `3527837e0be056002c1dddea9082336001e787da9a6d225eff7704c554a84cec`, rendering SHA-256 `3d071aea78e26cc5ee37c926555bf62650fe45e95badd40e5d93d4b78161fbac`.
- **Esito del confronto artistico:** **PASSAGGIO A PROTOTIPO CON RISERVE**, **NON ART_FINAL_PASS**. L'aspetto scenografico del rendering P2B/R2 è più semplice rispetto all'illustrazione ART-DIR-02; il confronto non può certificare la corrispondenza del materiale, dell'illuminazione o dei dettagli.
- **Prototipazione WebGL:** consentita come verifica tecnica derivata dalla scena R2; non autorizza pubblicazione, integrazione in `main`, né dichiarazioni di equivalenza fotografica.

## Valutazione qualitativa e azioni residue
| Dimensione | Evidenza P2B/R2 | Giudizio | Controllo successivo |
|---|---|---|---|
| Tre livelli e profondità | La parte superiore è visibile ma le gallerie appaiono più lineari e basse che nel riferimento | Adeguato come base, non definitivo | Confermare camera 3D ed effettiva profondità sul browser |
| Quattro accessi | Tutti distinguibili e leggibili; vetro traslucido con profili caldi | Adeguato per verificare accessibilità e selezione | Quattro maglie con identificatore e quattro percorsi realmente esistenti |
| Podio Atlas | Centrale e leggibile ma arretrato rispetto alla grande prominenza del riferimento | Da migliorare in resa, senza modificarne la geometria approvata | Luce e contrasto come approfondimento artistico |
| Luce zenitale | Lucernario allungato presente, cielo leggibile; mancano fasci di luce scenografici | Riserva artistica | Test di resa fotografica WebGL, senza aggiungere necessariamente effetti costosi |
| Gallerie, riflessi e dettagli | Materiale blu grafite ripristinato, ma dettagli e ricchezza laterale inferiori all'immagine canonica | Riserva artistica | Priorità a pochi dettagli ad alto impatto, non a un nuovo ambiente |
| Smartphone e LIM | Immagine 1280×720 qualificata da Cycles, non prestazione su dispositivo | Non qualificato | Test reali FPS/memoria, inquadratura e accessi touch/tastiera |
| Didattica e navigazione | Nell'app esistono `/curricolo/`, `/esplora/`, `/percorsi/`, `/esperienze/`; nessuna prova precedente garantisce i quattro clic dal nuovo GLB | Non qualificato | Associare a quattro pannelli vere destinazioni; evitare contenuti non autorizzati |

## Origini e integrità
- [ART-DIR-02 canonico](https://drive.google.com/file/d/1vSC_ynSxAF-pxR071TiKjEE0OtaFjXCn/view) — JPEG 1536×864, SHA-256 `a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe`.
- [Modello P2A/R4 approvato e ricevuta](https://drive.google.com/file/d/1Jd5AgD15LrYEypK5-SIdFRUoJFEAlerE/view).
- [Sorgente P2B/R2 e ricevuta](https://drive.google.com/file/d/1YGaiNuQFOKIlXVwOrL7JVu57MHu6mjVT/view).
- [Confronto visuale ART-DIR-02 / P2A / P2B R1 / P2B R2](https://drive.google.com/file/d/1D_zf-dB6Vd7C5mXeEsqjzL8VZ5Gn8EYa/view).
- [PR #188 — aggiornamento finitura](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/188#issuecomment-7095132599).

## Perimetro P2C
Esportare il vero master Blender P2B/R2 in GLB 2.0 senza immagini 2D sostitutive e senza deformare il sorgente. Conservare: fotocamera autentica, quattro pannelli in geometria, identità e percorso di ciascun accesso. Il file GLB è una risorsa qualificabile, non un prodotto installato. Verificare dimensione, maglie, triangoli, materiali e apertura del GLB. Il modello di materiali PBR semplifica necessariamente alcune caratteristiche di Cycles: **la qualità fotografica nel browser va valutata autonomamente**.

**Divieti:** nessun merge, nessun deploy, nessuna autorizzazione all'uso con studenti, nessun trattamento di dati personali scolastici, nessuna spesa. Qualsiasi pubblicazione richiederà il consenso esplicito e l'approvazione istituzionale pertinente.
