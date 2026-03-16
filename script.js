const S = {
  text:'Aqui tu texto', font:'Pacifico', color:'#b3f0ff',
  scale:1, posX:0, posY:0, rotation:0, tiltY:0, bgX:50, bgY:50,
  mount:'libre',
  backing:false, rgb:false, power:true,
  charOverrides:{},
};

const neonEl        = document.getElementById('neonText');
const posWrapper    = document.getElementById('posWrapper');
const signWrapper   = document.getElementById('signWrapper');
const signContent   = document.getElementById('signContent');
const charMenu      = document.getElementById('charMenu');
const previewCanvas = document.getElementById('previewCanvas');
const overlay       = document.getElementById('canvasOverlay');
const mountPlate    = document.getElementById('mountPlate');
const mountHook     = document.getElementById('mountHook');
const mountBase     = document.getElementById('mountBase');
const mountScrews   = document.getElementById('mountScrews');
const rainCvs       = document.getElementById('rainCanvas');
const rainCtx       = rainCvs.getContext('2d');
const acrylicCvs    = document.getElementById('acrylicCanvas');
const acrylicCtx    = acrylicCvs.getContext('2d');

function calcBaseFontSize(){
  const cw=previewCanvas.offsetWidth||800, ch=previewCanvas.offsetHeight||400;
  const lines=(S.text||'A').split('\n'), maxLen=Math.max(...lines.map(l=>l.length),1);
  const fsFromW=(cw*.78)/(maxLen*.58), fsFromH=(ch*.65)/(lines.length*1.2);
  return Math.max(14,Math.min(fsFromW,fsFromH));
}
let baseFontSize=72;
let previewActive=false; // declared early so recalcFontSize guard works
function recalcFontSize(){ if(previewActive) return; baseFontSize=calcBaseFontSize(); renderNeon(); }
function getCurrentFS(){ return baseFontSize * S.scale; }

// ── Brightness state ──
// We use CSS filter:brightness() to dim/brighten without touching opacity.
// This keeps the neon tube visible and just reduces its glow energy.
let brightness = 100; // 100 | 50 | 25
function getBrightnessFilter(){
  if(brightness === 100) return '';
  if(brightness === 50)  return 'brightness(0.42)';
  return 'brightness(0.18)';
}

// ── RGB ──
const RGB_COLORS=['#ff3cac','#00f5ff','#00ff88','#ffee00','#ff8800','#bf00ff','#3b82f6'];
let rgbInt=null, ri=0, currentRGBColor=RGB_COLORS[0];
let speedMs = 700;

function startRGB(){
  clearInterval(rgbInt);
  rgbInt=setInterval(()=>{
    currentRGBColor=RGB_COLORS[ri++%RGB_COLORS.length];
    if(!S.power) return;
    neonEl.style.color=currentRGBColor;
    neonEl.style.textShadow=tubeShadow(currentRGBColor);
    neonEl.style.webkitTextStroke=tubeStroke(currentRGBColor);
    // Re-apply brightness filter but preserve any animation
    const anim = neonEl.style.animationName;
    if(!anim || anim==='none') neonEl.style.filter=getBrightnessFilter();
    if(S.backing) drawAcrylic();
  }, speedMs);
}
function stopRGB(){ clearInterval(rgbInt); rgbInt=null; currentRGBColor=RGB_COLORS[0]; }

