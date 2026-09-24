# Regola di propagazione del curricolo Arena → Atlas

**ID:** ATLAS-CURR-PROVISIONAL-PUBLICATION-01  
**Stato:** vincolante  
**Ambito:** Arena → Atlas, curricolo verticale di istituto

## Regola

Arena è l'autorità del curricolo di istituto. Ogni aggiornamento strutturalmente valido può essere propagato automaticamente ad Atlas anche prima dell'approvazione del Collegio dei docenti, purché Atlas conservi ed esponga in modo inequivocabile lo stato di autorità ricevuto.

### PROVISIONAL_COMPLETE

Quando `authorityState = PROVISIONAL_COMPLETE`:

- Atlas può mostrare pubblicamente la versione aggiornata del curricolo;
- la versione deve essere identificata come **«Curriculum provvisorio — non vigente»**;
- deve essere indicato che **l'approvazione del Collegio dei docenti è in attesa**;
- la versione non può essere presentata, etichettata o trattata come approvata o vigente;
- `authorityReceiptRef` deve essere assente;
- l'eventuale versione approvata precedente deve restare distinguibile dalla versione provvisoria;
- la provenienza Arena, la versione e l'impronta strutturale devono restare visibili o ispezionabili.

### APPROVED

Quando `authorityState = APPROVED`:

- Arena deve fornire un `authorityReceiptRef` valido;
- il payload deve avere un digest di integrità SHA-256 valido;
- Atlas può qualificare la versione come **approvata/vigente**;
- il passaggio da provvisorio ad approvato avviene attraverso la normale sincronizzazione Arena → Atlas, senza ricopia manuale del curricolo.

## Invarianti

1. La propagazione automatica non attribuisce autorità ad Atlas.
2. Atlas non può trasformare autonomamente uno stato provvisorio in approvato.
3. La visibilità pubblica di una versione provvisoria non equivale a vigenza.
4. La perdita o l'omissione dell'informazione di provvisorietà è un errore bloccante.
5. L'approvazione del Collegio dei docenti è l'evento che consente ad Arena di emettere lo stato `APPROVED` e la relativa prova di autorità.
6. Ogni aggiornamento successivo di Arena deve propagare anche il relativo stato di autorità, evitando divergenze tra contenuto e stato editoriale.
