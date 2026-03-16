// ── Storage key ───────────────────────────────────────────────────
// Authentication is handled entirely by Netlify Identity + CDN-level
// role-based redirects (netlify.toml). No credentials live in this file.
const STORAGE_KEY = 'ilumia_admin_settings';

// ── Master font list (all Google Fonts pre-loaded in the app) ──
const MASTER_FONTS = [
  {k:'Pacifico',       cat:'Script'},
  {k:'Allura',         cat:'Script'},
  {k:'Mea Culpa',      cat:'Script'},
  {k:'Parisienne',     cat:'Script'},
  {k:'Italianno',      cat:'Script'},
  {k:'Mr De Haviland', cat:'Script'},
  {k:'Alex Brush',     cat:'Script'},
  {k:'Satisfy',        cat:'Script'},
  {k:'Redressed',      cat:'Script'},
  {k:'Crafty Girls',   cat:'Script'},
  {k:'Cookie',         cat:'Script'},
  {k:'Courgette',      cat:'Script'},
  {k:'Yellowtail',     cat:'Script'},
  {k:'Kaushan Script', cat:'Script'},
  {k:'Dancing Script', cat:'Script'},
  {k:'Great Vibes',    cat:'Script'},
  {k:'Sacramento',     cat:'Script'},
  {k:'Lobster',        cat:'Script'},
  {k:'Shantell Sans',  cat:'Manuscrita'},
  {k:'Boogaloo',       cat:'Manuscrita'},
  {k:'Permanent Marker',cat:'Manuscrita'},
  {k:'Baloo 2',        cat:'Manuscrita'},
  {k:'Fredoka One',    cat:'Manuscrita'},
  {k:'Amatic SC',      cat:'Manuscrita'},
  {k:'Rock Salt',      cat:'Manuscrita'},
  {k:'Comfortaa',      cat:'Manuscrita'},
  {k:'Nunito',         cat:'Manuscrita'},
  {k:'Raleway',        cat:'Manuscrita'},
  {k:'Righteous',      cat:'Manuscrita'},
  {k:'Limelight',      cat:'Bold'},
  {k:'Titan One',      cat:'Bold'},
  {k:'Yeseva One',     cat:'Bold'},
  {k:'Russo One',      cat:'Bold'},
  {k:'Rye',            cat:'Bold'},
  {k:'Orbitron',       cat:'Bold'},
  {k:'Cinzel Decorative',cat:'Elegante'},
  {k:'Medula One',     cat:'Elegante'},
  {k:'Poiret One',     cat:'Elegante'},
  {k:'IM Fell English',cat:'Elegante'},
  {k:'Quicksand',      cat:'Elegante'},
];

