
const gallery = document.getElementById('gallery');
const filters = document.getElementById('filters');
const tagSet = new Set(['All']);

IMAGES.forEach(img => img.tags.split(',').forEach(t => tagSet.add(t.trim())));

// Build filter buttons
tagSet.forEach(tag => {
  const b = document.createElement('button');
  b.className = 'filter' + (tag==='All' ? ' active' : '');
  b.textContent = tag;
  b.dataset.tag = tag;
  b.onclick = () => applyFilter(tag, b);
  filters.appendChild(b);
});

function render(items){
  gallery.innerHTML = '';
  items.forEach(({src, alt, tags}) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.tags = tags;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.onclick = () => openLightbox(src, alt);
    div.appendChild(img);
    gallery.appendChild(div);
  });
}

function applyFilter(tag, btn){
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if(tag === 'All') return render(IMAGES);
  const filtered = IMAGES.filter(i => i.tags.split(',').map(s=>s.trim()).includes(tag));
  render(filtered);
}

// Simple Lightbox
const lb = (() => {
  const wrap = document.createElement('div');
  wrap.className = 'lightbox';
  wrap.innerHTML = '<span class="close">×</span><div><img><div class="caption"></div></div>';
  document.body.appendChild(wrap);
  wrap.querySelector('.close').onclick = () => wrap.classList.remove('open');
  wrap.onclick = (e) => { if(e.target === wrap) wrap.classList.remove('open'); };
  return wrap;
})();

function openLightbox(src, alt){
  lb.querySelector('img').src = src;
  lb.querySelector('.caption').textContent = alt;
  lb.classList.add('open');
}

// Initial render
render(IMAGES);


// Collection presets mapping to existing tags
const collMap = {
  City: ['Urban','Seattle','SanFrancisco','Architecture'],
  Night: ['Night','Neon'],
  People: ['Portrait','Street']
};

function applyCollection(name){
  const tags = new Set(collMap[name] || []);
  if(tags.size === 0){ render(IMAGES); return; }
  const filtered = IMAGES.filter(i => {
    const t = i.tags.split(',').map(s=>s.trim());
    return t.some(x => tags.has(x));
  });
  render(filtered);
}

// Wire collection chips
document.querySelectorAll('[data-coll]').forEach(ch => {
  ch.addEventListener('click', e => applyCollection(ch.dataset.coll));
});


// Instagram feed: load iframe if src provided; else show fallback grid
function renderIgFallback(){
  const wrap = document.getElementById('igFallback');
  if(!wrap) return;
  wrap.hidden = false;
  // Choose up to 12 recent-looking images (prioritize Street/Urban tags)
  const preferredTags = new Set(['Street','Urban']);
  const picks = [];
  const pool = IMAGES.slice().reverse();
  for(const item of pool){
    const t = item.tags.split(',').map(s=>s.trim());
    const good = t.some(x => preferredTags.has(x));
    if(good) picks.push(item);
    if(picks.length >= 12) break;
  }
  if(picks.length < 12){
    for(const item of pool){
      if(picks.includes(item)) continue;
      picks.push(item);
      if(picks.length >= 12) break;
    }
  }
  wrap.innerHTML = '';
  picks.forEach(p => {
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.alt;
    img.loading = 'lazy';
    wrap.appendChild(img);
  });
}

(function initInstagram(){
  const iframe = document.getElementById('igFrame');
  if(!iframe) return;
  // If a widget URL hasn't been set, show fallback immediately
  if(!iframe.getAttribute('src')){
    renderIgFallback();
    return;
  }
  // Otherwise, try to load the iframe; if it errors, show fallback
  let safety = setTimeout(renderIgFallback, 6000);
  iframe.addEventListener('load', () => { clearTimeout(safety); });
  iframe.addEventListener('error', () => { renderIgFallback(); });
})();


// Mobile menu toggle
(function mobileMenu(){
  const t = document.getElementById('menuToggle');
  const panel = document.getElementById('mobileMenu');
  if(!t || !panel) return;
  const open = () => { panel.hidden = false; document.addEventListener('click', outside, { once:true }); };
  const close = () => { panel.hidden = true; };
  const outside = (e) => { if(!panel.contains(e.target) && e.target !== t) close(); };
  t.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.hidden ? open() : close();
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close()));
})();

// Section reveal on scroll
(function revealOnScroll(){
  const els = document.querySelectorAll('section, .card');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('reveal','show'); io.unobserve(e.target); } });
  }, { threshold:.06 });
  els.forEach(el => io.observe(el));
})();
