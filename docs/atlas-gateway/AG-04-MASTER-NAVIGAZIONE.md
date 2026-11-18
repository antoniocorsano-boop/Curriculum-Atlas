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

## Rilievo residuo dopo la qualificazione della chiusura
Run 44338940854, commit f6315ab: preflight PASS, una sola liberazione ALS e renderer, zero aggiornamenti tardivi; resta timeout sul titolo di Esperienze con zero errori JS, otto risorse e ATLAS_NATIVE_CLOSED. La causalità ALS è esclusa come spiegazione sufficiente. Artefatto 14442822953 preservato in ASP-01.
Ipotesi verificabile: la liberazione del solo renderer non garantisce il rilascio di tutte le risorse grafiche prima della transizione. Alternativa: aumentare i timeout senza diagnosi (scartata). Intervento: rilascio deduplicato di geometrie, materiali e texture, render target HDR e contesto prima dell'invio al genitore del comando di navigazione. Nessuna modifica alle risorse artistiche o alla policy dei portali. Prova di controllo separata della pagina di destinazione sul grande schermo, diagnostica DOM e risposte di rete, timeout diagnostico limitato. Non dichiarare la causa accertata né la navigazione conclusa fino al collaudo. Riferimento decisionale ASP-01, TRAMA-DE-01.

## Handoff nativo del browser — dossier TRAMA-DE-01 (18 novembre 2026)

**Contesto ed evidenze:** run 44343159134 sul commit b207f766: avvio e chiusura isolata PASS; destinazione autonoma HTTP 200 e titolo corretto. Grande schermo: timeout, nessun errore JS, DOM non interrogabile entro il limite, nessun marcatore di chiusura nella transizione. Due risposte RSC/JS 200 non dimostrano l'avvenuto cambio pagina. Artefatto 14446020819 preservato, dossier ASP-H024. La causa univoca non è dimostrata.

**Alternative:** aumentare timeout (scartato); imporre liberazione sincrona del contesto prima del messaggio (non ha risolto il rilievo); separare l'arresto logico dalla liberazione GPU e usare una normale navigazione del documento (scelta).

**Decisione:** il gestore del portale arresta aggiornamenti e timer, invalida lo stato e invia subito un solo messaggio vincolato al canale. Non esegue render, dispose o forceContextLoss prima di inviare il messaggio. Il genitore verifica origine opaca, finestra, canale, stato pronto e ID della policy; solo per la candidata nativa usa location.assign sul percorso canonico con slash finale. I collegamenti diretti nativi sono link documento, non prefetch RSC. Studio resta informativo. La navigazione procedurale conserva il comportamento precedente. Per la normale rimozione del documento, il browser libera il contesto; il rilascio esplicito idempotente resta verificabile nel laboratorio, non sul percorso di navigazione. BFCache: al ritorno a un documento già lasciato il genitore ricarica la scena con un nuovo canale. ALS in movimento è limitato a un aggiornamento ogni 100 ms e sospeso durante il gesto; la variazione ottica continua a usare il tempo effettivo e il movimento resta facoltativo. La qualità percepita del movimento limitato va riesaminata su dispositivo reale.

**Motivazione:** eliminare il lavoro GPU sincrono e la dipendenza dal mantenimento del pesante iframe durante una transizione client. La scelta è strutturale e circoscritta; non costituisce prova della causa originaria.

**Criteri di accettazione:** preflight esatto: messaggio consegnato dopo arresto senza rilascio sincrono, nessun render/aggiornamento tardivo, rilascio esplicito una sola volta. Route reale: grande schermo con ALS attivo prima del clic, marcatore di invio e accettazione, risposta HTTP 200 di tipo documento, titolo corretto e iframe assente; ritorno alla biblioteca pronta e accesso diretto al Curricolo con titolo corretto. Poi altri cinque formati e due fallback, zero errori o rete esterna. Nessuna riduzione dei controlli di integrità. Nessun cambiamento di master, materiali o illuminazione, né pubblicazione. Stato: implementato, esito ancora da osservare; registrare ricevuta e limiti nel dossier ASP-01 senza riscrivere H024.
