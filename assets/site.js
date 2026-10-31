(function(){
'use strict';
var lang=document.body.dataset.lang==='en'?'en':'it';
var words={
 it:{empty:'Non hai ancora selezionato formati.',emptyHint:'Scegli uno o più formati per preparare il tuo preordine.',qty:'Quantità',remove:'Rimuovi',name:'Nome e cognome',email:'Indirizzo email',note:'Note (facoltative)',send:'Prepara il preordine via email ↗',explain:'Si aprirà il tuo programma email con i dettagli del preordine. Nessun pagamento sarà effettuato automaticamente e Italprotein confermerà manualmente disponibilità, prezzo e arrivo stimato in circa 1 mese.',required:'Inserisci nome ed email validi prima di procedere.',added:'Aggiunto al preordine',subject:'Preordine Proamina® — richiesta disponibilità e conferma',intro:'Buongiorno Italprotein,\nvorrei inviare una richiesta di preordine per i seguenti prodotti:',closing:'So che l’arrivo è stimato in circa 1 mese dall’ordine, poiché i formati sono ancora in fase di completamento. Vi chiedo di confermare prezzo, disponibilità, spedizione e modalità di pagamento.\n\nGrazie.',fieldName:'Nome',fieldEmail:'Email',fieldNotes:'Note',fallback:'Il tuo client email non si apre? Scrivi a ad@italprotein.com e incolla il riepilogo del preordine.'},
 en:{empty:'No formats selected yet.',emptyHint:'Select one or more formats to prepare your preorder.',qty:'Quantity',remove:'Remove',name:'Full name',email:'Email address',note:'Notes (optional)',send:'Prepare preorder email ↗',explain:'Your email app will open with your preorder details. No payment will be collected automatically and Italprotein will manually confirm availability, pricing and the estimated 1 month lead time.',required:'Enter a valid name and email address to continue.',added:'Added to preorder',subject:'Proamina® preorder — availability and confirmation',intro:'Hello Italprotein,\nI would like to submit a preorder request for the following products:',closing:'I understand arrival is estimated at about 1 month from ordering because the formats are still being finalized. Please confirm pricing, availability, shipping and payment terms.\n\nThank you.',fieldName:'Name',fieldEmail:'Email',fieldNotes:'Notes',fallback:'If your email app does not open, write to ad@italprotein.com and paste this preorder enquiry.'}
}[lang];
var products={
 '0':{it:'Proamina® — Barattolo 1 kg',en:'Proamina® — 1 kg jar'},
 '1':{it:'Proamina® — Busta richiudibile 200 g',en:'Proamina® — 200 g resealable pouch'},
 '2':{it:'Proamina® — Sachet 5 g',en:'Proamina® — 5 g sachet'}
};
var storageKey='proamina-preorder-v2';
var cart={};
try{var saved=JSON.parse(localStorage.getItem(storageKey)||'{}');Object.keys(products).forEach(function(id){var q=Number(saved[id]);if(Number.isInteger(q)&&q>0&&q<=99)cart[id]=q;});}catch(e){}
var $=function(id){return document.getElementById(id)};
var drawer=$('cartDrawer'),overlay=$('cartOverlay'),lastFocus=null,notifyTimer=null;
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(cart));}catch(e){}}
function count(){return Object.keys(cart).reduce(function(sum,id){return sum+cart[id]},0)}
function showToast(msg){var el=$('notify');el.textContent=msg;el.classList.add('show');clearTimeout(notifyTimer);notifyTimer=setTimeout(function(){el.classList.remove('show')},1900)}
function btn(text,cls,handler,aria){var b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;if(aria)b.setAttribute('aria-label',aria);b.addEventListener('click',handler);return b}
function render(){
 var n=count();$('cartCount').textContent=n;$('drawerCount').textContent=n;
 var items=$('cartItems');items.replaceChildren();var ids=Object.keys(cart).filter(function(k){return cart[k]>0});
 if(!ids.length){var empty=document.createElement('div');empty.className='empty-cart';var h=document.createElement('strong');h.textContent=words.empty;var p=document.createElement('p');p.textContent=words.emptyHint;empty.append(h,p);items.append(empty);$('cartFoot').hidden=true;return;}
 $('cartFoot').hidden=false;
 ids.forEach(function(id){var item=document.createElement('div');item.className='cart-line';var info=document.createElement('div');var title=document.createElement('strong');title.textContent=products[id][lang];var sub=document.createElement('small');sub.textContent=words.qty;var qty=document.createElement('div');qty.className='qty-row';qty.append(btn('−','',function(){change(id,-1)},'Decrease quantity'));var q=document.createElement('span');q.textContent=cart[id];qty.append(q,btn('+','',function(){change(id,1)},'Increase quantity'));info.append(title,sub,qty);var del=btn(words.remove,'delete-line',function(){delete cart[id];persist();render();});item.append(info,del);items.append(item);});
}
function change(id,delta){var next=Math.max(0,Math.min(99,(cart[id]||0)+delta));if(next)cart[id]=next;else delete cart[id];persist();render()}
function openCart(){lastFocus=document.activeElement;overlay.classList.add('open');drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeCart').focus();render()}
function closeCart(){overlay.classList.remove('open');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$('cartTrigger').addEventListener('click',openCart);$('closeCart').addEventListener('click',closeCart);overlay.addEventListener('click',closeCart);
document.addEventListener('keydown',function(e){if(!drawer.classList.contains('open'))return;if(e.key==='Escape'){closeCart();return;}if(e.key==='Tab'){var focusable=Array.prototype.slice.call(drawer.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),textarea:not([disabled])')).filter(function(el){return el.getClientRects().length});if(!focusable.length)return;var first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.querySelectorAll('[data-add]').forEach(function(el){el.addEventListener('click',function(){var id=el.getAttribute('data-add');if(!products[id])return;change(id,1);showToast(products[id][lang]+' · '+words.added);openCart()})});
var menu=$('menuToggle'),nav=$('navList');menu.addEventListener('click',function(){var open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');})});
$('nameLabel').textContent=words.name;$('emailLabel').textContent=words.email;$('noteLabel').textContent=words.note;$('requestButton').textContent=words.send;$('requestNote').textContent=words.explain;
$('requestForm').addEventListener('submit',function(e){
 e.preventDefault();var name=$('buyerName').value.trim(),email=$('buyerEmail').value.trim(),note=$('buyerNote').value.trim();
 if(!name||!$('buyerEmail').checkValidity()||!email){$('formError').textContent=words.required;return;}
 if(count()===0)return;$('formError').textContent='';
 var lines=[words.intro,''];
 Object.keys(cart).filter(function(id){return cart[id]>0}).forEach(function(id){lines.push('- '+products[id][lang]+' × '+cart[id])});
 lines.push('',''+words.fieldName+': '+name,words.fieldEmail+': '+email);if(note)lines.push(words.fieldNotes+': '+note);lines.push('',words.closing);
 var mailto='mailto:ad@italprotein.com?subject='+encodeURIComponent(words.subject)+'&body='+encodeURIComponent(lines.join('\n'));
 window.location.href=mailto;
 showToast(words.fallback);
});
render();
})();
