# Proamina® Storefront · Italprotein

Restyling statico e-commerce del sito www.italprotein.com, con catalogo, carrello, richiesta commerciale via email e pagine in italiano/inglese.

## Installazione

1. Copiare **index.html**, **en-index.html**, **shop.html** e la cartella **assets/** nella radice del repository `Italprotein/italprotein`.
2. Mantenere intatti `CNAME`, `favicon.ico` e gli altri file già presenti nel repository.
3. Pubblicare tramite il meccanismo GitHub Pages già esistente. Verificare `/`, `/shop.html` e `/en-index.html` su desktop e mobile.

## Stato commerciale

Il carrello è **funzionante come preparazione della richiesta di acquisto**, non come checkout di pagamento. Quando il cliente clicca "Prepara la richiesta", viene aperta l'app email con i prodotti, quantità e recapiti. Non è un ordine confermato, non invia automaticamente il messaggio e non riceve pagamenti. Non vengono raccolti dati delle carte di credito. Gli articoli sono salvati temporaneamente nel browser (localStorage).

Per abilitare transazioni reali serviranno: prezzi e IVA per ciascun formato, disponibilità, quantità per confezione delle bustine da 5 g, costi/paesi di spedizione, politica resi, etichette finali conformi, privacy/cookie policy, condizioni di vendita e integrazione con un provider di pagamento certificato (ad esempio Stripe Checkout via backend). **Non incollare chiavi segrete di pagamento nel JavaScript del sito.**

## Materiali e immagini

- `assets/img/proamina-1kg.png`: immagine barattolo originale trovata nel Google Drive di Italprotein (`barattolo.png`). Non è una fotografia del nuovo packaging definitivo.
- `assets/img/coffee-proamina-drive.jpg`: immagine cappuccino/sachet già presente nel Drive Italprotein, come fallback editoriale.
- `assets/img/proamina-pouch-200g.svg` e `assets/img/proamina-sachet-5g.svg`: illustrazioni vettoriali e **mockup indicativi**, non rendering di un packaging approvato.
- Fotografia editoriale caricata da Unsplash (Clay Banks): https://unsplash.com/photos/a-cup-of-coffee-sitting-on-top-of-a-kitchen-counter-Sv_3PDNZyQ0 , licenza https://unsplash.com/license . Il sito la usa via URL e ha fallback su un'immagine presente nel progetto.

## Verifiche eseguite

- HTML: 3 prodotti e 4 FAQ su ciascuna versione.
- JavaScript: controllo sintassi con Node.js.
- Test del carrello in Chromium: aggiunta prodotto, conteggio carrello, apertura e chiusura, nessun errore JavaScript osservato.
- Controllo layout a 1440 px e 390 px: nessun overflow orizzontale osservato.

## Avvertenze

Le informazioni tecniche e i claim sui prodotti vanno rivisti con il responsabile regolatorio prima di usare il sito per vendite B2C. I prezzi non erano disponibili e pertanto non sono stati inventati. Immagini, quantità e condizioni devono essere approvate prima del go-live con checkout reale.
