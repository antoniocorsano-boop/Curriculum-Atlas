# Atlas — F5-B, candidato di integrazione nativa

15 novembre 2026. Baseline 2e70a02728a169a685390d1b3e9a60c485440bf6; tre controlli GitHub di F5-A superati. Stato IN_VERIFICA. Nessuna autorizzazione alla distribuzione.

## Architettura e perimetro

La vera applicazione Next mantiene la pagina iniziale, l'AppShell e tutte le sezioni esistenti. Una copia di compilazione separata genera un ingresso nella sezione Storie e una pagina nativa /revisione/energia/ con il tema, quattro accessi, scheda e guida. Il contratto tematico esistente è la fonte dei metadati. I sette collegamenti aprono il documento educativo qualificato alle destinazioni corrispondenti. Non è una riscrittura in React delle interazioni interne: l'opera HTML autonoma mantiene il lettore, le alternative accessibili, il laboratorio e la mappa già verificati; non viene incorporata in un iframe. Tre collegamenti di ritorno integrano il passaggio alla pagina nativa. La sorgente F4 resta invariata nella Libreria; la variante di assemblaggio è riproducibile.

Il generatore opera soltanto in una copia Git dedicata, con ATLAS_REVIEW_BUILD=true e ATLAS_PREVIEW_ROOT_SCOPED=true; controlla stato e metadati non autorizzati. La configurazione Next rifiuta un overlay o un flag di revisione senza condizioni coerenti e rifiuta GitHub Pages. Il repository è pubblico: la pagina nativa e il codice sono visibili come sorgente; il documento F4 completo non viene aggiunto al repository né caricato nell'artefatto CI. Nessuna garanzia di riservatezza attribuita a un artefatto del repository pubblico; il candidato completo deve essere assemblato in locale, non ospitato o distribuito. Nessun nuovo servizio.

## Prove effettive locali
Node: test di preparazione negata senza flag, negata con Pages, stato di autorizzazione incoerente negato, overlay duplicato negato, rilevazione di percorso e riferimenti JS non consentiti in un export di prova, verifica shell di prova e rifiuto di impronta errata. PASS. Con input F4 esatto SHA-256 50d8ec149f24a21f81856403e3926f661eb87faae1de6f97bd9953a234094e13, assemblaggio su shell di prova riuscito; derivato SHA-256 7fc67d266e108d5943d4ab129d9278554430cba2eea0ea93ac13913daf5eeae4. Rimuovendo i soli tre collegamenti inseriti si riottiene esattamente l'originale byte per byte. Il tentativo browser con server locale è stato bloccato dalla policy dell'ambiente (ERR_BLOCKED_BY_ADMINISTRATOR): nessuna navigazione HTTP locale attestata. La shell di prova non è la compilazione Next.

## Qualificazione automatica avviabile su GitHub
Nuovo workflow Atlas Energia Review Integration, permessi di sola lettura:
1. Compilazione ordinaria, tipi e lint, regressione filtro Percorsi, scansione dell'export per percorsi e riferimenti del candidato, anche nei chunk.
2. Compilazione separata di revisione, prova negativa del flag mancante, tipi e lint, verifica della pagina nativa, collegamenti effettivi a una fixture minimale senza contenuto educativo, test su 320/430/1920 px e reflow 200%. Rimozione della fixture prima dell'artefatto, che contiene soltanto la shell, senza l'opera. Nessun deploy.
3. Dopo l'esito positivo, recuperare l'artefatto esatto, assemblare con il file F4 personale e ripetere il test sulla versione completa, non sulla fixture. Il test verifica le destinazioni e il ritorno al tema nativo.

Comandi:
- node scripts/test-atlas-energy-review-boundary.mjs [file-F4-locale]
- node scripts/atlas-energy-review-build.mjs verify-public out
- node scripts/atlas-energy-review-build.mjs attach <shell-di-revisione-scaricata> <file-F4-locale>
- node scripts/test-atlas-energy-review-shell.mjs <copia-assemblata> --assembled

La prova browser richiede Playwright/Chromium e server loopback abilitato. Il manifest lega shell a commit e input all'impronta approvata; non è una ricevuta di autorizzazione. Non usare la copia assemblata per deployment.

## Stato
F5-B implementata, non qualificata: attendere le prove CI e l'assemblaggio locale con la vera shell compilata. F1–F4 restano candidati in verifica. F6 revisione umana e fisica dopo qualificazione. F0 autorità, diritti, autorizzazione aperti. F7 bloccata. studentAuthorized=false. Nessun merge, pubblicazione, dato personale o spesa.
