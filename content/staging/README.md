# Acquisizione di attività formative in Curricolo Atlas

La cartella `content/staging/` è un deposito **di acquisizione e revisione**, non un contenuto pubblicato. I file non sono serviti dagli indirizzi pubblici di Atlas.

Il comando `node scripts/validate-activity-intake.mjs content/staging/missione-118/intake.json` verifica che tutti i file dichiarati siano presenti e inalterati, che le immagini incorporate coincidano con gli otto file estratti e che nessuna bozza attribuisca a sé stessa autorità di pubblicazione.

Il controllo dei file è **solo strutturale**: non prova diritti, accessibilità, conformità didattica o sicurezza del codice HTML eseguibile.

Le acquisizioni future devono passare da ChatGPT → Studio Atlas (creazione bozza governata) → riferimenti curricolari da Arena → revisione umana → candidato ActivityPackage v1 → pubblicazione approvata in Curricolo Atlas → riferimento `activityId + version` usato in UDA/lezioni da Docente OS.

Non esporre nel runtime Atlas l'HTML di provenienza ChatGPT senza revisione e isolamento. Nessun dato anagrafico di studenti, nessuna sincronizzazione automatica delle risposte.