// ── Defaults (mirrors current app hardcoded values) ─────────────
const DEFAULTS = {
  theme: {
    '--bg':      '#f2f0ec',
    '--panel':   '#ffffff',
    '--panel2':  '#f7f5f2',
    '--border':  '#e4e0da',
    '--border2': '#ccc8c1',
    '--accent':  '#333333',
    '--text':    '#1a1918',
    '--muted':   '#8a8680',
  },
  colors: [
    {c:'#b3f0ff',n:'Azul Hielo'},
    {c:'#ff2222',n:'Roja'},
    {c:'#ffb300',n:'Amber'},
    {c:'#e8ff00',n:'Amarillo Limón'},
    {c:'#bf00ff',n:'Morado'},
    {c:'#00ff88',n:'Verde'},
    {c:'#ffe8c0',n:'Blanco Cálido'},
    {c:'#3b82f6',n:'Azul'},
    {c:'#ff3cac',n:'Rosa'},
    {c:'#ffd700',n:'Amarillo Dorado'},
    {c:'#ff8800',n:'Naranja'},
    {c:'#e8f4ff',n:'Blanca Fría'},
  ],
  fontTabs: [
    {label:'Script', fonts:[
      {k:'Pacifico',      l:'Pacifico'},
      {k:'Allura',        l:'Balsamic'},
      {k:'Mea Culpa',     l:'Dreaming'},
      {k:'Parisienne',    l:'Grechen'},
      {k:'Italianno',     l:'Intro Scri'},
      {k:'Mr De Haviland',l:'Barbra'},
      {k:'Alex Brush',    l:'Chloe'},
      {k:'Satisfy',       l:'Satisfy'},
      {k:'Redressed',     l:'Redressed'},
      {k:'Crafty Girls',  l:'Crafty G'},
    ]},
    {label:'Manuscrita', fonts:[
      {k:'Shantell Sans',   l:'Shantell'},
      {k:'Boogaloo',        l:'TT Backwa'},
      {k:'Permanent Marker',l:'Stinger'},
      {k:'Baloo 2',         l:'Bingoo'},
      {k:'Fredoka One',     l:'Mak'},
    ]},
    {label:'Bold', fonts:[
      {k:'Limelight', l:'Howell'},
      {k:'Titan One', l:'TT Polls'},
      {k:'Yeseva One',l:'Romman'},
      {k:'Russo One', l:'Yodnam'},
      {k:'Rye',       l:'Lucky Bones'},
    ]},
    {label:'Elegante', fonts:[
      {k:'Cinzel Decorative',l:'Sk Moralist'},
      {k:'Medula One',       l:'Medula'},
      {k:'Poiret One',       l:'Nove'},
      {k:'IM Fell English',  l:'Jayagiri'},
      {k:'Quicksand',        l:'Art Nuvo'},
    ]},
  ],
  walls: [
    {url:'https://images.unsplash.com/photo-1770816306935-d0a08e93d823?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770816306935-d0a08e93d823?w=400&q=80&fit=crop',  label:'Local 1',     overlay:0.25},
    {url:'https://plus.unsplash.com/premium_photo-1728155006673-887f27d7694f?w=1400&q=85', thumb:'https://plus.unsplash.com/premium_photo-1728155006673-887f27d7694f?w=400&q=80&fit=crop', label:'Local 2',     overlay:0.30},
    {url:'https://images.unsplash.com/photo-1769501203673-159257ecb72d?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1769501203673-159257ecb72d?w=400&q=80&fit=crop',  label:'Local 3',     overlay:0.28},
    {url:'https://images.unsplash.com/photo-1770646403987-64cf5c08c870?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770646403987-64cf5c08c870?w=400&q=80&fit=crop',  label:'Local 4',     overlay:0.32},
    {url:'https://images.unsplash.com/photo-1770319675686-ae3b11647bcd?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770319675686-ae3b11647bcd?w=400&q=80&fit=crop',  label:'Local 5',     overlay:0.28},
    {url:'https://plus.unsplash.com/premium_photo-1683121299733-06eed1e7df79?w=1400&q=85', thumb:'https://plus.unsplash.com/premium_photo-1683121299733-06eed1e7df79?w=400&q=80&fit=crop', label:'Local 6',     overlay:0.35},
    {url:'https://images.unsplash.com/photo-1526887593587-a307ea5d46b4?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1526887593587-a307ea5d46b4?w=400&q=80&fit=crop',  label:'Local 7',     overlay:0.30},
    {url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&fit=crop',  label:'Hotel Lobby', overlay:0.28},
  ],
  prices: [
    {maxArea:900,  label:'30×30 cm', price:1000},
    {maxArea:1600, label:'40×40 cm', price:1400},
    {maxArea:2500, label:'50×50 cm', price:1600},
    {maxArea:3600, label:'60×60 cm', price:1800},
    {maxArea:4900, label:'70×70 cm', price:2100},
  ],
  controllerPrice: 150,
};

// ── State ────────────────────────────────────────────────────────
let S = null; // current settings being edited

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

function loadSettings(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      const saved = JSON.parse(raw);
      // Merge with defaults so new fields don't break
      S = {
        theme:           { ...DEFAULTS.theme,   ...saved.theme },
        colors:          saved.colors           || deepClone(DEFAULTS.colors),
        fontTabs:        saved.fontTabs         || deepClone(DEFAULTS.fontTabs),
        walls:           saved.walls            || deepClone(DEFAULTS.walls),
        prices:          saved.prices           || deepClone(DEFAULTS.prices),
        controllerPrice: saved.controllerPrice  ?? DEFAULTS.controllerPrice,
      };
      return;
    }catch(e){}
  }
  S = deepClone(DEFAULTS);
}

