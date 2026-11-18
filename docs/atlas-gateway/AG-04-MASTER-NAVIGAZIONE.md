# AG-04 — Master nativo nella biblioteca navigabile (candidata locale)

Raccordo effettivo nella route /gateway/, senza sostituire la candidata
procedurale qualificata. Baseline P1-spatial già qualificata in PR #113;
M1/M2 di PR #114 non attivati finché non qualificati separatamente.

## Pacchetto e confine di sicurezza
La scena HTML resta sotto il limite esistente di 4 MB: motore locale,
runtime e configurazione, non i GLB in base64. Gli otto asset (cinque
moduli architettonici, R2, cielo e HDR) hanno nomi vincolati al digest
SHA-256 e sono allestiti solo in staging locale ignorato da Git.
Il manifest è verificato dal server prima di essere passato al genitore.
Il genitore legge esclusivamente gli ID consentiti dalla lista, con
dimensione dichiarata, limite aggregato 40 MB, digest verificato,
senza credenziali o redirect. L'iframe mantiene sandbox allow-scripts,
CSP connect-src none e origine opaca. La risposta trasferisce ArrayBuffer
all'esatta finestra, dopo verifica della sorgente e del canale casuale.
Nessun URL arbitrario, nessun dato personale, nessuna rete nel renderer.
La build ordinaria e le esportazioni statiche rifiutano staging nativo
residuo. La qualificazione usa il runner locale e pulisce lo staging.

## Esperienza
Le cinque risorse originali, cupola, cielo, R2/ALS-01 e HDR P1 sono
ricomposte senza modifica del master. Le campate usano il modulo
bay-visibility già qualificato; la scena disegna su interazione o su
movimento ALS esplicitamente attivato. Le targhe sono quelle reali
del master: gli hit test usano le mesh originali e i limiti misurati
dei tre portali. Il genitore applica la policy esistente: Curricolo,
Esperienze, Studio informativo. Non esistono nuovi percorsi o
autorizzazioni. I comandi diretti, la vista semplificata e la preferenza
di movimento ridotto restano disponibili.

## Accettazione
Collaudo separato della route reale in sei formati, non solo laboratorio
WebGL. Verificare otto trasferimenti integri, cupola, cielo, R2/ALS,
budget geometrico, interazione, ripristino e navigazione, fallback per
asset corrotto e movimento ridotto. Non confondere questa candidata
con una qualificazione artistica definitiva o su dispositivi fisici.
Il timeout iniziale del master è 60 secondi, da riesaminare con le
misure di avvio reali; nessuna garanzia di fluidità su smartphone.
La CI usa ancora gli artefatti temporanei già conservati in archivio:
recupero automatico durevole aperto. Nessun deploy, merge, pubblicazione
o accesso studenti.

## Chiusura della scena e prevenzione (18 novembre 2026)
Run 44335391150: 6/6 scene inizializzate, 5/6 percorsi completi,
due fallback positivi. Nel formato grande la navigazione ha raggiunto
/esperienze/; l'immagine large-failure.png mostra la pagina e il titolo
attesi, nonostante il timeout del test. Errore registrato: ALS-01 disposed.
La relazione causale con il timeout non è dimostrata.
Il runtime ora annulla l'animazione prima dell'uscita, non renderizza
quando nascosto, invalida lo stato prima di distruggere le risorse,
rimuove gli eventi tramite AbortController, annulla richieste pendenti
e distingue pagehide persistito (pausa e ripristino) da chiusura finale.
Il preflight della PR #116 viene adottato nel ramo d'integrazione,
esteso alla verifica reale di pausa/ripristino/chiusura ripetuta,
zero render e zero aggiornamenti ALS dopo dispose. Il collaudo completo
parte dal formato grande con ALS in movimento; controlla errori anche
dopo la navigazione e arresta la matrice se questo caso fallisce.
P1-spatial resta il riferimento; nessuna modifica al master, nessuna
abilitazione M1/M2, nessuna autorizzazione alla pubblicazione.
