# Atlas S3-V2/F5 — Exit e consolidamento

**Data:** 2026-09-25  
**Stato:** EXIT CANDIDATE / REFRESHED ON CURRENT MAIN  
**Riferimento:** TRAMA R3-F0/S3-V2

## Scopo

F5 non introduce nuove capacità. Verifica che F0–F4, insieme alla sincronizzazione curricolare Arena già integrata, formino una superficie pubblica coerente, navigabile e compatibile con i confini di governance TRAMA.

## Baseline corrente

- F0 Foundation — integrata;
- F1 Curricolo verticale + Materiali — integrata;
- F2 Esplora relazionale — integrata;
- F3 Materiali + Risorse — integrata;
- F4 Mobile + LIM — integrata;
- Arena #329 — export curricolare completo integrato;
- Atlas #29 — sincronizzazione governata Arena → Atlas integrata.

La presenza della sincronizzazione non attribuisce ad Atlas autorità curricolare. Lo stato pubblico deve continuare a riflettere l'authority state proveniente da Arena.

## Invarianti di uscita

Atlas deve restare:

- pubblico e senza account studente;
- privo di login/password e tracking individuale;
- distinto da Arena, che mantiene l'autorità curricolare;
- distinto da Docente OS, senza runtime Docente OS → Atlas autorizzato;
- navigabile su mobile senza perdita di sezioni;
- leggibile senza overflow orizzontale;
- accessibile anche tramite rappresentazione testuale per Esplora;
- trasparente sugli stati di autorità, pubblicazione, accessibilità, diritti e provenance.

## Gate automatico F5

Il gate finale verifica:

1. typecheck;
2. lint;
3. build;
4. avvio produzione;
5. risposta valida delle route pubbliche principali;
6. nessun input password o affordance login/registrazione;
7. presenza del contesto “Vista pubblica”;
8. nessun overflow a 360 px e desktop;
9. destinazioni mobile primarie complete;
10. accesso “Altro” a Percorsi, Obiettivi, Raccordi e Impostazioni;
11. attivabilità della modalità testuale “Elenco” in Esplora;
12. validazione Materiali e self-test normalizzazione immagini;
13. presenza della baseline curricolare istituto derivata da Arena.

## Gate umano finale

L'automazione non sostituisce la review umana. Prima di dichiarare S3-V2 CLOSED occorre verificare sull'exact head F5:

- comprensibilità del primo viewport;
- leggibilità reale su smartphone e LIM;
- coerenza tra Curricolo, Esplora, Materiali e Risorse;
- corretta percezione dello stato curricolare Arena, incluso l'eventuale stato provvisorio;
- assenza di falso profilo o aspettativa di account;
- chiarezza della distinzione Risorsa Atlas / Materiale pubblicato;
- qualità della navigazione senza conoscenza tecnica dell'ecosistema.

## Non effetti

F5 non autorizza:

- approvazione automatica del curricolo;
- Docente OS → Atlas runtime;
- DOS-A1;
- account o profili studenti;
- tracking;
- ATLAS-PERCHÉ in produzione.

La PR ATLAS-PERCHÉ resta separata, sperimentale e in HOLD.