function saveSettings(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  showToast('¡Cambios guardados! La app usará la nueva configuración.');
}

function resetSettings(){
  if(!confirm('¿Restablecer todos los valores a los predeterminados? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  S = deepClone(DEFAULTS);
  renderAll();
  showToast('Configuración restablecida a los valores por defecto.');
}

// ── Toast ────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.hidden = true; }, 3500);
}

// ── Panel init (runs once on load — CDN already validated the session) ──
let panelInited = false;
function initPanel(){
  if(panelInited) return;
  panelInited = true;
  loadSettings();
  initAddColor();
  initAddWall();
  initAddPrice();
  initFontListeners();
  renderAll();
}

// ── Navigation ───────────────────────────────────────────────────
function initNav(){
  document.getElementById('navTabs').addEventListener('click', e => {
    const btn = e.target.closest('.ntab');
    if(!btn) return;
    document.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.dataset.tab === tab));
  });
  document.getElementById('btnSave').addEventListener('click', () => {
    collectAll();
    saveSettings();
  });
  document.getElementById('btnReset').addEventListener('click', resetSettings);
  document.getElementById('btnLogout').addEventListener('click', () => {
    netlifyIdentity.logout();
  });
  // Redirect only after Identity has fully cleared the session
  netlifyIdentity.on('logout', () => {
    window.location.replace('/adminpanel/acceso.html');
  });
}

// ── Collect all current form values into S ───────────────────────
function collectAll(){
  collectTheme();
  collectColors();
  collectFonts();
  collectWalls();
  collectPrices();
}

// ── THEME ────────────────────────────────────────────────────────
const THEME_LABELS = {
  '--bg':      'Fondo general',
  '--panel':   'Panel / Sidebar',
  '--panel2':  'Panel secundario',
  '--border':  'Borde claro',
  '--border2': 'Borde medio',
  '--accent':  'Acento (botones)',
  '--text':    'Texto principal',
  '--muted':   'Texto muted',
};

let themeListenerAttached = false;
function renderTheme(){
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  Object.entries(S.theme).forEach(([key, val]) => {
    const item = document.createElement('div');
    item.className = 'theme-item';
    item.innerHTML = `
      <label>${THEME_LABELS[key] || key}</label>
      <div class="theme-color-row">
        <input type="color" data-key="${key}" value="${val}">
        <input type="text"  data-key="${key}-text" value="${val}" maxlength="7" placeholder="#000000">
      </div>`;
    grid.appendChild(item);
  });
  if(!themeListenerAttached){
    themeListenerAttached = true;
    grid.addEventListener('input', e => {
      const inp = e.target;
      const key = inp.dataset.key;
      if(!key) return;
      const val = inp.value;
      if(key.endsWith('-text')){
        const realKey = key.replace('-text','');
        if(/^#[0-9a-fA-F]{6}$/.test(val)){
          S.theme[realKey] = val;
          grid.querySelector(`input[type=color][data-key="${realKey}"]`).value = val;
          updateThemePreview();
        }
      } else {
        S.theme[key] = val;
        grid.querySelector(`input[type=text][data-key="${key}-text"]`).value = val;
        updateThemePreview();
      }
    });
  }
  updateThemePreview();
}

function collectTheme(){
  document.querySelectorAll('#themeGrid input[type=color]').forEach(inp => {
    S.theme[inp.dataset.key] = inp.value;
  });
}

