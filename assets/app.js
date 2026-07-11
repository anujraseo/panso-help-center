(function(){
  var ROOT = document.body.getAttribute('data-root') || '';
  var INDEX = [];
  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function hl(text,q){
    // content fields are trusted pre-formatted HTML (entities already encoded)
    text=text||'';
    if(!q) return text;
    try{
      var re=new RegExp('(?![^<]*>)('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
      return text.replace(re,'<mark>$1</mark>');
    }catch(e){return text;}
  }
  function score(item,q){
    var t=item.title.toLowerCase(), k=(item.keywords||'').toLowerCase(),
        s=(item.summary||'').toLowerCase(), cat=(item.catLabel||'').toLowerCase();
    var sc=0;
    if(t.indexOf(q)===0) sc+=100;
    if(t.indexOf(q)>-1) sc+=60;
    if(k.indexOf(q)>-1) sc+=30;
    if(cat.indexOf(q)>-1) sc+=20;
    if(s.indexOf(q)>-1) sc+=12;
    // token match
    q.split(/\s+/).forEach(function(tok){
      if(!tok)return;
      if(t.indexOf(tok)>-1) sc+=8;
      if(k.indexOf(tok)>-1) sc+=4;
      if(s.indexOf(tok)>-1) sc+=2;
    });
    return sc;
  }
  function search(q){
    q=(q||'').trim().toLowerCase();
    if(!q) return [];
    return INDEX.map(function(i){return {i:i,sc:score(i,q)};})
      .filter(function(x){return x.sc>0;})
      .sort(function(a,b){return b.sc-a.sc;})
      .slice(0,12).map(function(x){return x.i;});
  }
  function render(box,items,q){
    if(!items.length){box.innerHTML='<div class="empty">No results for &ldquo;'+esc(q)+'&rdquo;. Try another word (e.g. <b>contract</b>, <b>tax</b>, <b>event</b>).</div>';box.classList.add('show');return;}
    box.innerHTML=items.map(function(it){
      return '<a href="'+ROOT+it.url+'"><span class="r-c">'+(it.catLabel||'')+'</span>'+
             '<div class="r-t">'+hl(it.title,q)+'</div>'+
             '<div class="r-s">'+hl(it.summary,q)+'</div></a>';
    }).join('');
    box.classList.add('show');
  }
  function wire(input){
    var box=document.querySelector(input.getAttribute('data-results'));
    if(!box) return;
    function upd(){var q=input.value; if(!q.trim()){box.classList.remove('show');box.innerHTML='';return;} render(box,search(q),q.trim().toLowerCase());}
    input.addEventListener('input',upd);
    input.addEventListener('focus',function(){ if(input.value.trim()) upd();});
    document.addEventListener('click',function(e){ if(!box.contains(e.target)&&e.target!==input) box.classList.remove('show');});
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){var first=box.querySelector('a'); if(first) window.location=first.getAttribute('href');}
      if(e.key==='Escape'){box.classList.remove('show');}
    });
  }
  // scroll-spy for article TOC
  function spy(){
    var links=[].slice.call(document.querySelectorAll('.toc a'));
    if(!links.length) return;
    var secs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));}).filter(Boolean);
    function onScroll(){
      var y=window.scrollY+120, cur=null;
      secs.forEach(function(s){ if(s.offsetTop<=y) cur=s; });
      links.forEach(function(a){ a.style.color=''; a.style.borderColor='';
        if(cur&&a.getAttribute('href')==='#'+cur.id){a.style.color='var(--green-2)';a.style.borderColor='var(--green-2)';}});
    }
    window.addEventListener('scroll',onScroll); onScroll();
  }
  INDEX = window.PANSO_INDEX || [];
  [].slice.call(document.querySelectorAll('input[data-search]')).forEach(wire);
  spy();
})();
