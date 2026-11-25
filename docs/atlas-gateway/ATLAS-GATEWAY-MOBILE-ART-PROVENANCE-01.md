# ATLAS-GATEWAY-MOBILE-ART-PROVENANCE-01

**Data:** 20/11/2026  
**Generazione:** candidata originale per composizione verticale di una **porta web**, non approvazione della produzione artistica ART-DIR-02.  
**Identificativo generazione:** `40678642-4780-49ca-9f42-7c464143ac62` (metadato di generazione disponibile in questa conversazione).

## Prompt di generazione conservato

> A cinematic, photorealistic futuristic library rotunda unfolds in a vertical smartphone composition, designed as a text-free UI backdrop with no people: tiered balconies, book-lined curved walls, blue-and-gold lighting, reflective marble floors with concentric rings, lush greenery, and powerful sunbeams descending from a vast glass oculus beneath a bright cloud-filled sky. At center, four glowing glass display panels rest on a circular navy marble dais, showcasing an open book, compass and digital globe, connected route through mountains, and illuminated architectural portal, all surrounded by holographic light effects, polished reflections, and immersive depth.

L'indicazione «digital globe» fa riferimento **esclusivamente all'illustrazione del pannello Esplora**; il **marchio principale Atlas è l'emblema della lettera A**, realizzato come SVG HTML/CSS, senza globo decorativo.

## File verificabili

| Oggetto | Percorso, dimensioni e hash |
|---|---|
| PNG generato | [`public/atlas-gateway-entry/mobile-atrium-01.png`](../../public/atlas-gateway-entry/mobile-atrium-01.png), **948×1659 px**, **2.204.582 byte**, SHA-256 `a742aed54e69a9a857540d7b1f39e0486dd5d07597e3e4cf57723fb6f92f347f` |
| PNG conservato | [Google Drive Curriculum Atlas](https://drive.google.com/file/d/1_0DDwW3gBLx7JYI1JjsmcLoxkgqJTlk7/view) |
| WebP derivato | File opzionale ottenuto da PNG mediante Pillow `Image.save(format='WEBP', quality=83, method=6)`: **212.262 byte**, SHA-256 `c5c37d3e916804f5fe540bfaa3922fd0b424076f9492a617ec7eee4e569f00fb`; conservato nella Biblioteca personale, **non ancora sorgente pubblicata di Atlas** |

## Vincoli del modello produttivo

- Non reinterpretare la candidata come nuova immagine master ART-DIR-02: questa rimane la **fonte primaria della porta desktop**, da acquisire nel deposito produttivo.
- I quattro pannelli sono già inclusi nei pixel dell'immagine mobile: **non disegnare una seconda serie di quattro fotografie sopra**. Le aree interattive devono sovrapporsi in trasparenza, con etichette testuali nel DOM.
- La composizione verticale e il rapporto di profondità restano **stabili** al variare delle dimensioni dello smartphone; mettere la fotografia in `contain`, centrandola, e riempire lo spazio esterno con la stessa atmosfera sfumata, non ritagliando l'atrio.
- Le funzionalità e i collegamenti, la tastiera, il movimento ridotto e i fallback sono responsabilità della **pagina web**, non del PNG.
- Per ogni successivo rimpiazzo dell'immagine mobile, creare una nuova versione con prompt, immagini originali, dimensioni, SHA, posizioni dei quattro hotspot e confronto nel navigatore.

Documentazione della realizzazione: [ATLAS-GATEWAY-MOBILE-02](./ATLAS-GATEWAY-MOBILE-02.md). Nessun merge o deploy pubblico.
