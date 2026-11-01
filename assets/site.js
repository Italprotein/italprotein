(function(){
'use strict';
var lang=document.body.dataset.lang==='en'?'en':'it';
var words={
 it:{empty:'Non hai ancora selezionato formati.',emptyHint:'Scegli uno o più formati per preparare il tuo preordine.',qty:'Quantità',remove:'Rimuovi',name:'Nome e cognome',email:'Indirizzo email',note:'Note (facoltative)',send:'Prepara il preordine via email ↗',explain:'Si aprirà il tuo programma email con tutti i dettagli del preordine. Nessun pagamento viene addebitato automaticamente: Italprotein confermerà disponibilità, spedizione e modalità di pagamento via email.',required:'Inserisci nome ed email validi prima di procedere.',added:'Aggiunto al preordine',subject:'Preordine Proamina® — richiesta conferma',intro:'Buongiorno Italprotein,\nvorrei inviare un preordine per i seguenti prodotti:',closing:'Confermo di aver letto i prezzi indicati sul sito e il tempo stimato di arrivo di circa 1 mese. Vi chiedo di confermare disponibilità, spedizione e modalità di pagamento.\n\nGrazie.',fieldName:'Nome',fieldEmail:'Email',fieldNotes:'Note',fallback:'Se il client email non si apre, scrivi a ad@italprotein.com e incolla il riepilogo del preordine.',shipping:'Spedizione',subtotal:'Totale riga',estimatedTotal:'Subtotale prodotti',priceNote:'Prezzo',shippingFootnote:'Le eventuali spese di spedizione non incluse saranno confermate da Italprotein. Paga solo dopo la conferma del preordine.'},
 en:{empty:'No formats selected yet.',emptyHint:'Select one or more formats to prepare your preorder.',qty:'Quantity',remove:'Remove',name:'Full name',email:'Email address',note:'Notes (optional)',send:'Prepare preorder email ↗',explain:'Your email app will open with all preorder details. No payment is charged automatically: Italprotein will confirm availability, shipping and payment terms by email.',required:'Enter a valid name and email address to continue.',added:'Added to preorder',subject:'Proamina® preorder — confirmation request',intro:'Hello Italprotein,\nI would like to place a preorder for the following products:',closing:'I confirm that I have read the prices shown on the site and the estimated arrival time of about 1 month. Please confirm availability, shipping and payment terms.\n\nThank you.',fieldName:'Name',fieldEmail:'Email',fieldNotes:'Notes',fallback:'If your email app does not open, write to ad@italprotein.com and paste this preorder summary.',shipping:'Shipping',subtotal:'Line total',estimatedTotal:'Products subtotal',priceNote:'Price',shippingFootnote:'Any shipping costs not included will be confirmed by Italprotein. Pay only after your preorder is confirmed.'}
}[lang];
var products={
 '0':{it:'Proamina® — Barattolo 1 kg',en:'Proamina® — 1 kg jar',price:50,shippingIt:'Inclusa',shippingEn:'Included'},
 '1':{it:'Proamina® — Busta richiudibile 200 g',en:'Proamina® — 200 g resealable pouch',price:10,shippingIt:'Esclusa',shippingEn:'Excluded'},
 '2':{it:'Proamina® — Confezione 100 bustine da 5 g',en:'Proamina® — Box of 100 sachets of 5 g',price:25,shippingIt:'Da confermare',shippingEn:'To be confirmed'}
};
var storageKey='proamina-preorder-v3';
var cart={};
try{var saved=JSON.parse(localStorage.getItem(storageKey)||'{}');Object.keys(products).forEach(function(id){var q=Number(saved[id]);if(Number.isInteger(q)&&q>0&&q<=99)cart[id]=q;});}catch(e){}
var $=function(id){return document.getElementById(id)};
var drawer=$('cartDrawer'),overlay=$('cartOverlay'),lastFocus=null,notifyTimer=null;
function euro(v){return '€'+v.toFixed(2).replace('.00','')}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(cart));}catch(e){}}
function count(){return Object.keys(cart).reduce(function(sum,id){return sum+cart[id]},0)}
function total(){return Object.keys(cart).reduce(function(sum,id){return sum+(cart[id]*products[id].price)},0)}
function showToast(msg){var el=$('notify');el.textContent=msg;el.classList.add('show');clearTimeout(notifyTimer);notifyTimer=setTimeout(function(){el.classList.remove('show')},1900)}
function btn(text,cls,handler,aria){var b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;if(aria)b.setAttribute('aria-label',aria);b.addEventListener('click',handler);return b}
function render(){
 var n=count();$('cartCount').textContent=n;$('drawerCount').textContent=n;
 var items=$('cartItems');items.replaceChildren();var ids=Object.keys(cart).filter(function(k){return cart[k]>0});
 if(!ids.length){var empty=document.createElement('div');empty.className='empty-cart';var h=document.createElement('strong');h.textContent=words.empty;var p=document.createElement('p');p.textContent=words.emptyHint;empty.append(h,p);items.append(empty);$('cartFoot').hidden=true;return;}
 $('cartFoot').hidden=false;
 ids.forEach(function(id){var product=products[id];var qtyValue=cart[id];var lineTotal=qtyValue*product.price;var item=document.createElement('div');item.className='cart-line';var info=document.createElement('div');var title=document.createElement('strong');title.textContent=product[lang];var meta=document.createElement('small');meta.textContent=words.priceNote+': '+euro(product.price)+' · '+words.shipping+': '+(lang==='it'?product.shippingIt:product.shippingEn);var qty=document.createElement('div');qty.className='qty-row';qty.append(btn('−','',function(){change(id,-1)},'Decrease quantity'));var q=document.createElement('span');q.textContent=qtyValue;qty.append(q,btn('+','',function(){change(id,1)},'Increase quantity'));var sub=document.createElement('div');sub.className='line-total';sub.textContent=words.subtotal+': '+euro(lineTotal);info.append(title,meta,qty,sub);var del=btn(words.remove,'delete-line',function(){delete cart[id];persist();render();});item.append(info,del);items.append(item);});
 var totalBox=document.createElement('div'); totalBox.className='cart-total'; totalBox.innerHTML='<strong>'+words.estimatedTotal+':</strong><span>'+euro(total())+'</span>'; items.append(totalBox); var shippingHelp=document.createElement('p');shippingHelp.className='cart-shipping-note';shippingHelp.textContent=words.shippingFootnote;shippingHelp.style.cssText='font-size:12px;line-height:1.6;color:#66665e;margin:8px 0 0';items.append(shippingHelp);
}
function change(id,delta){var next=Math.max(0,Math.min(99,(cart[id]||0)+delta));if(next)cart[id]=next;else delete cart[id];persist();render();var counter=$('cartCount');if(counter){counter.classList.remove('bump');void counter.offsetWidth;counter.classList.add('bump')}}
function openCart(){lastFocus=document.activeElement;overlay.classList.add('open');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeCart').focus();render()}
function closeCart(){overlay.classList.remove('open');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$('cartTrigger').addEventListener('click',openCart);$('closeCart').addEventListener('click',closeCart);overlay.addEventListener('click',closeCart);
document.addEventListener('keydown',function(e){if(!drawer.classList.contains('open'))return;if(e.key==='Escape'){closeCart();return;}if(e.key==='Tab'){var focusable=Array.prototype.slice.call(drawer.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),textarea:not([disabled])')).filter(function(el){return el.getClientRects().length});if(!focusable.length)return;var first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.querySelectorAll('[data-add]').forEach(function(el){el.addEventListener('click',function(){var id=el.getAttribute('data-add');if(!products[id])return;change(id,1);showToast(products[id][lang]+' · '+words.added);openCart()})});
var menu=$('menuToggle'),nav=$('navList');if(menu&&nav){menu.addEventListener('click',function(){var open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');})});}
$('nameLabel').textContent=words.name;$('emailLabel').textContent=words.email;$('noteLabel').textContent=words.note;$('requestButton').textContent=words.send;$('requestNote').textContent=words.explain;
$('requestForm').addEventListener('submit',function(e){
 e.preventDefault();var name=$('buyerName').value.trim(),email=$('buyerEmail').value.trim(),note=$('buyerNote').value.trim();
 if(!name||!$('buyerEmail').checkValidity()||!email){$('formError').textContent=words.required;return;}
 if(count()===0)return;$('formError').textContent='';
 var lines=[words.intro,''];
 Object.keys(cart).filter(function(id){return cart[id]>0}).forEach(function(id){var p=products[id]; lines.push('- '+p[lang]+' × '+cart[id]+' | '+euro(p.price)+' cad. | '+words.subtotal+': '+euro(cart[id]*p.price)+' | '+words.shipping+': '+(lang==='it'?p.shippingIt:p.shippingEn));});
 lines.push('',words.estimatedTotal+': '+euro(total()),words.shippingFootnote,'',words.fieldName+': '+name,words.fieldEmail+': '+email);if(note)lines.push(words.fieldNotes+': '+note);lines.push('',words.closing);
 var mailto='mailto:ad@italprotein.com?subject='+encodeURIComponent(words.subject)+'&body='+encodeURIComponent(lines.join('\n'));
 window.location.href=mailto;
 showToast(words.fallback);
});
render();
// Motion is progressively enhanced. Reduced-motion users retain static content.
(function(){
 var motionOK=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
 if(motionOK&&'IntersectionObserver' in window){
  var targets=Array.prototype.slice.call(document.querySelectorAll('.product, .use-case-card, .trust-grid article, .best-value-copy, .best-value-picture, .horeca-body, .horeca-image, .benefit, .payment-intro, .bank-card, .detail-info-grid, .detail-buy, .detail-media'));
  targets.forEach(function(el,i){el.classList.add('motion-reveal');el.style.setProperty('--reveal-delay',((i%3)*65)+'ms');});
  var ob=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');ob.unobserve(entry.target);}});},{threshold:0.05,rootMargin:'0px 0px -18px 0px'});
  targets.forEach(function(el){ob.observe(el)});
  document.documentElement.classList.add('has-motion');
 }
 var header=document.querySelector('.site-header');
 if(header){
  var bar=document.createElement('div');bar.className='reading-progress';bar.setAttribute('aria-hidden','true');header.appendChild(bar);
  var ticking=false;function updateProgress(){
   var height=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);bar.style.width=Math.min(100,Math.max(0,window.scrollY/height*100))+'%';
   header.classList.toggle('is-scrolled',window.scrollY>16);ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(updateProgress)}},{passive:true});
  updateProgress();
 }
 document.querySelectorAll('[data-copy]').forEach(function(button){button.addEventListener('click',function(){
  var value=button.getAttribute('data-copy');var original=button.textContent;
  function done(ok){button.textContent=ok?(lang==='it'?'Copiato ✓':'Copied ✓'):(lang==='it'?'Copia manualmente':'Copy manually');setTimeout(function(){button.textContent=original},1750)}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(function(){done(true)},function(){done(false)})}else{done(false)}
 });});
})();
})();