// ── Neon shadow helpers ──
function hexToRgb(hex){ return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}; }
function darken(hex,f){ const {r,g,b}=hexToRgb(hex); return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`; }
function rgba(hex,a){ const {r,g,b}=hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

function tubeShadow(c){
  const d1=darken(c,.75),d2=darken(c,.55),d3=darken(c,.38),d4=darken(c,.22);
  return [
    `1px 1px 0 ${d1}`,`2px 2px 0 ${d2}`,`3px 3px 0 ${d3}`,`4px 4px 0 ${d4}`,
    `5px 5px 0 rgba(255,255,255,0.85)`,`6px 6px 1px rgba(0,0,0,0.3)`,
    `0 0 3px ${c}`,`0 0 8px ${c}`,`0 0 18px ${rgba(c,.7)}`
  ].join(',');
}
function tubeStroke(c){ return `1px ${darken(c,.6)}`; }

// Letrero apagado: tubo de vidrio sin gas ionizado.
// Color oscuro cálido (el fósforo del tubo en reposo), con mínimo brillo interno.
function tubeOffStyle(){
  return {
    color: '#1c0f0a',
    textShadow: [
      '0 0 3px rgba(80,30,10,.5)',
      '0 0 8px rgba(50,15,5,.25)',
      '1px 1px 0 rgba(30,10,5,.7)',
      '2px 2px 0 rgba(15,5,2,.5)',
    ].join(','),
    webkitTextStroke: '1px rgba(90,40,15,.35)',
    filter: '',
  };
}

// ── Acrylic ──────────────────────────────────────────────────────
let acrylicRaf = null;
function drawAcrylic(){
  if(!S.backing){ acrylicCvs.style.opacity='0'; return; }
  cancelAnimationFrame(acrylicRaf);
  acrylicRaf = requestAnimationFrame(()=> requestAnimationFrame(()=> _renderAcrylic()));
}

function _dilate(src,w,h,r){
  const tmp=new Uint8Array(w*h),dst=new Uint8Array(w*h);
  for(let y=0;y<h;y++){const b=y*w;for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);let v=0;for(let k=x0;k<=x1;k++)if(src[b+k]){v=255;break;}tmp[b+x]=v;}}
  for(let x=0;x<w;x++){for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);let v=0;for(let k=y0;k<=y1;k++)if(tmp[k*w+x]){v=255;break;}dst[y*w+x]=v;}}
  return dst;
}
function _erode(src,w,h,r){
  const tmp=new Uint8Array(w*h),dst=new Uint8Array(w*h);
  for(let y=0;y<h;y++){const b=y*w;for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);let v=255;for(let k=x0;k<=x1;k++)if(!src[b+k]){v=0;break;}tmp[b+x]=v;}}
  for(let x=0;x<w;x++){for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);let v=255;for(let k=y0;k<=y1;k++)if(!tmp[k*w+x]){v=0;break;}dst[y*w+x]=v;}}
  return dst;
}

function _renderAcrylic(){
  if(!S.backing){ acrylicCvs.style.opacity='0'; return; }
  const MARGIN=16,MERGE_RADIUS=80,SMOOTH=10,PAD=MERGE_RADIUS+SMOOTH+50;
  const nW=neonEl.offsetWidth,nH=neonEl.offsetHeight,nL=neonEl.offsetLeft,nT=neonEl.offsetTop;
  const w=nW+PAD*2,h=nH+PAD*2;
  if(w<4||h<4)return;
  acrylicCvs.width=w;acrylicCvs.height=h;
  acrylicCvs.style.position='absolute';acrylicCvs.style.left=(nL-PAD)+'px';acrylicCvs.style.top=(nT-PAD)+'px';
  acrylicCvs.style.pointerEvents='none';acrylicCvs.style.zIndex='2';acrylicCvs.style.opacity='1';acrylicCvs.style.filter='none';
  const off=document.createElement('canvas');off.width=w;off.height=h;
  const offCtx=off.getContext('2d');offCtx.fillStyle='#fff';
  const fs=getCurrentFS();
  const spans=neonEl.querySelectorAll('.nchar');
  spans.forEach(sp=>{
    const idx=parseInt(sp.dataset.idx);const ov=S.charOverrides[idx]||{};const ch=sp.textContent==='\u00A0'?' ':sp.textContent;
    offCtx.font=`${fs}px '${ov.font||S.font}', cursive`;offCtx.textBaseline='alphabetic';
    const m=offCtx.measureText(ch);const asc=m.fontBoundingBoxAscent!==undefined?m.fontBoundingBoxAscent:m.actualBoundingBoxAscent;
    offCtx.fillText(ch,sp.offsetLeft+PAD,sp.offsetTop+PAD+asc);
  });
  const raw=offCtx.getImageData(0,0,w,h);const mask=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++)mask[i]=raw.data[i*4+3]>20?255:0;
  const outerLarge=_dilate(mask,w,h,MERGE_RADIUS);const outerRaw=_erode(outerLarge,w,h,MERGE_RADIUS-MARGIN);
  const outer=_erode(_dilate(outerRaw,w,h,SMOOTH),w,h,SMOOTH);const inner=_dilate(mask,w,h,1);
  const ctx=acrylicCtx;ctx.clearRect(0,0,w,h);
  const ang=160*Math.PI/180,cosA=Math.cos(ang),sinA=Math.sin(ang);
  const out=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++){for(let x=0;x<w;x++){
    const i=y*w+x;if(!outer[i]||inner[i])continue;
    const onEdge=(x===0||!outer[i-1])||(x===w-1||!outer[i+1])||(y===0||!outer[i-w])||(y===h-1||!outer[i+w]);
    const onTop=(y===0||!outer[(y-1)*w+x]);
    const cx=x-w/2,cy=y-h/2;const proj=(cx*cosA+cy*sinA)/(Math.sqrt(w*w+h*h)/2);const t=(proj+1)/2;
    let br,bg,bb,ba;
    if(t<.5){const s=t/.5;br=Math.round(215+(175-215)*s);bg=Math.round(225+(192-225)*s);bb=Math.round(242+(218-242)*s);ba=0.28+(0.22-0.28)*s;}
    else{const s=(t-.5)/.5;br=Math.round(175+(195-175)*s);bg=Math.round(192+(212-192)*s);bb=Math.round(218+(232-218)*s);ba=0.22+(0.26-0.22)*s;}
    const dx=x-w*.45,dy=y-h*.38;const dist=Math.sqrt(dx*dx+dy*dy)/(Math.max(w,h)*.55);
    const radA=Math.max(0,.18*(1-Math.min(dist,1)));const ra=Math.min(1,ba+radA);
    let rr=Math.round(br+(240-br)*radA),rg=Math.round(bg+(248-bg)*radA),rb=Math.round(bb+(255-bb)*radA);
    if(onEdge||onTop){rr=255;rg=255;rb=255;}
    const pi=i*4;out[pi]=rr;out[pi+1]=rg;out[pi+2]=rb;out[pi+3]=onEdge||onTop?175:Math.round(ra*255);
  }}
  ctx.putImageData(new ImageData(out,w,h),0,0);
  acrylicCvs.style.filter='drop-shadow(0px 4px 28px rgba(0,0,0,0.55))';
}

// ── Build neon spans ──
function buildNeonSpans(){
  neonEl.innerHTML='';
  const chars=S.text||' ';
  for(let i=0;i<chars.length;i++){
    const ch=chars[i];
    if(ch==='\n'){const br=document.createElement('span');br.className='nchar-nl';neonEl.appendChild(br);continue;}
    const sp=document.createElement('span');sp.className='nchar';sp.dataset.idx=i;
    sp.textContent=ch===' '?'\u00A0':ch;
    const ov=S.charOverrides[i];
    if(ov){
      if(ov.font)sp.style.fontFamily=`'${ov.font}',cursive`;
      if(ov.color&&S.power){sp.style.color=ov.color;sp.style.textShadow=tubeShadow(ov.color);sp.style.webkitTextStroke=tubeStroke(ov.color);}
      else if(ov.color&&!S.power){const off=tubeOffStyle();sp.style.color=off.color;sp.style.textShadow=off.textShadow;}
    }
    if(i===activeCharIdx)sp.classList.add('selected');
    neonEl.appendChild(sp);
  }
  if(activeCharIdx!==null&&charMenu.classList.contains('visible')){
    const freshSpan=neonEl.querySelector(`.nchar[data-idx="${activeCharIdx}"]`);
    if(freshSpan)_repositionMenu(freshSpan);
  }
}

function _repositionMenu(spanEl){
  const cRect=previewCanvas.getBoundingClientRect();
  const sRect=spanEl.getBoundingClientRect();
  const cx=sRect.left+sRect.width/2-cRect.left;
  const ty=sRect.top-cRect.top-10;
  charMenu.style.left=cx+'px';charMenu.style.top=ty+'px';charMenu.style.transform='translateX(-50%) translateY(-100%)';
}

// ── Core render ──
function renderNeon(){
  const fs=getCurrentFS();
  neonEl.style.fontFamily=`'${S.font}', cursive`;
  neonEl.style.fontSize=fs+'px';
  posWrapper.style.transform=`translate(calc(-50% + ${S.posX}px), calc(-50% + ${S.posY}px))`;
  signWrapper.style.transform=`rotate(${S.rotation}deg)`;
  signContent.style.transform=`rotateY(${S.tiltY}deg)`;
  signContent.style.position='relative';

  if(!S.power){
    const off=tubeOffStyle();
    neonEl.style.color=off.color;
    neonEl.style.textShadow=off.textShadow;
    neonEl.style.webkitTextStroke=off.webkitTextStroke;
    neonEl.style.filter='';
    neonEl.style.animation='none';
    buildNeonSpans();
    applyMount();
    return;
  }

  // Power ON
  const c=(S.rgb&&rgbInt)?currentRGBColor:S.color;
  neonEl.style.color=c;
  neonEl.style.textShadow=tubeShadow(c);
  neonEl.style.webkitTextStroke=tubeStroke(c);

  // Apply brightness filter only if no animation is running
  // (animations handle their own filter via CSS keyframes)
  const currentAnim = neonEl.style.animationName;
  if(!currentAnim || currentAnim==='none'){
    neonEl.style.filter=getBrightnessFilter();
  }

  buildNeonSpans();
  applyMount();
  if(S.backing) drawAcrylic();
  // Defer quote update after layout settles
  requestAnimationFrame(updateDimBadge);
}

// ── Pricing ──────────────────────────────────────────────────────
// The canvas represents a real-world wall space of ~200cm wide.
// We use this to derive centimetre dimensions from pixel dimensions.
// Price tiers are based on area (cm²) matching the official price table.
let PRICE_TIERS = [
  { maxArea: 900,  label: '30×30 cm',  price: 1000 },
  { maxArea: 1600, label: '40×40 cm',  price: 1400 },
  { maxArea: 2500, label: '50×50 cm',  price: 1600 },
  { maxArea: 3600, label: '60×60 cm',  price: 1800 },
  { maxArea: 4900, label: '70×70 cm',  price: 2100 },
];
let CONTROLLER_PRICE = 150;
const CANVAS_REAL_WIDTH_CM = 140; // canvas width = 140 cm wall reference
let canonicalCanvasW = 0; // set on init, never updated during preview mode

// ── Admin-configurable data ───────────────────────────────────────
const ADMIN_STORAGE_KEY = 'ilumia_admin_settings';

let WALLS_LIST = [
  {url:'https://images.unsplash.com/photo-1770816306935-d0a08e93d823?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770816306935-d0a08e93d823?w=400&q=80&fit=crop',  label:'Local 1',     overlay:.25},
  {url:'https://plus.unsplash.com/premium_photo-1728155006673-887f27d7694f?w=1400&q=85', thumb:'https://plus.unsplash.com/premium_photo-1728155006673-887f27d7694f?w=400&q=80&fit=crop', label:'Local 2',     overlay:.30},
  {url:'https://images.unsplash.com/photo-1769501203673-159257ecb72d?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1769501203673-159257ecb72d?w=400&q=80&fit=crop',  label:'Local 3',     overlay:.28},
  {url:'https://images.unsplash.com/photo-1770646403987-64cf5c08c870?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770646403987-64cf5c08c870?w=400&q=80&fit=crop',  label:'Local 4',     overlay:.32},
  {url:'https://images.unsplash.com/photo-1770319675686-ae3b11647bcd?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1770319675686-ae3b11647bcd?w=400&q=80&fit=crop',  label:'Local 5',     overlay:.28},
  {url:'https://plus.unsplash.com/premium_photo-1683121299733-06eed1e7df79?w=1400&q=85', thumb:'https://plus.unsplash.com/premium_photo-1683121299733-06eed1e7df79?w=400&q=80&fit=crop', label:'Local 6',     overlay:.35},
  {url:'https://images.unsplash.com/photo-1526887593587-a307ea5d46b4?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1526887593587-a307ea5d46b4?w=400&q=80&fit=crop',  label:'Local 7',     overlay:.30},
  {url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85',  thumb:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&fit=crop',  label:'Hotel Lobby', overlay:.28},
];

let FONT_TABS = [
  {label:'Script', fonts:[
    {k:'Pacifico',l:'Pacifico'},{k:'Allura',l:'Balsamic'},{k:'Mea Culpa',l:'Dreaming'},
    {k:'Parisienne',l:'Grechen'},{k:'Italianno',l:'Intro Scri'},{k:'Mr De Haviland',l:'Barbra'},
    {k:'Alex Brush',l:'Chloe'},{k:'Satisfy',l:'Satisfy'},{k:'Redressed',l:'Redressed'},{k:'Crafty Girls',l:'Crafty G'},
  ]},
  {label:'Manuscrita', fonts:[
    {k:'Shantell Sans',l:'Shantell'},{k:'Boogaloo',l:'TT Backwa'},{k:'Permanent Marker',l:'Stinger'},
    {k:'Baloo 2',l:'Bingoo'},{k:'Fredoka One',l:'Mak'},
  ]},
  {label:'Bold', fonts:[
    {k:'Limelight',l:'Howell'},{k:'Titan One',l:'TT Polls'},{k:'Yeseva One',l:'Romman'},
    {k:'Russo One',l:'Yodnam'},{k:'Rye',l:'Lucky Bones'},
  ]},
  {label:'Elegante', fonts:[
    {k:'Cinzel Decorative',l:'Sk Moralist'},{k:'Medula One',l:'Medula'},{k:'Poiret One',l:'Nove'},
    {k:'IM Fell English',l:'Jayagiri'},{k:'Quicksand',l:'Art Nuvo'},
  ]},
];

function applyAdminTheme(theme){
  const root = document.documentElement;
  Object.entries(theme).forEach(([k,v]) => root.style.setProperty(k,v));
}

function loadAdminSettings(){
  try{
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if(!raw) return;
    const s = JSON.parse(raw);
    if(s.theme)                        applyAdminTheme(s.theme);
    if(s.colors  && s.colors.length)   COLORS_LIST       = s.colors;
    if(s.fontTabs && s.fontTabs.length) FONT_TABS         = s.fontTabs;
    if(s.walls   && s.walls.length)    WALLS_LIST        = s.walls;
    if(s.prices  && s.prices.length)   PRICE_TIERS       = s.prices;
    if(typeof s.controllerPrice === 'number') CONTROLLER_PRICE = s.controllerPrice;
  }catch(e){ console.warn('Admin settings error:', e); }
}

function buildColorGrid(){
  const grid = document.getElementById('colorGrid');
  if(!grid) return;
  grid.innerHTML = '';
  COLORS_LIST.forEach((col,i) => {
    const sw = document.createElement('div');
    sw.className = 'cswatch'+(i===0?' on':'');
    sw.style.background = col.c;
    sw.dataset.c = col.c;
    sw.dataset.n = col.n;
    grid.appendChild(sw);
  });
  if(COLORS_LIST.length){
    S.color = COLORS_LIST[0].c;
    const lbl = document.getElementById('colorLabel');
    if(lbl) lbl.textContent = COLORS_LIST[0].n;
  }
  // Rebuild char menu color swatches
  const sub = document.getElementById('cmenuColorSub');
  if(sub){
    sub.innerHTML = '';
    COLORS_LIST.forEach(col=>{
      const sw=document.createElement('div');sw.className='cmenu-csw';
      sw.style.background=col.c;sw.title=col.n;sw.dataset.color=col.c;
      sub.appendChild(sw);
    });
  }
}

function buildWallGrid(){
  const grid = document.getElementById('wallGrid');
  if(!grid) return;
  grid.innerHTML = '';
  WALLS_LIST.forEach((wall,i) => {
    const btn = document.createElement('div');
    btn.className = 'wbtn'+(i===0?' on':'');
    btn.style.backgroundImage = `url('${wall.thumb||wall.url}')`;
    btn.dataset.url = wall.url;
    btn.dataset.ov  = wall.overlay;
    const span = document.createElement('span');
    span.textContent = wall.label;
    btn.appendChild(span);
    grid.appendChild(btn);
  });
  if(WALLS_LIST.length){
    const first = WALLS_LIST[0];
    previewCanvas.style.backgroundImage = `url('${first.url}')`;
    overlay.style.background = `rgba(0,0,0,${first.overlay})`;
  }
}

function buildFontTrack(){
  const track  = document.getElementById('fontTrack');
  const tabBar = document.getElementById('fontTabBar');
  if(!track||!tabBar) return;
  track.innerHTML  = '';
  tabBar.innerHTML = '';
  FONT_TABS.forEach((tab,ti) => {
    const btn = document.createElement('button');
    btn.className = 'ftab'+(ti===0?' on':'');
    btn.dataset.fi = ti;
    btn.textContent = tab.label;
    tabBar.appendChild(btn);
    const panel = document.createElement('div');
    panel.className = 'font-panel';
    const fg = document.createElement('div');
    fg.className = 'font-grid';
    tab.fonts.forEach(font => {
      const fbtn = document.createElement('div');
      fbtn.className = 'fbtn'+(font.k===S.font?' on':'');
      fbtn.dataset.font = font.k;
      fbtn.style.fontFamily = `'${font.k}',cursive`;
      fbtn.textContent = font.l||font.k;
      fg.appendChild(fbtn);
    });
    panel.appendChild(fg);
    track.appendChild(panel);
  });
  // Sync FONTS_LIST (used by char editor carousel) from FONT_TABS
  FONTS_LIST = FONT_TABS.flatMap(tab => tab.fonts.map(f=>({k:f.k,l:f.l||f.k})));
}

let lastQuoteTier = -1; // track tier changes for animation

function calcDimensions(){
  const canvasW = canonicalCanvasW || previewCanvas.offsetWidth || 800;
  const pxW = neonEl.offsetWidth;
  const pxH = neonEl.offsetHeight;
  // In preview mode baseFontSize is scaled by ratioW, so neonEl.offsetWidth
  // is also scaled by ratioW. We need to reverse that to get real-world cm.
  const effectiveW = previewActive && previewSnapshot
    ? pxW * (previewSnapshot.baseFontSize / baseFontSize)
    : pxW;
  const effectiveH = previewActive && previewSnapshot
    ? pxH * (previewSnapshot.baseFontSize / baseFontSize)
    : pxH;
  const cmPerPx = CANVAS_REAL_WIDTH_CM / canvasW;
  const cmW = Math.max(5, Math.round(effectiveW * cmPerPx));
  const cmH = Math.max(2, Math.round(effectiveH * cmPerPx));
  return { cmW, cmH, area: cmW * cmH };
}

function getQuote(area) {
  for(let i = 0; i < PRICE_TIERS.length; i++){
    if(area <= PRICE_TIERS[i].maxArea) return { tier: i, ...PRICE_TIERS[i] };
  }
  // Larger than 70×70 — custom quote
  return { tier: 5, maxArea: Infinity, label: '+70×70 cm', price: null };
}

function updateDimBadge(){
  requestAnimationFrame(()=>{
    const { cmW, cmH, area } = calcDimensions();
    const quote = getQuote(area);
    const hasController = document.getElementById('tController').checked;
    const controllerCost = hasController ? CONTROLLER_PRICE : 0;

    const panel = document.getElementById('quotePanel');
    if(!panel) return;

    const tierChanged = quote.tier !== lastQuoteTier;
    lastQuoteTier = quote.tier;

    // Dimensions + area row
    document.getElementById('qDims').textContent = `${cmW} × ${cmH} cm`;
    document.getElementById('qArea').textContent = `${area.toLocaleString()} cm²`;

    // Tier badge
    const tierEl = document.getElementById('qTier');
    tierEl.textContent = quote.label;
    // Color tier badge by size
    const tierColors = ['#22c55e','#84cc16','#eab308','#f97316','#ef4444','#a855f7'];
    tierEl.style.background = tierColors[Math.min(quote.tier, 5)] + '22';
    tierEl.style.color = tierColors[Math.min(quote.tier, 5)];
    tierEl.style.borderColor = tierColors[Math.min(quote.tier, 5)] + '55';

    // Price rows
    const signRow = document.getElementById('qSignPrice');
    const ctrlRow = document.getElementById('qCtrlRow');
    const totalEl = document.getElementById('qTotal');
    const totalLabelEl = document.getElementById('qTotalLabel');

    if(quote.price === null){
      signRow.textContent = 'Cotización especial';
      ctrlRow.style.display = 'none';
      totalEl.textContent = '—';
      totalLabelEl.textContent = 'Consultar precio';
    } else {
      signRow.textContent = `$${quote.price.toLocaleString()}`;
      ctrlRow.style.display = hasController ? 'flex' : 'none';
      document.getElementById('qCtrlPrice').textContent = `+$${CONTROLLER_PRICE}`;
      const total = quote.price + controllerCost;
      totalEl.textContent = `$${total.toLocaleString()}`;
      totalLabelEl.textContent = 'Total estimado';
    }

    // Animate on tier change
    if(tierChanged){
      panel.classList.remove('quote-bump');
      void panel.offsetWidth;
      panel.classList.add('quote-bump');
    }
  });
}

function resetPosition(){ S.posX=0;S.posY=0;S.scale=1;S.rotation=0;S.tiltY=0;renderNeon();updateDimBadge(); }

// ── Mount ──
function applyMount(){
  mountPlate.style.cssText='';mountPlate.style.opacity='0';
  mountHook.style.display='none';mountBase.style.display='none';mountScrews.style.display='none';
  const plateStyle='position:absolute;z-index:0;pointer-events:none;background:linear-gradient(160deg,rgba(220,230,245,.22) 0%,rgba(180,195,220,.15) 50%,rgba(200,215,235,.20) 100%);opacity:1;box-shadow:0 4px 28px rgba(0,0,0,.55),inset 0 0 0 1.5px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.4);';
  const applyRect=(padX,padY,extra='')=>{
    requestAnimationFrame(()=>{
      const nL=neonEl.offsetLeft,nT=neonEl.offsetTop,nW=neonEl.offsetWidth,nH=neonEl.offsetHeight;
      mountPlate.style.cssText=plateStyle+`left:${nL-padX}px;top:${nT-padY}px;width:${nW+padX*2}px;height:${nH+padY*2}px;${extra}`;
    });
  };
  if(S.mount==='acrilico-cuadrado'){applyRect(22,18,'border-radius:10px;');acrylicCvs.style.opacity='0';S.backing=false;return;}
  if(S.mount==='backing'){S.backing=true;drawAcrylic();return;}
  S.backing=false;acrylicCvs.style.opacity='0';
}

// ── Char editor ──
// Populated at init by buildFontTrack() / loadAdminSettings()
let FONTS_LIST=[];
let COLORS_LIST=[
  {c:'#b3f0ff',n:'Azul Hielo'},{c:'#ff2222',n:'Roja'},{c:'#ffb300',n:'Amber'},
  {c:'#e8ff00',n:'Amarillo Limón'},{c:'#bf00ff',n:'Morado'},{c:'#00ff88',n:'Verde'},
  {c:'#ffe8c0',n:'Blanco Cálido'},{c:'#3b82f6',n:'Azul'},{c:'#ff3cac',n:'Rosa'},
  {c:'#ffd700',n:'Amarillo Dorado'},{c:'#ff8800',n:'Naranja'},{c:'#e8f4ff',n:'Blanca Fría'},
];
charMenu.addEventListener('pointerdown',e=>e.stopPropagation());
const cmenuFontName=document.getElementById('cmenuFontName');
const cmenuColorBtn=document.getElementById('cmenuColorBtn');
const cmenuColorSub=document.getElementById('cmenuColorSub');
let activeCharIdx=null,cmenuFontIdx=0;
function openCharMenu(spanEl){
  const idx=parseInt(spanEl.dataset.idx);activeCharIdx=idx;
  neonEl.querySelectorAll('.nchar.selected').forEach(s=>s.classList.remove('selected'));spanEl.classList.add('selected');
  const ov=S.charOverrides[idx]||{},curFont=ov.font||S.font,curColor=ov.color||S.color;
  cmenuFontIdx=FONTS_LIST.findIndex(f=>f.k===curFont);if(cmenuFontIdx<0)cmenuFontIdx=0;
  updateFontCarousel();cmenuColorBtn.style.background=curColor;
  cmenuColorSub.querySelectorAll('.cmenu-csw').forEach(s=>s.classList.toggle('on',s.dataset.color===curColor));
  cmenuColorSub.classList.remove('open');_repositionMenu(spanEl);charMenu.classList.add('visible');
}
function closeCharMenu(){
  charMenu.classList.remove('visible');cmenuColorSub.classList.remove('open');
  neonEl.querySelectorAll('.nchar.selected').forEach(s=>s.classList.remove('selected'));activeCharIdx=null;
}
function updateFontCarousel(){const f=FONTS_LIST[cmenuFontIdx];cmenuFontName.textContent=f.l;cmenuFontName.style.fontFamily=`'${f.k}',cursive`;}
function applyCarouselFont(){
  if(activeCharIdx===null)return;
  if(!S.charOverrides[activeCharIdx])S.charOverrides[activeCharIdx]={};
  S.charOverrides[activeCharIdx].font=FONTS_LIST[cmenuFontIdx].k;renderNeon();
}
document.getElementById('cmenuPrev').addEventListener('click',e=>{e.stopPropagation();cmenuFontIdx=(cmenuFontIdx-1+FONTS_LIST.length)%FONTS_LIST.length;updateFontCarousel();applyCarouselFont();});
document.getElementById('cmenuNext').addEventListener('click',e=>{e.stopPropagation();cmenuFontIdx=(cmenuFontIdx+1)%FONTS_LIST.length;updateFontCarousel();applyCarouselFont();});
cmenuColorBtn.addEventListener('click',e=>{e.stopPropagation();cmenuColorSub.classList.toggle('open');});
cmenuColorSub.addEventListener('click',e=>{
  const sw=e.target.closest('.cmenu-csw');if(!sw)return;e.stopPropagation();if(activeCharIdx===null)return;
  if(!S.charOverrides[activeCharIdx])S.charOverrides[activeCharIdx]={};
  S.charOverrides[activeCharIdx].color=sw.dataset.color;cmenuColorBtn.style.background=sw.dataset.color;
  cmenuColorSub.querySelectorAll('.cmenu-csw').forEach(s=>s.classList.toggle('on',s===sw));cmenuColorSub.classList.remove('open');renderNeon();
});
document.getElementById('cmenuReset').addEventListener('click',e=>{e.stopPropagation();if(activeCharIdx===null)return;delete S.charOverrides[activeCharIdx];closeCharMenu();renderNeon();});
document.addEventListener('pointerdown',e=>{if(!charMenu.classList.contains('visible'))return;if(charMenu.contains(e.target))return;if(e.target.closest('.nchar'))return;closeCharMenu();});
signWrapper.addEventListener('pointermove',()=>{if(dragging)closeCharMenu();});

// ── Rotate ──
const rotHandle=document.getElementById('rotateHandle'),angleBadge=document.getElementById('angleBadge');
let rotating=false,rotStartAngle=0,rotAtStart=0;
function getAngleFromCenter(x,y){const r=posWrapper.getBoundingClientRect();return Math.atan2(y-(r.top+r.height/2),x-(r.left+r.width/2))*(180/Math.PI);}
rotHandle.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();rotating=true;rotStartAngle=getAngleFromCenter(e.clientX,e.clientY);rotAtStart=S.rotation;rotHandle.setPointerCapture(e.pointerId);rotHandle.classList.add('active');angleBadge.classList.add('visible');});
rotHandle.addEventListener('pointermove',e=>{if(!rotating)return;S.rotation=rotAtStart+getAngleFromCenter(e.clientX,e.clientY)-rotStartAngle;const diff=S.rotation-Math.round(S.rotation/90)*90;if(Math.abs(diff)<4)S.rotation=Math.round(S.rotation/90)*90;renderNeon();angleBadge.textContent=((Math.round(S.rotation)%360)+360)%360+'°';});
rotHandle.addEventListener('pointerup',()=>{rotating=false;rotHandle.classList.remove('active');setTimeout(()=>angleBadge.classList.remove('visible'),800);scheduleHint();});

// ── Hint ──
const sizeHint=document.getElementById('sizeHint');let hintTimer=null,hintShown=false;
function scheduleHint(){clearTimeout(hintTimer);hideHint();hintTimer=setTimeout(showHint,1500);}
function showHint(){if(hintShown)return;hintShown=true;sizeHint.style.opacity='1';hintTimer=setTimeout(hideHint,3000);}
function hideHint(){hintShown=false;sizeHint.style.opacity='0';clearTimeout(hintTimer);}

// ── Tilt ──
const tiltHandleY=document.getElementById('tiltHandleY'),tiltBadge=document.getElementById('tiltBadge');
let tilting=false,tiltStartX=0,tiltAtStart=0,tiltTimer=null;
tiltHandleY.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();tilting=true;tiltStartX=e.clientX;tiltAtStart=S.tiltY;hideHint();tiltHandleY.setPointerCapture(e.pointerId);tiltHandleY.classList.add('active');tiltBadge.classList.add('visible');});
document.addEventListener('pointermove',e=>{if(!tilting)return;let val=tiltAtStart+(e.clientX-tiltStartX)*.4;val=Math.max(-80,Math.min(80,val));if(Math.abs(val)<3)val=0;S.tiltY=val;renderNeon();tiltBadge.textContent=Math.round(val)+'°';});
document.addEventListener('pointerup',()=>{if(!tilting)return;tilting=false;tiltHandleY.classList.remove('active');clearTimeout(tiltTimer);tiltTimer=setTimeout(()=>tiltBadge.classList.remove('visible'),800);scheduleHint();});

// ── Drag letrero ──
let dragging=false,dragStartX=0,dragStartY=0,posAtDragX=0,posAtDragY=0,pointerDownTarget=null,charPointerMoved=false;
signWrapper.addEventListener('pointerdown',e=>{
  if(e.target.closest('#resizeHandle'))return;
  hideHint();pointerDownTarget=e.target;charPointerMoved=false;dragging=true;
  dragStartX=e.clientX;dragStartY=e.clientY;posAtDragX=S.posX;posAtDragY=S.posY;
  signWrapper.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();
});
signWrapper.addEventListener('pointermove',e=>{
  if(!dragging)return;const dx=e.clientX-dragStartX,dy=e.clientY-dragStartY;
  if(Math.abs(dx)>4||Math.abs(dy)>4)charPointerMoved=true;S.posX=posAtDragX+dx;S.posY=posAtDragY+dy;renderNeon();
});
signWrapper.addEventListener('pointerup',e=>{
  dragging=false;
  if(!charPointerMoved){const sp=pointerDownTarget&&pointerDownTarget.closest('.nchar');if(sp)openCharMenu(sp);}
  pointerDownTarget=null;scheduleHint();
});

// ── Drag fondo ──
let bgDragging=false,bgStartX=0,bgStartY=0,bgAtX=50,bgAtY=50;
previewCanvas.addEventListener('pointerdown',e=>{if(e.target.closest('#signWrapper')||e.target.closest('#canvasRemote'))return;bgDragging=true;bgStartX=e.clientX;bgStartY=e.clientY;bgAtX=S.bgX;bgAtY=S.bgY;previewCanvas.style.cursor='grabbing';previewCanvas.setPointerCapture(e.pointerId);});
previewCanvas.addEventListener('pointermove',e=>{if(!bgDragging)return;S.bgX=Math.max(0,Math.min(100,bgAtX-(e.clientX-bgStartX)*.04));S.bgY=Math.max(0,Math.min(100,bgAtY-(e.clientY-bgStartY)*.04));previewCanvas.style.backgroundPosition=`${S.bgX}% ${S.bgY}%`;});
previewCanvas.addEventListener('pointerup',()=>{bgDragging=false;previewCanvas.style.cursor='default';});

// ── Resize ──
const rHandle=document.getElementById('resizeHandle');
let resizing=false,resizeStartX=0,scaleAtResize=1;
rHandle.addEventListener('pointerdown',e=>{hideHint();resizing=true;resizeStartX=e.clientX;scaleAtResize=S.scale;rHandle.setPointerCapture(e.pointerId);e.stopPropagation();e.preventDefault();});
rHandle.addEventListener('pointermove',e=>{if(!resizing)return;S.scale=Math.max(.05,scaleAtResize+(e.clientX-resizeStartX)*.006);renderNeon();updateDimBadge();});
rHandle.addEventListener('pointerup',()=>{resizing=false;scheduleHint();});

previewCanvas.addEventListener('wheel',e=>{e.preventDefault();S.scale=Math.max(.05,S.scale-e.deltaY*.001);renderNeon();updateDimBadge();},{passive:false});

let lastPinchDist=null;
previewCanvas.addEventListener('touchstart',e=>{if(e.touches.length===2){lastPinchDist=getPinchDist(e.touches);e.preventDefault();}},{passive:false});
previewCanvas.addEventListener('touchmove',e=>{if(e.touches.length===2&&lastPinchDist!==null){const d=getPinchDist(e.touches);S.scale=Math.max(.05,S.scale+(d-lastPinchDist)*.005);lastPinchDist=d;renderNeon();updateDimBadge();e.preventDefault();}},{passive:false});
previewCanvas.addEventListener('touchend',e=>{if(e.touches.length<2)lastPinchDist=null;});
function getPinchDist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);}

// ── Controls ──
document.getElementById('textInput').addEventListener('input',function(){
  const v=this.value.slice(0,80);this.value=v;S.text=v;
  document.getElementById('charCount').textContent=v.length+' caracteres';
  S.charOverrides={};closeCharMenu();renderNeon();updateDimBadge();dots();
});

const fontTrack=document.getElementById('fontTrack');let fontTabIdx=0;
document.getElementById('fontTabBar').addEventListener('click',e=>{
  const t=e.target.closest('.ftab');if(!t)return;
  fontTabIdx=parseInt(t.dataset.fi);
  fontTrack.style.transform=`translateX(-${fontTabIdx*100}%)`;
  document.querySelectorAll('#fontTabBar .ftab').forEach((x,i)=>x.classList.toggle('on',i===fontTabIdx));
});
document.getElementById('fontTrack').addEventListener('click',e=>{
  const b=e.target.closest('.fbtn');if(!b)return;
  document.querySelectorAll('#fontTrack .fbtn').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');S.font=b.dataset.font;recalcFontSize();dots();
  if(S.mount==='acrilico-redondo')applyMount();
});
document.getElementById('colorGrid').addEventListener('click',e=>{
  const s=e.target.closest('.cswatch');if(!s)return;
  document.querySelectorAll('.cswatch').forEach(x=>x.classList.remove('on'));s.classList.add('on');S.color=s.dataset.c;
  document.getElementById('colorLabel').textContent=s.dataset.n;renderNeon();dots();
});
document.getElementById('wallGrid').addEventListener('click',e=>{
  const b=e.target.closest('.wbtn');if(!b)return;
  document.querySelectorAll('.wbtn').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  previewCanvas.style.backgroundImage=`url('${b.dataset.url}')`;overlay.style.background=`rgba(0,0,0,${b.dataset.ov})`;dots();
});
document.getElementById('mountGrid').addEventListener('click',e=>{
  const b=e.target.closest('.mbtn');if(!b)return;
  document.querySelectorAll('.mbtn').forEach(x=>x.classList.remove('on'));b.classList.add('on');S.mount=b.dataset.m;
  renderNeon();dots();
});

// ── Dots ──
function dots(){
  const checks=[S.text.trim().length>0,S.font!=='Pacifico',S.color!=='#b3f0ff',!!document.querySelector('.wbtn.on:not(:first-child)'),S.mount!=='libre',document.getElementById('tController').checked];
  checks.forEach((ok,i)=>document.getElementById('d'+(i+1)).classList.toggle('on',ok));
  document.getElementById('d1').classList.add('on');
}

// ── Mobile sheet ──
const isMobile=()=>window.innerWidth<=768;
const SHEET_COLLAPSED=52,SHEET_HALF=220,SHEET_FULL=380;
let sheetH=SHEET_COLLAPSED,sheetOpen=false;
function initMobileSheet(){
  if(!isMobile())return;
  const handle=document.getElementById('sheetHandle'),tabsEl=document.getElementById('sheetTabs');
  const blocks=document.querySelectorAll('.block[data-tab]'),sh=document.getElementById('scrollHint');
  handle.style.display='flex';tabsEl.style.display='flex';
  if(sh)sh.textContent='✌️ Pellizca para redimensionar';
  tabsEl.innerHTML='';
  blocks.forEach((b,i)=>{const btn=document.createElement('button');btn.className='stab'+(i===0?' on':'');btn.textContent=b.dataset.tab;btn.addEventListener('click',()=>switchTab(i));tabsEl.appendChild(btn);});
  switchTab(0);
  if(handle._init)return;handle._init=true;
  handle.addEventListener('click',()=>{sheetOpen=!sheetOpen;setSheetHeight(sheetOpen?SHEET_HALF:SHEET_COLLAPSED);});
  let sheetDragStartY=0,sheetHAtStart=0,sheetDragging=false;
  handle.addEventListener('pointerdown',e=>{sheetDragging=true;sheetDragStartY=e.clientY;sheetHAtStart=sheetH;handle.setPointerCapture(e.pointerId);e.stopPropagation();});
  handle.addEventListener('pointermove',e=>{if(!sheetDragging)return;setSheetHeight(Math.max(SHEET_COLLAPSED,Math.min(SHEET_FULL,sheetHAtStart+(sheetDragStartY-e.clientY))),false);});
  handle.addEventListener('pointerup',()=>{sheetDragging=false;const snaps=[SHEET_COLLAPSED,SHEET_HALF,SHEET_FULL];const cl=snaps.reduce((a,b)=>Math.abs(b-sheetH)<Math.abs(a-sheetH)?b:a);setSheetHeight(cl);sheetOpen=cl>SHEET_COLLAPSED;});
}
function setSheetHeight(h,animate=true){sheetH=h;const sb=document.getElementById('sidebar');sb.style.transition=animate?'height .3s cubic-bezier(.4,0,.2,1)':'none';sb.style.height=h+'px';}
function switchTab(idx){document.querySelectorAll('.block[data-tab]').forEach((b,i)=>b.classList.toggle('active',i===idx));document.querySelectorAll('.stab').forEach((t,i)=>t.classList.toggle('on',i===idx));if(isMobile()&&sheetH<SHEET_HALF){setSheetHeight(SHEET_HALF);sheetOpen=true;}}

// ── Preview mode ──
// Canvas expands to fullscreen. We scale baseFontSize, posX, posY
// by the ratio of new canvas size vs old, so the sign stays proportional.
// S.scale is never touched — it's the user's explicit sizing choice.
const btnPreview=document.getElementById('btnPreview');
let resizeObserverPaused=false;
let previewSnapshot=null; // stores pre-preview state for exact restore

btnPreview.addEventListener('click',e=>{
  e.stopPropagation();
  if(previewActive)return;

  // Capture canvas size BEFORE going fullscreen
  const wBefore = previewCanvas.offsetWidth  || 800;
  const hBefore = previewCanvas.offsetHeight || 400;

  previewActive=true;
  resizeObserverPaused=true;
  document.body.classList.add('preview-mode');

  // Wait for the browser to fully apply the fullscreen CSS before measuring.
  // Double rAF guarantees we're past the paint frame where layout settled.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const wAfter = previewCanvas.offsetWidth  || window.innerWidth;
    const hAfter = previewCanvas.offsetHeight || window.innerHeight;

    const ratioW = wAfter / wBefore;
    const ratioH = hAfter / hBefore;

    previewSnapshot = {
      baseFontSize,
      posX: S.posX,
      posY: S.posY,
    };

    baseFontSize = baseFontSize * ratioW;
    S.posX = S.posX * ratioW;
    S.posY = S.posY * ratioW;

    renderNeon();
    // Unpause after render is committed so observer can't fire in same frame
    requestAnimationFrame(()=>{ resizeObserverPaused=false; });
  }));

  document.addEventListener('click',exitPreview);
});

function exitPreview(){
  if(!previewActive)return;
  previewActive=false;
  resizeObserverPaused=true;
  document.body.classList.remove('preview-mode');

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    // Restore exact pre-preview values BEFORE unpausing the observer
    if(previewSnapshot){
      baseFontSize = previewSnapshot.baseFontSize;
      S.posX = previewSnapshot.posX;
      S.posY = previewSnapshot.posY;
      previewSnapshot = null;
    }
    // Render with restored values while observer is still paused
    renderNeon();
    updateDimBadge();
    // Only unpause AFTER render is committed — extra rAF ensures paint is done
    requestAnimationFrame(()=>{ resizeObserverPaused=false; });
  }));

  document.removeEventListener('click',exitPreview);
}

// ── URL params ──
(function(){const p=new URLSearchParams(location.search);if(p.get('t')){S.text=p.get('t');document.getElementById('textInput').value=S.text;}if(p.get('f'))S.font=p.get('f');if(p.get('c'))S.color=p.get('c');})();

if(window.ResizeObserver){new ResizeObserver(()=>{ if(!resizeObserverPaused) renderNeon(); }).observe(previewCanvas);}
window.addEventListener('resize',()=>{
  if(resizeObserverPaused) return;
  if(!previewActive) canonicalCanvasW = previewCanvas.offsetWidth || 800;
  if(isMobile()){initMobileSheet();}
  else{const sb=document.getElementById('sidebar');sb.style.height='';sb.style.transition='';document.querySelectorAll('.block').forEach(b=>{b.style.display='';b.classList.remove('active');});document.getElementById('sheetHandle').style.display='none';document.getElementById('sheetTabs').style.display='none';}
  renderNeon();
});

// ═══════════════════════════════════════════════════════════════
// ── REMOTE CONTROL ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

const canvasRemote = document.getElementById('canvasRemote');
const remoteLed    = document.getElementById('remoteLed');
const pctBtns = {
  100: document.getElementById('rPct100'),
  50:  document.getElementById('rPct50'),
  25:  document.getElementById('rPct25'),
};

// Flash effect on button press
function flashBtn(el){
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  el.addEventListener('animationend',()=>el.classList.remove('flash'),{once:true});
}

// Show/hide remote
document.getElementById('tController').addEventListener('change', function(){
  if(this.checked){
    canvasRemote.style.display='block';
    void canvasRemote.offsetWidth;
    canvasRemote.classList.add('visible');
  } else {
    canvasRemote.classList.remove('visible');
    setTimeout(()=>{ canvasRemote.style.display='none'; }, 50);
  }
  dots();
  updateDimBadge(); // refresh quote to add/remove controller cost
});

// Prevent remote clicks from triggering canvas background drag
canvasRemote.addEventListener('pointerdown',e=>e.stopPropagation());

// ── Power ──
document.getElementById('rPower').addEventListener('click', function(){
  flashBtn(this);
  S.power = !S.power;

  // Update LED
  remoteLed.classList.toggle('off', !S.power);

  // Update power button visual
  this.classList.toggle('neon-off', !S.power);

  // Stop any running modes/RGB when powering off
  if(!S.power){
    clearModeAnimation();
    if(S.rgb){ stopRGB(); S.rgb=false; }
  } else {
    // Restore mode if one was active
    applyMode();
  }

  renderNeon();
});

// ── Brightness ──
function applyBrightnessFilter(){
  // Only change filter if no CSS animation is active
  const anim = neonEl.style.animationName;
  if(!anim || anim==='none'){
    neonEl.style.filter = getBrightnessFilter();
  }
  // Update CSS variable so animations can reference the base brightness
  neonEl.style.setProperty('--neon-filter', getBrightnessFilter() || 'brightness(1)');
}

function setBrightness(val){
  brightness = val;
  // Update pct buttons
  Object.entries(pctBtns).forEach(([k,b])=>b.classList.toggle('rbtn-pct-on', parseInt(k)===val));
  if(!S.power) return;
  applyBrightnessFilter();
}

document.getElementById('rBrightPlus').addEventListener('click', function(){
  flashBtn(this);
  const steps=[25,50,100]; const i=steps.indexOf(brightness);
  setBrightness(steps[Math.min(i+1,2)]);
});
document.getElementById('rBrightMinus').addEventListener('click', function(){
  flashBtn(this);
  const steps=[25,50,100]; const i=steps.indexOf(brightness);
  setBrightness(steps[Math.max(i-1,0)]);
});
document.getElementById('rDim').addEventListener('click', function(){
  flashBtn(this);
  setBrightness(brightness===25 ? 100 : 25);
});
document.getElementById('rPct100').addEventListener('click', function(){ flashBtn(this); setBrightness(100); });
document.getElementById('rPct50').addEventListener('click',  function(){ flashBtn(this); setBrightness(50);  });
document.getElementById('rPct25').addEventListener('click',  function(){ flashBtn(this); setBrightness(25);  });

// ── Modes ──
const MODES = ['static','flash','strobe','fade','smooth'];
let modeIdx = 0;

function clearModeAnimation(){
  neonEl.style.animation = 'none';
  neonEl.style.animationName = 'none';
  // Re-apply brightness as plain filter now that animation is gone
  neonEl.style.filter = getBrightnessFilter();
}

function applyMode(){
  if(!S.power) return;

  const mode = MODES[modeIdx];

  // Always clear previous animation cleanly
  neonEl.style.animation = 'none';
  void neonEl.offsetWidth; // force reflow to restart animation

  // Stop RGB if switching away from smooth
  if(mode !== 'smooth' && S.rgb){
    stopRGB(); S.rgb = false;
    // Restore static color
    const c = S.color;
    neonEl.style.color = c;
    neonEl.style.textShadow = tubeShadow(c);
    neonEl.style.webkitTextStroke = tubeStroke(c);
  }

  // Set CSS variable for animation brightness base
  const bf = getBrightnessFilter() || 'brightness(1)';
  neonEl.style.setProperty('--neon-filter', bf);

  switch(mode){
    case 'static':
      neonEl.style.animation = 'none';
      neonEl.style.filter = getBrightnessFilter();
      break;

    case 'flash':
      neonEl.style.filter = ''; // animation controls filter
      neonEl.style.animation = `neonFlash ${Math.round(speedMs * 0.9)}ms step-end infinite`;
      break;

    case 'strobe':
      neonEl.style.filter = '';
      neonEl.style.animation = `neonStrobe 90ms step-end infinite`;
      break;

    case 'fade':
      neonEl.style.filter = '';
      neonEl.style.animation = `neonFade ${Math.round(speedMs * 2.8)}ms ease-in-out infinite`;
      break;

    case 'smooth':
      neonEl.style.animation = 'none';
      neonEl.style.filter = getBrightnessFilter();
      S.rgb = true;
      startRGB();
      break;
  }
}

document.getElementById('rModePlus').addEventListener('click', function(){
  flashBtn(this);
  modeIdx = (modeIdx + 1) % MODES.length;
  applyMode();
});
document.getElementById('rModeMinus').addEventListener('click', function(){
  flashBtn(this);
  modeIdx = (modeIdx - 1 + MODES.length) % MODES.length;
  applyMode();
});

// ── Speed ──
document.getElementById('rSpeedPlus').addEventListener('click', function(){
  flashBtn(this);
  speedMs = Math.max(120, speedMs - 160);
  // Restart current mode with new speed
  const mode = MODES[modeIdx];
  if(mode==='smooth' && rgbInt){ stopRGB(); startRGB(); }
  else if(mode==='flash'||mode==='fade') applyMode();
});
document.getElementById('rSpeedMinus').addEventListener('click', function(){
  flashBtn(this);
  speedMs = Math.min(2200, speedMs + 220);
  const mode = MODES[modeIdx];
  if(mode==='smooth' && rgbInt){ stopRGB(); startRGB(); }
  else if(mode==='flash'||mode==='fade') applyMode();
});

// ── Quote panel: evitar que interfiera con el drag del canvas ──
document.getElementById('quotePanel').addEventListener('pointerdown', e => e.stopPropagation());

// ── Minimize: Quote Panel ──
(function(){
  const panel = document.getElementById('quotePanel');
  const btn   = document.getElementById('quotePanelMinBtn');
  const icon  = document.getElementById('quotePanelMinIcon');
  const LINE  = '<line x1="2" y1="5" x2="8" y2="5"/>';
  const PLUS  = '<line x1="5" y1="2" x2="5" y2="8"/><line x1="2" y1="5" x2="8" y2="5"/>';
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    const minimized = panel.classList.toggle('minimized');
    icon.innerHTML = minimized ? PLUS : LINE;
    btn.title = minimized ? 'Expandir' : 'Minimizar';
  });
})();

// ── Minimize: Canvas Remote ──
(function(){
  const remote = document.getElementById('canvasRemote');
  const btn    = document.getElementById('remoteMinBtn');
  const icon   = document.getElementById('remoteMinIcon');
  const LINE   = '<line x1="2" y1="5" x2="8" y2="5"/>';
  const PLUS   = '<line x1="5" y1="2" x2="5" y2="8"/><line x1="2" y1="5" x2="8" y2="5"/>';
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    const minimized = remote.classList.toggle('minimized');
    icon.innerHTML = minimized ? PLUS : LINE;
    btn.title = minimized ? 'Expandir' : 'Minimizar';
  });
})();

// ── Init ──
loadAdminSettings();
buildFontTrack(); buildColorGrid(); buildWallGrid();
canonicalCanvasW = previewCanvas.offsetWidth || 800;
recalcFontSize(); scheduleHint(); dots(); initMobileSheet(); updateDimBadge();