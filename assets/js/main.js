(function(){
  'use strict';
  var d=document, root=d.documentElement;
  root.classList.remove('no-js');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

  /* Mobile menu */
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var open=menu.classList.toggle('open');
      burger.setAttribute('aria-expanded',open?'true':'false');
    });
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open')){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.focus();}});
  }

  /* Scroll reveal */
  var els=d.querySelectorAll('.reveal');
  if(reduce||!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  }

  /* Pointer 3D tilt on hero product */
  var stage=d.querySelector('.stage'), prod=stage&&stage.querySelector('.product');
  if(stage&&prod&&!reduce&&window.matchMedia('(pointer:fine)').matches){
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      prod.style.animation='none';
      prod.style.transform='rotateY('+(x*14)+'deg) rotateX('+(-y*10)+'deg) translateZ(20px)';
    });
    stage.addEventListener('pointerleave',function(){prod.style.transform='';prod.style.animation='';});
  }

  /* Sticky buy bar */
  var bar=d.querySelector('.buybar');
  if(bar){
    var onScroll=function(){bar.classList.toggle('show',window.scrollY>650);};
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  }

  /* Centered promo modal: 6s after load, 24h cooldown after dismissal */
  var modal=d.getElementById('promo'), lastFocus=null, modalOpen=false;
  var KEY='lc_promo_dismissed';
  function closeModal(){
    if(!modalOpen)return;
    modalOpen=false;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
    d.body.style.overflow='';store(KEY,String(Date.now()));
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
    setTimeout(function(){modal.hidden=true;},350);
  }
  function openModal(){
    if(!modal||modalOpen)return;
    lastFocus=d.activeElement;modal.hidden=false;
    requestAnimationFrame(function(){
      modalOpen=true;modal.classList.add('open');modal.setAttribute('aria-hidden','false');
      d.body.style.overflow='hidden';
      var f=modal.querySelector('.x');if(f)f.focus();
    });
  }
  if(modal){
    var last=parseInt(store(KEY)||'0',10);
    var cooled=!last||(Date.now()-last)>864e5;
    var noPromo=d.body.hasAttribute('data-no-promo');
    if(cooled&&!noPromo){
      var start=function(){setTimeout(openModal,6000);};
      if(d.readyState==='complete')start();else window.addEventListener('load',start);
    }
    modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
    modal.querySelector('.x').addEventListener('click',closeModal);
    d.addEventListener('keydown',function(e){
      if(!modalOpen)return;
      if(e.key==='Escape'){closeModal();return;}
      if(e.key==='Tab'){
        var f=modal.querySelectorAll('a[href],button:not([disabled])'),first=f[0],lastEl=f[f.length-1];
        if(e.shiftKey&&d.activeElement===first){e.preventDefault();lastEl.focus();}
        else if(!e.shiftKey&&d.activeElement===lastEl){e.preventDefault();first.focus();}
      }
    });
  }

  /* Bottom-left informational notification (no fabricated purchases) */
  var toast=d.getElementById('toast');
  if(toast){
    var msgs=JSON.parse(toast.getAttribute('data-msgs')||'[]'),i=0,timer=null,stopped=false;
    var txt=toast.querySelector('.tt');
    function show(){
      if(stopped||!msgs.length)return;
      if(modalOpen){timer=setTimeout(show,4000);return;}
      var m=msgs[i%msgs.length];i++;
      txt.innerHTML='<b>'+m.t+'</b>'+m.s;
      toast.classList.add('show');
      timer=setTimeout(function(){toast.classList.remove('show');timer=setTimeout(show,18000+Math.random()*8000);},6000);
    }
    toast.querySelector('.tx').addEventListener('click',function(){stopped=true;clearTimeout(timer);toast.classList.remove('show');store('lc_toast_off','1');});
    if(store('lc_toast_off')!=='1'){setTimeout(show,5000);}
  }

  /* Order page: highlight selected package from ?package= */
  var sel=d.querySelector('[data-package-note]');
  if(sel){
    var p=new URLSearchParams(location.search).get('package');
    if(p&&/^[a-z0-9-]{1,20}$/i.test(p)){var c=d.getElementById('pkg-'+p);if(c){c.classList.add('selected');}}
  }

  /* Year */
  d.querySelectorAll('[data-year]').forEach(function(n){n.textContent=new Date().getFullYear();});
})();
