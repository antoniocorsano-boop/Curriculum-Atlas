# CURR-REF-01/F-R1 — Fedeltà semantica nella consultazione del curricolo

Data: 2026-11-19. Stato: IMPLEMENTATION_CANDIDATE / NO_PUBLICATION.
Dipendenza: Atlas F-R0, PR #143, revisione 0287fb3f0d1a65fa3241e53b2f615fb904785307. Raccordo: TRAMA PR #348 e ATL-KB-01 PR #336. Questa proposta è separata dalla qualificazione F-R0 e non può essere integrata prima di essa.

## Riscontro e motivazione
Bundle invariato: blob d1ab3fd860db9c043452e62359e404e4c9b94bfd, master 1.3, impronta b355be71, PROVISIONAL_COMPLETE. Nelle 106 fasce ordinarie sono disponibili competenze, obiettivi e conoscenze in 106/106, evidenze e raccordi in 91/106, progressione esplicita in 85/106, localizzatore e testo sorgente in 106/106. Mancano campi autonomi per abilità, nuclei, Profilo e obiettivi generali. L'assenza di campo non implica assenza dal master.

Prima della correzione, le competenze di fascia venivano mostrate come abilità del singolo obiettivo, e i raccordi e le conoscenze di fascia assegnati indiscriminatamente a tutti i suoi obiettivi. Inoltre, la disposizione visuale ripeteva gli stessi nodi obiettivo nelle fasce appartenenti al medesimo ordine. Questa seconda criticità è distinta dall'unicità del grafo dati già verificata in F-R0.

## Decisione
Introdurre esclusivamente un contesto di fascia nella vista Atlas, non una nuova entità autoritativa. Conservare esattamente categorie, testo, ordine, provenienza e distinzione tra contesto e obiettivo. Mostrare evidenze previste e raccordi della fascia, non dati raccolti sugli alunni. Nessuna associazione puntuale inventata. Le competenze non sono abilità. La successione delle fasce è dichiarata come ordine di consultazione, non progressione validata. Il grafo collega i raccordi alle fasce; la disposizione collega gli obiettivi alla fascia esatta. Il quadro trasversale resta distinguibile dall'obiettivo. Non creare un obiettivo sintetico se una fascia è priva di obiettivi. I collegamenti generici ai cataloghi non sono presentati come associazioni verificate.

Alternative respinte: riempire categorie mancanti dal testo con inferenze; duplicare contenuti di fascia nell'obiettivo; trasformare l'adiacenza in relazione pedagogica; anticipare una modifica del contratto Arena. Il contratto v1, bundle, autorità e identificativi F-R0 restano invariati. I tipi precedenti sono mantenuti per compatibilità; il proiettore non valorizza campi privi di una relazione puntuale documentata. Nessuna nuova pubblicazione o integrazione dei mondi.

## Verifiche
Gate esistente esteso: confronto campo per campo sul JSON effettivo, testo e ordine degli obiettivi, assenza di inferenze, legami di fascia del grafo, corrispondenza tra nodo e fascia, assenza di obiettivo sintetico nel caso avverso. Prova visiva/mobile e revisione indipendente restano necessarie; il controllo statico del layout non è una prova browser.

## Limiti e seguito
Profilo, OGPF, nuclei fondanti, natura precisa dei benchmark, legami semantici elemento-per-elemento e perimetro dei quadri integrati richiedono il raccordo E-R1 con la fonte Arena e l'eventuale evoluzione versionata del contratto. Non qualificare tutti gli obiettivi locali come OSA ministeriali. Le proiezioni dei quadri integrati conservano l'identità tecnica precedente in questa tranche: il loro perimetro non viene ridefinito. ATL-KB-01 deve riallineare i riferimenti candidati ai nuovi ID di fascia F-R0, mantenendo versione, impronta, ordinale, testo, stato e motivazione; non trasformare la correzione tecnica in verifica di pertinenza didattica. Nessuna modifica a quell'altra proposta in questa fase.
