# Atlas — Ricevuta F4: Universo Energia

15 novembre 2026. Baseline F3 a3eee43fe3b8f34e0e9bebc6ce9e8d6f13de3a33, 3/3 controlli superati. Candidato locale integrato, non pubblicazione.

## Prodotto
Atlas_Universo_Energia_F4.html, SHA-256 50d8ec149f24a21f81856403e3926f661eb87faae1de6f97bd9953a234094e13, conservato nella Libreria (libfile_cbb2438d276881919cfa020d4bd70e9c). Input F3 SHA-256 531de726ef06aefb5807e2ff0afc1a102efc35724b4c94df43d9422f7dadba9b. Contratto tematico in content/staging/biblioteca/energia/universo-energia-v1.json: metadati, riferimenti univoci alle opere, tre casi simulati, sei concetti con relazioni e collegamenti effettivi. Nessuna duplicazione delle immagini: tutte le 14 occorrenze preesistenti sono identiche, comprese le illustrazioni, le copertine e i materiali. Testi narrativi e materiali HTML conservati. Percorsi resta non disponibile.

Scopri: opera 0.5. Comprendi: infografica e spiegazione HTML. Sperimenta: confronto interattivo A/B/C, 20 J utili, ingressi 100/50/40 J, trasferimenti termici 80/30/20 J, quote utili 20/40/50%; C è un'estensione simulata dichiarata. Il modello non identifica il guasto; nessuna prova elettrica richiesta. Scheda operativa esistente collegata. Esplora: sei concetti selezionabili e relazioni con alternativa testuale completa; fonti e ambiente sono approfondimenti introduttivi, non competenze già dimostrate. Fruizione libera, senza punteggio, raccolta dati o obbligo di progressione.

## Riproduzione
python scripts/build-atlas-energy-universe.py <biblioteca-F3-locale> content/staging/biblioteca/energia/universo-energia-v1.json <output-F4-locale>
python scripts/test-atlas-energy-universe.py <biblioteca-F3-locale> <output-F4-locale> content/staging/biblioteca/energia/universo-energia-v1.json <directory-evidenze>

Prerequisiti: Python, BeautifulSoup, Playwright, Chromium. Il generatore verifica l'impronta dell'input e i bilanci. Non destinare output a directory pubbliche. Il file locale non è la compilazione dell'applicazione Next; rimane necessaria l'integrazione governata nell'applicazione completa e la qualificazione del suo effettivo artefatto.

## Collaudo
Quattro dimensioni 320x720, 360x800, 430x932, 1920x1080. Quattordici viste senza overflow orizzontale a testo normale e 200%; quattro accessi e scheda aperti mediante clic, tre casi verificati, sei nodi attivati con tastiera, relazioni e ritorno, cronologia browser. Tabella scorrevole localmente; in mobile 430 quattro azioni a due colonne, a 320/360 una colonna. Nessuna richiesta HTTP esterna, nessun errore JS osservato. Prove Chromium set_content; non collaudo su dispositivi fisici, non certificazione di accessibilità. Risultati in content/staging/biblioteca/energia/universe-f4-results.json. Schermate effettive conservate nel dossier locale. Il test controlla integrità delle immagini e uguaglianza del testo di narrativa/materiali, non costituisce revisione specialistica indipendente.

F4 e REV-06 IN_VERIFICA. Le dipendenze F1–F3 sono accettate tecnicamente per costruire il candidato locale; tutte le revisioni umane restano aperte per F6. F5 prossima fase: qualificazione integrata con verifiche negative di pubblicazione e revisione assistita; non attestare disponibilità dell'applicazione completa. F0 rimane aperto, Arena PROVISIONAL_COMPLETE, diritti e autorizzazione da verificare. Repository pubblico non è canale riservato. Nessun merge, distribuzione, spesa o nuova rotta pubblica. studentAuthorized=false.