function updateThemePreview(){
  const p = document.getElementById('themePreview');
  p.querySelector('.prev-panel').style.cssText = `
    background:${S.theme['--panel']};
    border-right:1px solid ${S.theme['--border']};
  `;
  p.querySelector('.prev-header').style.cssText = `
    background:${S.theme['--panel']};
    color:${S.theme['--muted']};
    border-bottom:1px solid ${S.theme['--border']};
  `;
  p.querySelectorAll('.prev-block').forEach(b => {
    b.style.borderBottom = `1px solid ${S.theme['--border']}`;
  });
  p.querySelectorAll('.prev-label').forEach(l => l.style.color = S.theme['--muted']);
  p.querySelector('.prev-textarea').style.cssText = `
    background:${S.theme['--panel2']};
    border:1.5px solid ${S.theme['--border']};
    color:${S.theme['--text']};
    border-radius:6px;padding:7px 9px;font-size:.75rem;
  `;
  p.querySelector('.prev-sw.active-sw').style.borderColor = S.theme['--accent'];
  p.querySelector('.prev-canvas').style.background = S.theme['--bg'];
}

// ── COLORS ───────────────────────────────────────────────────────
function renderColors(){
  const list = document.getElementById('colorsList');
  list.innerHTML = '';
  S.colors.forEach((col, i) => {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.dataset.idx = i;
    item.innerHTML = `
      <button class="btn-del-color" data-di="${i}" title="Eliminar">✕</button>
      <div class="color-swatch-big" data-ci="${i}" style="background:${col.c}" title="Cambiar color"></div>
      <input type="color" class="color-picker-hidden" value="${col.c}" data-ci="${i}">
      <input type="text" value="${escHtml(col.n)}" placeholder="Nombre del color" data-ni="${i}">`;
    list.appendChild(item);
  });
}

function collectColors(){
  const items = document.querySelectorAll('#colorsList .color-item');
  S.colors = Array.from(items).map(item => ({
    c: item.querySelector('input[type=color]').value,
    n: item.querySelector('input[type=text]').value || 'Color',
  }));
}

function initAddColor(){
  document.getElementById('btnAddColor').addEventListener('click', () => {
    collectColors();
    S.colors.push({c:'#ff3cac', n:'Nuevo color'});
    renderColors();
    document.getElementById('colorsList').lastElementChild?.scrollIntoView({behavior:'smooth', block:'nearest'});
  });
  const list = document.getElementById('colorsList');
  // Click on swatch → open hidden color picker
  list.addEventListener('click', e => {
    const swatch = e.target.closest('.color-swatch-big');
    if(swatch){
      const i = swatch.dataset.ci;
      list.querySelector(`input[type=color][data-ci="${i}"]`).click();
      return;
    }
    const del = e.target.closest('[data-di]');
    if(!del) return;
    const i = parseInt(del.dataset.di);
    if(S.colors.length <= 1){ showToast('Debe haber al menos un color.'); return; }
    S.colors.splice(i, 1);
    renderColors();
  });
  list.addEventListener('input', e => {
    const colorInp = e.target.closest('input[type=color][data-ci]');
    const nameInp  = e.target.closest('input[type=text][data-ni]');
    if(colorInp){
      const i = parseInt(colorInp.dataset.ci);
      S.colors[i].c = colorInp.value;
      colorInp.closest('.color-item').querySelector('.color-swatch-big').style.background = colorInp.value;
    }
    if(nameInp){
      const i = parseInt(nameInp.dataset.ni);
      S.colors[i].n = nameInp.value;
    }
  });
}

