/* Advance complete partner/application cards; never leave cropped banners at rest. */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rails = [
    {selector:".network-rail", title:"Partner e collaborazioni / Partners and collaborations", count:2},
    {selector:".research-rail", title:"Applicazioni / Applications", count:3}
  ];
  rails.forEach(({selector,title,count}) => {
    const rail = document.querySelector(selector);
    if (!rail) return;
    const track = rail.querySelector(selector === ".network-rail" ? ".network-track" : ".research-track");
    if (!track) return;
    const groups = Array.from(track.children);
    if (groups.length !== 2) return;
    const original = groups[0];
    const total = original.children.length;
    if (total <= 1 || groups[1].children.length !== total) return;
    const items = Array.from(original.children);
    const copies = Array.from(groups[1].children);
    let index = 0, step = 0, visible = 1, paused = false, inView = false, transitioning = false, timer;
    const gap = 16;
    const controls = document.createElement("div");
    controls.className = "rail-carousel-controls";
    const makeButton = (symbol, name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = symbol;
      btn.setAttribute("aria-label", name + " – " + title);
      return btn;
    };
    const prev = makeButton("‹", "Precedente / Previous");
    const next = makeButton("›", "Successivo / Next");
    controls.append(prev, next);
    rail.insertAdjacentElement("afterend",controls);
    rail.classList.add("is-card-carousel");
    rail.setAttribute("role","region");
    rail.setAttribute("aria-roledescription","carousel");
    rail.setAttribute("aria-label",title);
    copies.forEach(item => { item.setAttribute("aria-hidden","true");item.inert=true; });
    const position = () => {track.style.transform = "translate3d(" + (-index*step) + "px,0,0)";};
    const resize = () => {
      const width = rail.getBoundingClientRect().width;
      visible = width <= 620 ? 1 : width <= 1020 ? 2 : count;
      visible = Math.min(visible,total);
      step = width / visible;
      const cardWidth = Math.max(180,step-gap);
      rail.style.setProperty("--full-card-width",cardWidth+"px");
      rail.style.setProperty("--full-card-gap",gap+"px");
      track.style.transition="none";
      position();
      void track.offsetWidth;
      track.style.transition="";
    };
    const snapToStart = () => {
      track.style.transition="none";
      index=0;position();
      void track.offsetWidth;
      track.style.transition="";
      transitioning=false;
    };
    const advance = (direction=1) => {
      if (transitioning || reduceMotion.matches && direction===1) return;
      if(direction<0 && index===0){
        track.style.transition="none";index=total;position();
        void track.offsetWidth;track.style.transition="";
      }
      transitioning=true;
      index += direction;
      position();
    };
    track.addEventListener("transitionend",event=>{
      if(event.target!==track || event.propertyName!=="transform") return;
      if(index===total) snapToStart();
      else transitioning=false;
    });
    next.addEventListener("click",()=>{paused=true;advance(1);});
    prev.addEventListener("click",()=>{paused=true;advance(-1);});
    rail.addEventListener("keydown",event=>{
      if(event.key==="ArrowRight" || event.key==="ArrowLeft"){
        event.preventDefault();paused=true;advance(event.key==="ArrowRight"?1:-1);
      }
    });
    rail.addEventListener("mouseenter",()=>{paused=true;});
    rail.addEventListener("mouseleave",()=>{paused=false;});
    rail.addEventListener("focusin",()=>{paused=true;});
    rail.addEventListener("focusout",()=>{paused=false;});
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries=>{inView=entries.some(x=>x.isIntersecting);},{threshold:.05}).observe(rail);
    } else inView=true;
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(rail);
    else window.addEventListener("resize",resize,{passive:true});
    resize();
    timer=window.setInterval(()=>{
      if(!document.hidden && !paused && inView && !reduceMotion.matches)advance(1);
    },4800);
    if(reduceMotion.matches){
      next.disabled=false;prev.disabled=false;
    }
  });
})();