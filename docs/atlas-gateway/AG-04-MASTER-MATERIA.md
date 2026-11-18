# AG-04 — Materia e microstruttura del master nativo

Base: PR #113, c07f5db442a4012c85d9dda499fccbb89543dcf0.
La selezione spaziale ha superato 12/12 pose con zero pixel variati rispetto
al batch globale P1 e 601646 / 484142 / 476798 triangoli nelle tre viste.
Mantenerla attiva.

## Diagnosi sui file effettivi
Pacchetto architettura 14431658842. Il receipt material-study.json
(SHA-256 cdc62198dd97255566f20a1ff48419ecc0540598bf28c517ee7d1fb3f8c9cdc6)
dichiara proceduralMicrostructureExported=false. I sette profili sono:
Warm limestone, Polished warm stone, Atlas blue marble, Walnut, Recessed
walnut, Brushed brass, Reading upholstery linen. I GLB conservano già
le mappe fotografiche del legno e della pietra; non sostituirle.
La campata GLB esportata dopo l'aggiunta dei nodi procedurali contiene
Brushed brass con roughnessFactor di default 1 (assente o uguale a 1)
e metallicFactor .88; il master prescrive .34/.88.
Gli altri moduli con Brushed brass hanno già .34/.88.
Cupola satin gold conserva .32/.80 e non ha un profilo micro A5.4a:
nessuna alterazione inventata. Vetratura, cielo e geometrie intatti.

## Confronto
P1 spatial = riferimento invariato.
M1 = solo ripristino dello scalare .34 dell'ottone delle campate.
M2 = M1 + micro-rilievo in coordinate mondo, usando i parametri
scale/strength/distance e le gamme di roughness del receipt originale.
Il rumore GLSL è un'approssimazione, non il rumore identico di Cycles;
si filtra in base all'impronta del pixel, senza nuove immagini, passaggi
grafici, sostituzione di mappe o variazioni di mesh/istanze. Le normali
fotografiche già decodificate vengono conservate e arricchite.
Nessuna modifica dei GLB originali. La correzione è reversibile.

## Prova
Tre formati di schermo, le dodici pose spaziali già qualificate e due
inquadrature native di dettaglio (campata e cupola) sul formato atrio.
Confrontare i tre profili, compilare realmente tutti i sette profili
materiale, verificare effetti visibili, stabilità a camera immobile,
ripristino esatto del controllo, ALS e invarianti di chiamate/triangoli
per ogni posa. I riferimenti Cycles continuano a fornire una diagnostica
cromatica, non un'approvazione artistica automatica.
La prova è una candidatura, non una qualificazione su dispositivi fisici.
La parità del rumore Cycles, l'occlusione indiretta e la fotometria
definitiva restano da valutare. Nessun rilascio, merge o autorizzazione
studenti. L'integrazione della navigazione rimane successiva.