// ── FONTS ────────────────────────────────────────────────────────
function renderFonts(){
  const container = document.getElementById('fontTabsAdmin');
  container.innerHTML = '';

  S.fontTabs.forEach((tab, ti) => {
    const group = document.createElement('div');
    group.className = 'font-tab-group';
    group.dataset.ti = ti;

    // Header
    const header = document.createElement('div');
    header.className = 'font-tab-header';
    header.innerHTML = `
      <input type="text" class="tab-label-input" value="${escHtml(tab.label)}" placeholder="Nombre de categoría" maxlength="20">
      <span class="tab-count">${tab.fonts.length} fuente${tab.fonts.length !== 1 ? 's' : ''}</span>
      ${S.fontTabs.length > 1 ? `<button class="btn-del btn-small" data-del-tab="${ti}" title="Eliminar categoría">✕ Categoría</button>` : ''}`;
    group.appendChild(header);

    // Font items
    const itemsEl = document.createElement('div');
    itemsEl.className = 'font-items';
    tab.fonts.forEach((font, fi) => {
      const item = document.createElement('div');
      item.className = 'font-item';
      item.dataset.ti = ti;
      item.dataset.fi = fi;
      item.innerHTML = `
        <span class="font-preview" style="font-family:'${escHtml(font.k)}',cursive">${escHtml(font.l || font.k)}</span>
        <span class="font-key">${escHtml(font.k)}</span>
        <input class="font-label-input" type="text" value="${escHtml(font.l || font.k)}" placeholder="Etiqueta" maxlength="20" data-ti="${ti}" data-fi="${fi}">
        <button class="btn-del" data-del-font="${ti}-${fi}" title="Quitar fuente">✕</button>`;
      itemsEl.appendChild(item);
    });
    group.appendChild(itemsEl);

    // Add font row
    const addRow = document.createElement('div');
    addRow.className = 'font-add-row';

    const sel = document.createElement('select');
    sel.innerHTML = `<option value="">— Agregar fuente —</option>` +
      MASTER_FONTS.map(f => `<option value="${escHtml(f.k)}">${escHtml(f.k)}</option>`).join('');

    const labelInp = document.createElement('input');
    labelInp.type = 'text';
    labelInp.placeholder = 'Etiqueta (opcional)';
    labelInp.maxLength = 20;

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-small';
    addBtn.textContent = '+ Agregar';
    addBtn.addEventListener('click', () => {
      if(!sel.value) return;
      collectFonts();
      S.fontTabs[ti].fonts.push({k: sel.value, l: labelInp.value.trim() || sel.value});
      renderFonts();
    });
    addRow.append(sel, labelInp, addBtn);
    group.appendChild(addRow);

    container.appendChild(group);
  });

  // Add category button
  const addTabBtn = document.createElement('button');
  addTabBtn.className = 'btn-add';
  addTabBtn.style.marginTop = '8px';
  addTabBtn.textContent = '+ Nueva categoría';
  addTabBtn.addEventListener('click', () => {
    collectFonts();
    S.fontTabs.push({label: 'Nueva', fonts: []});
    renderFonts();
  });
  container.appendChild(addTabBtn);

}

let fontListenersAttached = false;
function initFontListeners(){
  if(fontListenersAttached) return;
  fontListenersAttached = true;
  const container = document.getElementById('fontTabsAdmin');
  container.addEventListener('input', e => {
    const tabLbl = e.target.closest('.tab-label-input');
    if(tabLbl){
      const ti2 = parseInt(tabLbl.closest('.font-tab-group').dataset.ti);
      S.fontTabs[ti2].label = tabLbl.value;
    }
    const fontLbl = e.target.closest('.font-label-input');
    if(fontLbl){
      const ti2 = parseInt(fontLbl.dataset.ti);
      const fi2 = parseInt(fontLbl.dataset.fi);
      S.fontTabs[ti2].fonts[fi2].l = fontLbl.value;
      fontLbl.closest('.font-item').querySelector('.font-preview').textContent = fontLbl.value || S.fontTabs[ti2].fonts[fi2].k;
    }
  });
  container.addEventListener('click', e => {
    const delFont = e.target.closest('[data-del-font]');
    if(delFont){
      collectFonts();
      const [ti2, fi2] = delFont.dataset.delFont.split('-').map(Number);
      if(S.fontTabs[ti2].fonts.length <= 1){ showToast('Cada categoría necesita al menos 1 fuente.'); return; }
      S.fontTabs[ti2].fonts.splice(fi2, 1);
      renderFonts();
    }
    const delTab = e.target.closest('[data-del-tab]');
    if(delTab){
      collectFonts();
      const ti2 = parseInt(delTab.dataset.delTab);
      if(confirm(`¿Eliminar la categoría "${S.fontTabs[ti2].label}"?`)){
        S.fontTabs.splice(ti2, 1);
        renderFonts();
      }
    }
  });
}

