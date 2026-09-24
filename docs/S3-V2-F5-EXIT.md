# Atlas S3-V2/F5 — Exit e consolidamento

**Data:** 2026-09-24  
**Stato:** EXIT CANDIDATE  
**Riferimento:** TRAMA R3-F0/S3-V2

## Scopo

F5 non introduce nuove capacità. Chiude S3-V2 verificando che quanto integrato in F0–F4 formi un prodotto pubblico coerente, navigabile e compatibile con i confini di governance TRAMA.

## Baseline integrata

- F0 Foundation — integrata;
- F1 Curricolo verticale + Materiali — integrata;
- F2 Esplora relazionale — integrata;
- F3 Materiali + Risorse — integrata;
- F4 Mobile + LIM — integrata.

## Invarianti di uscita

Atlas deve restare:

- pubblico e senza account studente;
- privo di login/password e tracking individuale;
- distinto da Arena, che mantiene l'autorità curricolare;
- distinto da Docente OS, senza runtime Docente OS → Atlas autorizzato;
- navigabile su mobile senza perdita di sezioni;
- leggibile senza overflow orizzontale;
- accessibile anche tramite rappresentazione testuale per Esplora;
- trasparente sugli stati di pubblicazione, accessibilità, diritti e provenance.

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
12. validazione Materiali e self-test normalizzazione immagini.

## Gate umano finale

L'automazione non sostituisce la review umana. Prima di dichiarare S3-V2 CLOSED occorre verificare sull'exact head F5:

- comprensibilità del primo viewport;
- leggibilità reale su smartphone e LIM;
- coerenza tra Curricolo, Esplora, Materiali e Risorse;
- assenza di falso profilo o aspettativa di account;
- chiarezza della distinzione Risorsa Atlas / Materiale pubblicato;
- qualità della navigazione senza conoscenza tecnica dell'ecosistema.

## Non effetti

F5 non autorizza:

- Arena → Atlas live sync;
- Docente OS → Atlas runtime;
- DOS-A1;
- account o profili studenti;
- tracking;
- ATLAS-PERCHÉ in produzione.

La PR ATLAS-PERCHÉ resta separata, sperimentale e in HOLD.
