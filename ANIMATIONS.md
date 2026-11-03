# Animazioni e video Proamina (gratuiti)

- **Nessun rallentamento dello scroll**: rimosso Lenis e il caricamento di GSAP e Motion. Navigazione e carrello rimangono in JavaScript nativo.
- **Immagini animate**: hero (zoom lento solo desktop), packshot dei prodotti (floating), hover evidente e immagini nelle pagine prodotto. Sono animazioni CSS senza nuove dipendenze.
- **Video promozionale**: nelle due home, dopo la hero, con versione italiana/inglese, autoplay silenzioso e loop. Un visual animato con le stesse immagini prodotto è visibile anche se il video non è disponibile.
- **Prestazioni/accessibilità**: caricamento del video solo quando entra nella viewport, pausa fuori schermo, media query `prefers-reduced-motion` e fallback statico.

## Generazione MP4

Il renderer libero `scripts/render_promo_video.py` usa Pillow e FFmpeg e le immagini nel repository, **senza crediti AI**. La workflow GitHub Actions `.github/workflows/render-promo.yml` produce e committa:

- `assets/video/proamina-promo-it.mp4`
- `assets/video/proamina-promo-en.mp4`

Il filmato illustra i tre formati con packshot indicativi e senza nuove promesse nutrizionali/regolatorie. Verificare i run GitHub Actions e la pubblicazione dei file prima di considerarli online.