function collectFonts(){
  document.querySelectorAll('.font-tab-group').forEach(group => {
    const ti = parseInt(group.dataset.ti);
    if(!S.fontTabs[ti]) return;
    const lblEl = group.querySelector('.tab-label-input');
    if(lblEl) S.fontTabs[ti].label = lblEl.value;
    group.querySelectorAll('.font-label-input').forEach(inp => {
      const fi = parseInt(inp.dataset.fi);
      if(S.fontTabs[ti].fonts[fi]) S.fontTabs[ti].fonts[fi].l = inp.value || S.fontTabs[ti].fonts[fi].k;
    });
  });
}

// ── WALLS ────────────────────────────────────────────────────────
function renderWalls(){
  const list = document.getElementById('wallsList');
  list.innerHTML = '';
  S.walls.forEach((wall, i) => {
    const item = document.createElement('div');
    item.className = 'wall-item';
    item.dataset.wi = i;

    const thumbSrc = wall.thumb || wall.url;
    const thumbHtml = thumbSrc
      ? `<img class="wall-thumb-img" src="${escHtml(thumbSrc)}" alt=""
           onerror="this.outerHTML='<div class=wall-thumb-empty>Sin imagen</div>'">`
      : `<div class="wall-thumb-empty">Sin imagen</div>`;

    item.innerHTML = `
      <div class="wall-thumb-wrap">
        ${thumbHtml}
        <div class="wall-overlay-badge">${Math.round(wall.overlay*100)}% oscuridad</div>
      </div>
      <div class="wall-body">
        <div class="wall-input-row">
          <div class="wall-input-label">Imagen principal</div>
          <input type="text" value="${escHtml(wall.url)}" placeholder="URL imagen (1400px)" data-field="url" data-wi="${i}">
        </div>
        <div class="wall-input-row">
          <div class="wall-input-label">Miniatura (opcional)</div>
          <input type="text" value="${escHtml(wall.thumb||'')}" placeholder="URL miniatura (400px)" data-field="thumb" data-wi="${i}">
        </div>
        <div class="wall-input-row">
          <div class="wall-input-label">Nombre</div>
          <input type="text" value="${escHtml(wall.label)}" placeholder="Nombre del ambiente" data-field="label" data-wi="${i}">
        </div>
        <div class="wall-overlay-row">
          <label>Oscuridad</label>
          <input type="range" min="0" max="0.7" step="0.01" value="${wall.overlay}" data-field="overlay" data-wi="${i}">
          <span class="wall-overlay-val">${Math.round(wall.overlay*100)}%</span>
        </div>
      </div>
      <div class="wall-footer">
        <button class="btn-del" data-del-wall="${i}" title="Eliminar imagen">✕ Eliminar</button>
      </div>`;
    list.appendChild(item);
  });
}

function collectWalls(){
  document.querySelectorAll('#wallsList .wall-item').forEach(item => {
    const wi = parseInt(item.dataset.wi);
    if(isNaN(wi) || !S.walls[wi]) return;
    item.querySelectorAll('[data-field]').forEach(inp => {
      const f = inp.dataset.field;
      S.walls[wi][f] = f === 'overlay' ? parseFloat(inp.value) : inp.value.trim();
    });
  });
}

