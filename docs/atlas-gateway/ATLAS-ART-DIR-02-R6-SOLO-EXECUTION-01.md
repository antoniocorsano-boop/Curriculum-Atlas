# ATLAS ART-DIR-02 — R6-SOLO-01: squadra senza collaboratori umani

**Data:** 21 novembre 2026 — **Decisione organizzativa:** gli incarichi A-D ed E sono **ruoli software** e non presuppongono collaboratori umani. Coordinamento [#154](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/154), PR storica [#152](https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/152), lettura canonica [02](./ATLAS-ART-DIR-02-VISUAL-READING-02.md). La presente specifica integra [MULTIWORK-R6-01](./ATLAS-ART-DIR-02-MULTIWORK-R6-01.md) ma non sostituisce i 5 incarichi già creati.

## Opzione principale — senza ulteriori abbonamenti o API a consumo

- **Ideatore unico:** approva l'immagine di riferimento e giudica il confronto visivo; non scrive codice e non ricostruisce i dettagli.
- **ChatGPT come coordinamento e implementazione:** una sessione produce lo script per un ruolo alla volta (A, B, C, D); le attività restano indipendenti mediante quattro rami già creati. La pianificazione di quattro incarichi non equivale a quattro esecuzioni AI autonome simultanee.
- **GitHub Actions come officina parallela**: quando ciascuno script è concretamente disponibile e qualificato, può essere eseguito in job indipendenti, anche mediante una matrice, con Blender, senza lavorare sul computer dell'ideatore. Il repository Curriculum-Atlas è pubblico e i normali runner ospitati da GitHub sono gratuiti per i repository pubblici (documentazione GitHub corrente). Gli job possono ripartire da un master comune per produrre 4 varianti per componente.
- **Montaggio unico:** script B→C→D→A in una nuova copia del master R5, senza spostare le radici dei quattro vetri e senza modificare la camera HERO. Solo dopo il montaggio la revisione E giudica la scena completa (ART-DIR-02 vs R5 vs R6) e la prestazione web, se è disponibile un ambiente di collaudo.
- **Archivio:** modello Blender, render reali, manifesti asset/licenze e ricevute SHA-256 salvati in Drive. Modelli originali e letture artistiche conservati.
- **Divieti:** nessuna API a pagamento, nessuna nuova sottoscrizione, nessun merge o deploy automatico, nessun dato personale e nessuna affermazione di approvazione artistica senza confronto visivo.

## Opzione facoltativa — più agenti di programmazione Codex Cloud

È una possibile vera esecuzione AI parallela, non attivata automaticamente dalla creazione di GitHub issue/branch:
1. Se **Codex Cloud** compare nell'account ChatGPT, aprirlo da web o app e **collegare** GitHub/Curriculum-Atlas nell'ambiente cloud. Il collegamento richiede autorizzazione esplicita dell'utente.
2. Aprire una conversazione Codex separata per le issue [R6A #155](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/155), [R6B #156](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/156), [R6C #157](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/157) e [R6D #158](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/158). Contesto comune: [contratto di coordinamento](./ATLAS-ART-DIR-02-MULTIWORK-R6-01.md). Base sempre `178f51eb72084eec3a964de81989c8ed5aac1364`; scrivere solo i file di proprietà della corsia. Includere task-specific test.
3. Attendere l'esito effettivo di quattro script+Blender+render, non la sola presenza delle conversazioni. Non forzare budget e quote: il piano può prevedere limiti di utilizzo inclusi; **non autorizzare acquisti automatici o crediti aggiuntivi**.
4. La revisione E [#159](https://github.com/antoniocorsano-boop/Curriculum-Atlas/issues/159) parte dopo la composizione della R6. Nessun agente può auto-approvare l'arte.

**Quale opzione conviene qui:** l'opzione principale, già funzionante con GitHub/Blender, è indipendente dalla disponibilità di Codex e preserva il vincolo zero nuovi costi. Si può aggiungere Codex Cloud solo quando connesso/abilitato e utile per accelerare la produzione del codice.

## Stato alla creazione

- **Presenti:** 5 issue (#155–#159), 5 branch e documento MULTIWORK-R6-01.
- **Non presenti:** quattro implementazioni R6 complete, rendering dei quattro gruppi, scene R6 integrata e validazione E.
- **Prossimo passo produttivo:** realizzare prima R6A (cielo/volta) e R6B (materiali), poi R6C e R6D su rami isolati. Possono essere sviluppati in sessioni distinte; le renderizzazioni automatizzate possono avvenire in parallelo dopo che gli script esistono.
