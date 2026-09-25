# Atlas S3-V2/F5 — Exit e consolidamento

**Data:** 2026-09-25  
**Stato:** CLOSED / HUMAN EXACT-HEAD REVIEW PASS  
**Riferimento:** TRAMA R3-F0/S3-V2  
**Exact head validato:** `bc11577eeeeeed9c43ad62ac43fb7561e1197246`  
**Merge:** Atlas #32 → `423444be9dd883f4c35c6c1c89e94f6b0e5405fa`

## Esito

F5 è chiusa. F0–F4, insieme alla sincronizzazione curricolare Arena già integrata, formano una superficie pubblica coerente, navigabile e compatibile con i confini di governance TRAMA.

## Baseline validata

- F0 Foundation — integrata;
- F1 Curricolo verticale + Materiali — integrata;
- F2 Esplora relazionale — integrata;
- F3 Materiali + Risorse — integrata;
- F4 Mobile + LIM — integrata e validata su 360×800, 430×932 e 1920×1080;
- Arena #329 — export curricolare completo integrato;
- Atlas #29 — sincronizzazione governata Arena → Atlas integrata;
- Atlas #32 — F5 Exit integrata con HUMAN EXACT-HEAD REVIEW PASS.

La sincronizzazione non attribuisce ad Atlas autorità curricolare. Lo stato pubblico continua a riflettere l'authority state proveniente da Arena.

## Evidenze di uscita

PASS su exact head F5 per:

1. typecheck;
2. lint;
3. build;
4. avvio produzione;
5. route pubbliche principali;
6. assenza di input password o affordance login/registrazione;
7. contesto “Vista pubblica”;
8. assenza di overflow a 360 px e desktop;
9. destinazioni mobile primarie;
10. accesso `Altro` alle sezioni secondarie;
11. alternativa testuale “Elenco” in Esplora;
12. validazione Materiali e self-test normalizzazione immagini;
13. baseline curricolare d'istituto derivata da Arena;
14. evidenza visiva mobile e LIM;
15. corretta esposizione dello stato curricolare provvisorio.

## Gate umano finale

HUMAN EXACT-HEAD REVIEW — PASS su:

- comprensibilità del primo viewport;
- leggibilità su smartphone e LIM;
- coerenza tra Curricolo, Esplora, Materiali e Risorse;
- corretta percezione dello stato curricolare Arena;
- assenza di falso profilo o aspettativa di account;
- chiarezza della distinzione Risorsa Atlas / Materiale pubblicato;
- qualità della navigazione pubblica.

## Chiarimento successivo — presenza di ATLAS-PERCHÉ su `main`

Dopo la chiusura F5, il prototipo ATLAS-PERCHÉ è stato integrato su `main` con commit `f07e2447045eb8990936a917561bc4a52e722779`. La sua presenza nel codice principale **non costituisce promozione a capability di produzione** e non modifica retroattivamente l'exact head o l'esito della review F5.

ATLAS-PERCHÉ deve essere interpretato esclusivamente come **prototipo governato presente nel repository**, con superfici tecniche sperimentali disponibili per verifica. Non è la capability canonica `Percorsi`, non è una baseline pedagogica generale e non autorizza uso con studenti.

La capability `Percorsi` segue il gate separato TRAMA `CAP-ATLAS-PERCORSI / G1`, con costituzione child-safe, contratto di review, dossier per singolo percorso, evidenze e autorizzazione runtime separata. I prototipi esistenti possono diventare casi di studio o input di migrazione solo dopo mappatura esplicita ai contratti G1; non diventano canonici per semplice presenza su `main`.

## Non effetti

La chiusura F5 e la successiva presenza del prototipo ATLAS-PERCHÉ su `main` non autorizzano:

- approvazione automatica del curricolo;
- Docente OS → Atlas runtime;
- DOS-A1;
- account o profili studenti;
- tracking;
- uso di ATLAS-PERCHÉ con studenti;
- promozione automatica di ATLAS-PERCHÉ a `Percorsi`;
- runtime child-facing della capability `Percorsi`.

ATLAS-PERCHÉ resta quindi **PROTOTYPE / NO PRODUCTION AUTHORIZATION**. La capability `Percorsi` resta **G1 / Runtime NOT_AUTHORIZED** fino al completamento dei propri gate.