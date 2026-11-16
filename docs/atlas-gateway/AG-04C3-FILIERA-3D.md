# AG-04/C3 — Filiera tridimensionale avanzata

Stato: PILOTA SPERIMENTALE, NON PUBBLICARE. Atlas Gateway resta la priorità.
Base qualificata: 08bda1dda7d4ae151cc4b3b5f86c28c83e5d8323 (10/10 PASS), archivio archive/atlas-gateway-ag04c-qualified. Riferimento grafico approvato: AG-04B2-RIFERIMENTO-APPROVATO.md.

## Decisione
Separare produzione offline da fruizione web. Usare Blender/Cycles per modellare e confrontare la luce; glTF 2.0/GLB per il trasferimento di geometria e materiali; Three.js r128 per la scena e le interazioni esistenti. Il sorgente della versione r128 contiene MeshStandardMaterial, PMREMGenerator, GLTFLoader e RGBELoader. Non aggiornare il motore senza una qualificazione distinta.
Riferimenti: https://github.com/blender/blender ; https://github.com/KhronosGroup/glTF-Blender-IO ; https://github.com/Poly-Haven/Public-API ; https://github.com/donmccurdy/glTF-Transform ; https://github.com/Naxela/The_Lightmapper . Gli ultimi due sono candidati, non dipendenze introdotte. Una resa Cycles non equivale alla resa WebGL. La luce precalcolata richiede un contratto esplicito UV2/lightMap oppure occlusione glTF; non presumere che la luce di Blender venga esportata automaticamente.

## Prova C3.1
Una campata in scala metrica, scaffale arretrato, quattro ripiani, libri geometrici, pietra, legno, finiture metalliche, aggetto opaco e luce indiretta. Script ripetibile con seme fissato, scena BLEND modificabile, PNG render Cycles e GLB senza compressione o estensioni obbligatorie. Primo campione con materiali PBR base; nessuna risorsa esterna introdotta in questa prova. Esecutore standard GitHub pubblico, timeout 15 minuti, nessun servizio a pagamento; versione effettiva del pacchetto Blender registrata. La riproducibilità esatta del binario richiederà successivo blocco di versione e impronta. Verifica automatica struttura GLB, dimensioni, asset locali e presenza della scena/render; nessuna pubblicazione.
Budget sperimentale: GLB <= 3 MiB, PNG <= 3 MiB; modello riusabile in più campate, non moltiplicare oggetti/materiali a ogni replica. La scena completa avrà budget separato dopo misura.

## Risorse candidate C3.2
Poly Haven: walnut_veneer (legno), marble_01 (pietra da valutare), kloppenheim_03 (cielo fotografico). Verificare singola scheda, formato, licenza CC0, URL, autore, dimensione e SHA-256 prima di importare. Usare mappe diffuse, normal GL, roughness a 1K per prima prova; HDRI 1K per luce e valutare cielo 2K. API solo in acquisizione offline, con User-Agent identificabile e attribuzione secondo i termini, mai durante fruizione studente. Conservare file e manifest locali; non attribuire licenze alle dipendenze per analogia. Niente download automatico non verificato nel runtime.

## Sequenza di accettazione
C3.1: prova campata e ispezione render/GLB, misure effettive.
C3.2: acquisizione materiali verificati, bake AO/luce e test di compatibilità nel motore r128 (caricamento da bytes locali nel sandbox).
C3.3: sostituzione modulare delle campate nella biblioteca, cielo e fregio; conservare i tre portali e alternativa HTML. Confronto nei sei formati con riferimento approvato.
C3.4: prestazioni su dispositivo fisico e riduzione del carico, revisione indipendente. Non integrare né pubblicare fino ad approvazione.
Registrare ogni fase nel protocollo P3–P7; nessun plugin autonomo prima del pilota e di una seconda prova di riuso.

## C3.1 — Correzione ambiente, ricevuta del primo tentativo
Il commit 070f331 ha ottenuto 10/11 procedure PASS: tutte le verifiche Atlas superate, produzione Blender interrotta. Run 43844841067, artefatto 14215026911 (solo log, nessun GLB/BLEND/PNG qualificato). Blender 4.0.2: esportatore glTF interrotto da ModuleNotFoundError: numpy; avvisi Weighted normals senza Auto Smooth. Draco non disponibile, non necessario per il pilota non compresso.
Correzione: installare esplicitamente python3-numpy dallo stesso archivio Ubuntu; registrare le versioni dei pacchetti; eseguire un'esportazione GLB preliminare nel Python effettivo di Blender, verificando intestazione e dimensioni. Abilitare Auto Smooth dove disponibile prima delle normali pesate; altrimenti mantenere la smussatura geometrica. Disattivare esplicitamente Draco. Registrare la versione NumPy nel manifest. Non proseguire con la produzione se il controllo preliminare fallisce. Nessun cambiamento al runtime Atlas. Il nuovo esito resta da verificare.