function initAddWall(){
  document.getElementById('btnAddWall').addEventListener('click', () => {
    collectWalls();
    S.walls.push({url:'', thumb:'', label:'Nueva imagen', overlay:0.28});
    renderWalls();
    document.getElementById('wallsList').lastElementChild?.scrollIntoView({behavior:'smooth', block:'nearest'});
  });
  const list = document.getElementById('wallsList');
  list.addEventListener('input', e => {
    const inp = e.target;
    const wi = parseInt(inp.dataset.wi);
    if(isNaN(wi)) return;
    const field = inp.dataset.field;
    if(field === 'overlay'){
      S.walls[wi].overlay = parseFloat(inp.value);
      inp.closest('.wall-overlay-row').querySelector('.wall-overlay-val').textContent = Math.round(inp.value*100)+'%';
      inp.closest('.wall-item').querySelector('.wall-overlay-badge').textContent = Math.round(inp.value*100)+'% oscuridad';
    } else if(field){
      S.walls[wi][field] = inp.value.trim();
      if(field === 'thumb' || field === 'url'){
        const item = inp.closest('.wall-item');
        const thumbWrap = item.querySelector('.wall-thumb-wrap');
        const src = S.walls[wi].thumb || S.walls[wi].url;
        const img = thumbWrap.querySelector('.wall-thumb-img');
        if(img && src){ img.src = src; }
        else if(src && !img){
          thumbWrap.querySelector('.wall-thumb-empty')?.remove();
          const newImg = document.createElement('img');
          newImg.className = 'wall-thumb-img';
          newImg.src = src;
          newImg.alt = '';
          newImg.onerror = function(){ this.outerHTML='<div class="wall-thumb-empty">Sin imagen</div>'; };
          thumbWrap.insertBefore(newImg, thumbWrap.firstChild);
        }
      }
    }
  });
  list.addEventListener('click', e => {
    const del = e.target.closest('[data-del-wall]');
    if(!del) return;
    const wi = parseInt(del.dataset.delWall);
    if(S.walls.length <= 1){ showToast('Debe haber al menos una imagen.'); return; }
    S.walls.splice(wi, 1);
    renderWalls();
  });
}

// ── PRICES ───────────────────────────────────────────────────────
function renderPrices(){
  const tbody = document.getElementById('pricesList');
  tbody.innerHTML = '';
  S.prices.forEach((tier, i) => {
    const tr = document.createElement('tr');
    tr.dataset.pi = i;
    tr.innerHTML = `
      <td><input type="text"   class="price-label"   value="${escHtml(tier.label)}"   placeholder="ej. 30×30 cm"></td>
      <td><input type="number" class="price-area"    value="${tier.maxArea}"   min="1" step="1"></td>
      <td><input type="number" class="price-val"     value="${tier.price}"     min="0" step="1"><span style="margin-left:4px;font-size:.75rem;color:#8a8680">MXN</span></td>
      <td><button class="btn-del" data-del-price="${i}" title="Eliminar nivel">✕</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('controllerPriceInput').value = S.controllerPrice;
}

function collectPrices(){
  const rows = document.querySelectorAll('#pricesList tr');
  S.prices = Array.from(rows).map(tr => ({
    label:   tr.querySelector('.price-label').value || '—',
    maxArea: parseInt(tr.querySelector('.price-area').value) || 0,
    price:   parseInt(tr.querySelector('.price-val').value)  || 0,
  }));
  S.prices.sort((a,b) => a.maxArea - b.maxArea);
  S.controllerPrice = parseInt(document.getElementById('controllerPriceInput').value) || 0;
}

function initAddPrice(){
  document.getElementById('btnAddPrice').addEventListener('click', () => {
    collectPrices();
    const last = S.prices[S.prices.length - 1];
    S.prices.push({
      label:   'Nuevo nivel',
      maxArea: last ? last.maxArea + 900 : 900,
      price:   last ? last.price + 500 : 1000,
    });
    renderPrices();
    document.getElementById('pricesList').lastElementChild?.scrollIntoView({behavior:'smooth', block:'nearest'});
  });
  // Delete row — attached once here, not inside renderPrices
  document.getElementById('pricesList').addEventListener('click', e => {
    const del = e.target.closest('[data-del-price]');
    if(!del) return;
    collectPrices();
    const i = parseInt(del.dataset.delPrice);
    if(S.prices.length <= 1){ showToast('Debe haber al menos un nivel de precio.'); return; }
    S.prices.splice(i, 1);
    renderPrices();
  });
}

// ── Render all sections ──────────────────────────────────────────
function renderAll(){
  renderTheme();
  renderColors();
  renderFonts();
  renderWalls();
  renderPrices();
}

// ── Utility ──────────────────────────────────────────────────────
function escHtml(str){
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Boot ─────────────────────────────────────────────────────────
try {
  initNav();
  initPanel();
} catch(err) {
  console.error('Admin boot error:', err);
  alert('Error al cargar el panel: ' + err.message);
}
