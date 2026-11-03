# Animazioni gratuite del sito Italprotein

Il sito usa HTML/CSS/JS statici su GitHub Pages, senza build system o pacchetti npm.
Le librerie vengono caricate tramite CDN, con versioni bloccate per stabilità:

- **GSAP 3.15.0 + ScrollTrigger**: ingresso delicato dell'hero, titoli durante lo scroll e parallax leggero sulla foto editoriale.
- **Motion 14.9.0 (vanilla JS, licenza MIT)**: feedback sui formati selezionati e hover sulle immagini dei prodotti.
- **Lenis 1.3.27 (licenza MIT)**: smooth scrolling solo su desktop con mouse; touch resta nativo.

File del progetto: `assets/animations.js`, `assets/motion-effects.js`, `assets/animations.css`.
Le pagine caricano gli script dopo `assets/site.js` per mantenere funzionanti carrello, menu e preordini.

## Accessibilità e degrado progressivo

- `prefers-reduced-motion: reduce` disattiva gli effetti JS e lo smooth scroll.
- Se una CDN non è disponibile, contenuto, navigazione e carrello restano utilizzabili.
- Nessuna modifica a prezzi, ordini, documentazione prodotto o configurazione di deploy.
- Testare su desktop/mobile, con e senza riduzione movimento, prima di unire il PR.

## URL delle librerie

- https://gsap.com/docs/v3/Installation/
- https://motion.dev/docs/quick-start
- https://github.com/darkroomengineering/lenis
