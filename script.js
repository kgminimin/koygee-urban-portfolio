
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
