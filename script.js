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
function recalcFontSize(){ baseFontSize=calcBaseFontSize(); renderNeon(); }
function getCurrentFS(){ return baseFontSize * S.scale; }

// ── RGB ──
const RGB_COLORS=['#ff3cac','#00f5ff','#00ff88','#ffee00','#ff8800','#bf00ff','#3b82f6'];
let rgbInt=null, ri=0, currentRGBColor=RGB_COLORS[0];
function startRGB(){
  rgbInt=setInterval(()=>{
    currentRGBColor=RGB_COLORS[ri++%RGB_COLORS.length];
    neonEl.style.color=currentRGBColor;
    neonEl.style.textShadow=tubeShadow(currentRGBColor);
    neonEl.style.webkitTextStroke=tubeStroke(currentRGBColor);
    if(S.backing) drawAcrylic();
  },700);
}
function stopRGB(){ clearInterval(rgbInt); currentRGBColor=RGB_COLORS[0]; renderNeon(); }

// ── Acrylic ──────────────────────────────────────────────────────
// Renders each glyph to an offscreen canvas using span positions from the DOM
// to build a pixel-exact text mask. Then applies dilate→subtract morphology
// to produce a thin contour ring — the acrylic cut shape around the lettering.

let acrylicRaf = null;

function drawAcrylic(){
  if(!S.backing){ acrylicCvs.style.opacity='0'; return; }
  cancelAnimationFrame(acrylicRaf);
  acrylicRaf = requestAnimationFrame(()=> requestAnimationFrame(()=> _renderAcrylic()));
}

// ── Morphology helpers ──────────────────────────────────────────

function _dilate(src,w,h,r){
  const tmp=new Uint8Array(w*h),dst=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
    const b=y*w;
    for(let x=0;x<w;x++){
      const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);
      let v=0;for(let k=x0;k<=x1;k++)if(src[b+k]){v=255;break;}
      tmp[b+x]=v;
    }
  }
  for(let x=0;x<w;x++){
    for(let y=0;y<h;y++){
      const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);
      let v=0;for(let k=y0;k<=y1;k++)if(tmp[k*w+x]){v=255;break;}
      dst[y*w+x]=v;
    }
  }
  return dst;
}

function _erode(src,w,h,r){
  const tmp=new Uint8Array(w*h),dst=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
    const b=y*w;
    for(let x=0;x<w;x++){
      const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);
      let v=255;for(let k=x0;k<=x1;k++)if(!src[b+k]){v=0;break;}
      tmp[b+x]=v;
    }
  }
  for(let x=0;x<w;x++){
    for(let y=0;y<h;y++){
      const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);
      let v=255;for(let k=y0;k<=y1;k++)if(!tmp[k*w+x]){v=0;break;}
      dst[y*w+x]=v;
    }
  }
  return dst;
}

// ── Core acrylic renderer ───────────────────────────────────────
//
// Strategy: render every glyph onto an offscreen canvas using the exact
// font/size and baseline position derived from DOM measurements.
// fontBoundingBoxAscent (CSS line ascent) tells us exactly where the browser
// places the baseline relative to the top of the line box — this eliminates
// the vertical offset that plagued the previous approach.
//
// From the resulting alpha mask we compute:
//   outer  = mask dilated by MARGIN  →  outer acrylic edge
//   solid  = mask + small inset      →  the region the text sits in
//   panel  = outer filled solid      →  full acrylic panel shape
//   ring   = outer − solid           →  thin border strip (optional visual)
//
// The acrylic is painted as frosted clear material: white + transparency only,
// no neon colour, with an edge highlight and a drop shadow.

function _renderAcrylic(){
  if(!S.backing){ acrylicCvs.style.opacity='0'; return; }

  // Morphology constants — defined early so PAD can depend on them
  const MARGIN       = 16; // physical acrylic thickness (px beyond glyph)
  const MERGE_RADIUS = 50; // detection range for merging nearby letters
  const SMOOTH       = 10;  // open/close radius for corner rounding
  // PAD must always exceed the largest dilate radius used, or the mask
  // hits the canvas boundary and clips into a straight rectangular edge.
  const PAD = MERGE_RADIUS + SMOOTH + 50;

  // Use offset* instead of getBoundingClientRect() for positioning.
  // getBoundingClientRect returns viewport coords AFTER CSS transforms
  // (rotation, tilt) are applied — subtracting parent from child gives
  // wrong relative coords whenever the sign is rotated or translated.
  // offsetLeft/offsetTop/offsetWidth/offsetHeight are layout coords,
  // computed BEFORE transforms, so the canvas stays locked to neonEl
  // regardless of rotation, drag position, or tilt.
  const nW = neonEl.offsetWidth;
  const nH = neonEl.offsetHeight;
  const nL = neonEl.offsetLeft;
  const nT = neonEl.offsetTop;

  const w = nW + PAD * 2;
  const h = nH + PAD * 2;
  if(w < 4 || h < 4) return;

  // Position canvas in layout space — it lives inside signContent so it
  // inherits the same transforms automatically, no manual correction needed.
  acrylicCvs.width  = w;
  acrylicCvs.height = h;
  acrylicCvs.style.position      = 'absolute';
  acrylicCvs.style.left          = (nL - PAD) + 'px';
  acrylicCvs.style.top           = (nT - PAD) + 'px';
  acrylicCvs.style.pointerEvents = 'none';
  acrylicCvs.style.zIndex        = '2';
  acrylicCvs.style.opacity       = '1';
  acrylicCvs.style.filter        = 'none';

  // ── Step 1: render glyphs onto offscreen canvas → alpha mask ──────────
  // We use fontBoundingBoxAscent with textBaseline='alphabetic' so the
  // baseline lands in exactly the same place the browser chose for each span.
  const off    = document.createElement('canvas');
  off.width    = w;
  off.height   = h;
  const offCtx = off.getContext('2d');
  offCtx.fillStyle = '#fff';

  const fs    = getCurrentFS();
  const spans = neonEl.querySelectorAll('.nchar');

  spans.forEach(sp => {
    // Use offsetLeft/offsetTop relative to neonEl for the same reason as above:
    // these are pre-transform layout coords and stay correct under rotation.
    const idx = parseInt(sp.dataset.idx);
    const ov  = S.charOverrides[idx] || {};
    const ch  = sp.textContent === '\u00A0' ? ' ' : sp.textContent;

    offCtx.font         = `${fs}px '${ov.font || S.font}', cursive`;
    offCtx.textBaseline = 'alphabetic';

    const m  = offCtx.measureText(ch);
    const asc = m.fontBoundingBoxAscent !== undefined
      ? m.fontBoundingBoxAscent
      : m.actualBoundingBoxAscent;

    // offsetLeft/offsetTop of the span are relative to its offsetParent (neonEl)
    const x = sp.offsetLeft + PAD;
    const y = sp.offsetTop  + PAD + asc;

    offCtx.fillText(ch, x, y);
  });

  const raw  = offCtx.getImageData(0, 0, w, h);
  const mask = new Uint8Array(w * h);
  for(let i = 0; i < w * h; i++) mask[i] = raw.data[i*4+3] > 20 ? 255 : 0;

  // ── Step 2: morphology ────────────────────────────────────────────────
  // MARGIN, MERGE_RADIUS, SMOOTH are declared above near PAD.
  //
  // Dilate by MERGE_RADIUS to pull together letters that are close,
  // then erode back by (MERGE_RADIUS - MARGIN) to restore the physical
  // thickness to MARGIN px — detection range and size are now independent.

  // outer shape: large dilate (merge) → erode back to physical size → smooth
  const outerLarge = _dilate(mask, w, h, MERGE_RADIUS);
  const outerRaw   = _erode(outerLarge, w, h, MERGE_RADIUS - MARGIN);
  const outer      = _erode(_dilate(outerRaw, w, h, SMOOTH), w, h, SMOOTH);

  // inner cutout: glyph area (letters show through)
  const inner = _dilate(mask, w, h, 1);

  // full acrylic panel = outer shape
  // transparent hole   = inner (where the neon tube lives)

  // ── Step 3: paint acrylic layers ─────────────────────────────────────
  // ── Step 3: paint all acrylic layers into one ImageData in a single pass ──
  // putImageData() replaces the entire canvas each call, so multiple
  // putImageData→source-in sequences destroy each previous layer.
  // Solution: compute every pixel's final RGBA directly in one array.

  const ctx = acrylicCtx;
  ctx.clearRect(0, 0, w, h);

  const ang = 160 * Math.PI / 180;
  const cosA = Math.cos(ang), sinA = Math.sin(ang);

  const out = new Uint8ClampedArray(w * h * 4);

  for(let y = 0; y < h; y++){
    for(let x = 0; x < w; x++){
      const i = y * w + x;
      if(!outer[i] || inner[i]) continue; // outside panel ring → transparent

      // ── Is this a boundary pixel? ──────────────────────────────────
      const onEdge =
        (x === 0   || !outer[i-1]) ||
        (x === w-1 || !outer[i+1]) ||
        (y === 0   || !outer[i-w]) ||
        (y === h-1 || !outer[i+w]);

      // Top-edge pixel: no outer neighbour directly above
      const onTop = (y === 0 || !outer[(y-1)*w+x]);

      // ── 160° linear gradient (body fill) ───────────────────────────
      // Project (x,y) onto the gradient axis
      const cx = x - w/2, cy = y - h/2;
      const proj = (cx*cosA + cy*sinA) / (Math.sqrt(w*w+h*h)/2); // -1..+1
      const t = (proj + 1) / 2; // 0..1

      // Gradient stops: rgba(215,225,242) → rgba(175,192,218) → rgba(195,212,232)
      let br, bg, bb, ba;
      if(t < 0.5){
        const s = t / 0.5;
        br = Math.round(215 + (175-215)*s);
        bg = Math.round(225 + (192-225)*s);
        bb = Math.round(242 + (218-242)*s);
        ba = 0.28 + (0.22-0.28)*s;  // translucent body
      } else {
        const s = (t-0.5)/0.5;
        br = Math.round(175 + (195-175)*s);
        bg = Math.round(192 + (212-192)*s);
        bb = Math.round(218 + (232-218)*s);
        ba = 0.22 + (0.26-0.22)*s;  // translucent body
      }

      // ── Radial centre highlight (magnification effect) ─────────────
      const dx = x - w*0.45, dy = y - h*0.38;
      const dist = Math.sqrt(dx*dx + dy*dy) / (Math.max(w,h)*0.55);
      const radA = Math.max(0, 0.18 * (1 - Math.min(dist,1)));
      // Blend: body + radial white
      const ra = Math.min(1, ba + radA);
      let rr = Math.round(br + (240-br)*radA);
      let rg = Math.round(bg + (248-bg)*radA);
      let rb = Math.round(bb + (255-bb)*radA);

      // ── Outer contour (dense bright white border) ──────────────────
      if(onEdge){
        rr = 255; rg = 255; rb = 255;
      }

      // ── Top highlight (extra bright on top edge) ───────────────────
      if(onTop){
        rr = 255; rg = 255; rb = 255;
      }

      const pi = i * 4;
      out[pi+0] = rr;
      out[pi+1] = rg;
      out[pi+2] = rb;
      out[pi+3] = onEdge || onTop
        ? 175                                    // border: semi-dense (tweak this 0–255 for border opacity)
        : Math.round(ra * 255);                  // body: translucent
    }
  }

  ctx.putImageData(new ImageData(out, w, h), 0, 0);

  // ── Drop shadow ───────────────────────────────────────────────────
  acrylicCvs.style.filter = 'drop-shadow(0px 4px 28px rgba(0,0,0,0.55))';
}



function hexToRgb(hex){ return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}; }
function darken(hex,f){ const {r,g,b}=hexToRgb(hex); return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`; }
function rgba(hex,a){ const {r,g,b}=hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function tubeShadow(c){
  const d1=darken(c,.75),d2=darken(c,.55),d3=darken(c,.38),d4=darken(c,.22);
  return [`1px 1px 0 ${d1}`,`2px 2px 0 ${d2}`,`3px 3px 0 ${d3}`,`4px 4px 0 ${d4}`,
    `5px 5px 0 rgba(255,255,255,0.85)`,`6px 6px 1px rgba(0,0,0,0.3)`,
    `0 0 3px ${c}`,`0 0 8px ${c}`,`0 0 18px ${rgba(c,.7)}`].join(',');
}
function tubeStroke(c){ return `1px ${darken(c,.6)}`; }

// ── Render ──
function buildNeonSpans(){
  neonEl.innerHTML='';
  const chars=S.text||' ';
  for(let i=0;i<chars.length;i++){
    const ch=chars[i];
    if(ch==='\n'){ const br=document.createElement('span'); br.className='nchar-nl'; neonEl.appendChild(br); continue; }
    const sp=document.createElement('span'); sp.className='nchar'; sp.dataset.idx=i;
    sp.textContent=ch===' '?'\u00A0':ch;
    const ov=S.charOverrides[i];
    if(ov){
      if(ov.font) sp.style.fontFamily=`'${ov.font}',cursive`;
      if(ov.color){ sp.style.color=ov.color; if(S.power){ sp.style.textShadow=tubeShadow(ov.color); sp.style.webkitTextStroke=tubeStroke(ov.color); } }
    }
    if(i===activeCharIdx) sp.classList.add('selected');
    neonEl.appendChild(sp);
  }
  if(activeCharIdx!==null&&charMenu.classList.contains('visible')){
    const freshSpan=neonEl.querySelector(`.nchar[data-idx="${activeCharIdx}"]`);
    if(freshSpan) _repositionMenu(freshSpan);
  }
}

function _repositionMenu(spanEl){
  const cRect=previewCanvas.getBoundingClientRect();
  const sRect=spanEl.getBoundingClientRect();
  const cx = sRect.left + sRect.width/2 - cRect.left;
  const ty = sRect.top - cRect.top - 10;
  charMenu.style.left = cx + 'px';
  charMenu.style.top  = ty + 'px';
  charMenu.style.transform = 'translateX(-50%) translateY(-100%)';
}

function renderNeon(){
  const fs = getCurrentFS();

  neonEl.style.fontFamily = `'${S.font}', cursive`;
  neonEl.style.fontSize   = fs + 'px';

  posWrapper.style.transform = `translate(calc(-50% + ${S.posX}px), calc(-50% + ${S.posY}px))`;
  signWrapper.style.transform = `rotate(${S.rotation}deg)`;
  signContent.style.transform = `rotateY(${S.tiltY}deg)`;
  signContent.style.position = 'relative';

  if(!S.power){
    neonEl.style.color='#5a5a5a';
    neonEl.style.textShadow='none';
    neonEl.style.webkitTextStroke='0px transparent';
    buildNeonSpans();
    applyMount();
    return;
  }

  const c=(S.rgb&&rgbInt)?currentRGBColor:S.color;
  neonEl.style.color=c;
  neonEl.style.textShadow=tubeShadow(c);
  neonEl.style.webkitTextStroke=tubeStroke(c);

  buildNeonSpans();
  applyMount();
  if(S.backing){
    drawAcrylic();
  }
}

function updateDimBadge(){
  requestAnimationFrame(()=>{
    const canvasW = previewCanvas.offsetWidth || 800;
    const pxW = neonEl.offsetWidth;
    const pxH = neonEl.offsetHeight;
    const BASE_CM = 140;
    const BASE_PX = canvasW * 0.90;
    const cmW = Math.max(5, Math.round((pxW / BASE_PX) * BASE_CM));
    const cmH = Math.max(2, Math.round((pxH / BASE_PX) * BASE_CM));
    document.getElementById('dimBadge').textContent = `~ ${cmW} × ${cmH} cm`;
  });
}

function resetPosition(){ S.posX=0; S.posY=0; S.scale=1; S.rotation=0; S.tiltY=0; renderNeon(); updateDimBadge(); }

// ── Mount ──
function applyMount(){
  mountPlate.style.cssText=''; mountPlate.style.opacity='0';
  mountHook.style.display='none'; mountBase.style.display='none'; mountScrews.style.display='none';

  const plateStyle='position:absolute;z-index:0;pointer-events:none;background:linear-gradient(160deg,rgba(220,230,245,.22) 0%,rgba(180,195,220,.15) 50%,rgba(200,215,235,.20) 100%);opacity:1;box-shadow:0 4px 28px rgba(0,0,0,.55),inset 0 0 0 1.5px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.4);';

  const applyRect=(padX,padY,extra='')=>{
    requestAnimationFrame(()=>{
      const nL=neonEl.offsetLeft, nT=neonEl.offsetTop;
      const nW=neonEl.offsetWidth,  nH=neonEl.offsetHeight;
      mountPlate.style.cssText=plateStyle+
        `left:${nL-padX}px;top:${nT-padY}px;width:${nW+padX*2}px;height:${nH+padY*2}px;${extra}`;
    });
  };

  if(S.mount==='acrilico-cuadrado'){
    applyRect(22,18,'border-radius:10px;');
    acrylicCvs.style.opacity='0';
    S.backing=false;
    return;
  }

  if(S.mount==='backing'){
    S.backing=true;
    drawAcrylic();
    return;
  }

  // libre
  S.backing=false;
  acrylicCvs.style.opacity='0';
}

// ── Char editor ──
const FONTS_LIST=[
  {k:'Pacifico',l:'Pacifico'},{k:'Courgette',l:'Courgette'},{k:'Yellowtail',l:'Yellowtail'},
  {k:'Cookie',l:'Cookie'},{k:'Kaushan Script',l:'Kaushan'},{k:'Dancing Script',l:'Dancing'},
  {k:'Great Vibes',l:'Great Vibes'},{k:'Sacramento',l:'Sacramento'},{k:'Lobster',l:'Lobster'},
  {k:'Rock Salt',l:'Rock Salt'},{k:'Amatic SC',l:'Amatic SC'},{k:'Comfortaa',l:'Comfortaa'},
  {k:'Nunito',l:'Nunito'},{k:'Raleway',l:'Raleway'},{k:'Righteous',l:'Righteous'},
];
const COLORS_LIST=[
  {c:'#b3f0ff',n:'Azul Hielo'},{c:'#ff2222',n:'Roja'},{c:'#ffb300',n:'Amber'},
  {c:'#e8ff00',n:'Amarillo Limón'},{c:'#bf00ff',n:'Morado'},{c:'#00ff88',n:'Verde'},
  {c:'#ffe8c0',n:'Blanco Cálido'},{c:'#3b82f6',n:'Azul'},{c:'#ff3cac',n:'Rosa'},
  {c:'#ffd700',n:'Amarillo Dorado'},{c:'#ff8800',n:'Naranja'},{c:'#e8f4ff',n:'Blanca Fría'},
];
charMenu.addEventListener('pointerdown',e=>e.stopPropagation());
const cmenuFontName=document.getElementById('cmenuFontName');
const cmenuColorBtn=document.getElementById('cmenuColorBtn');
const cmenuColorSub=document.getElementById('cmenuColorSub');
let activeCharIdx=null, cmenuFontIdx=0;
COLORS_LIST.forEach(col=>{
  const sw=document.createElement('div'); sw.className='cmenu-csw'; sw.style.background=col.c; sw.title=col.n; sw.dataset.color=col.c; cmenuColorSub.appendChild(sw);
});
function openCharMenu(spanEl){
  const idx=parseInt(spanEl.dataset.idx); activeCharIdx=idx;
  neonEl.querySelectorAll('.nchar.selected').forEach(s=>s.classList.remove('selected')); spanEl.classList.add('selected');
  const ov=S.charOverrides[idx]||{}, curFont=ov.font||S.font, curColor=ov.color||S.color;
  cmenuFontIdx=FONTS_LIST.findIndex(f=>f.k===curFont); if(cmenuFontIdx<0)cmenuFontIdx=0;
  updateFontCarousel(); cmenuColorBtn.style.background=curColor;
  cmenuColorSub.querySelectorAll('.cmenu-csw').forEach(s=>s.classList.toggle('on',s.dataset.color===curColor));
  cmenuColorSub.classList.remove('open'); _repositionMenu(spanEl); charMenu.classList.add('visible');
}
function closeCharMenu(){
  charMenu.classList.remove('visible'); cmenuColorSub.classList.remove('open');
  neonEl.querySelectorAll('.nchar.selected').forEach(s=>s.classList.remove('selected')); activeCharIdx=null;
}
function updateFontCarousel(){ const f=FONTS_LIST[cmenuFontIdx]; cmenuFontName.textContent=f.l; cmenuFontName.style.fontFamily=`'${f.k}',cursive`; }
function applyCarouselFont(){
  if(activeCharIdx===null)return;
  if(!S.charOverrides[activeCharIdx])S.charOverrides[activeCharIdx]={};
  S.charOverrides[activeCharIdx].font=FONTS_LIST[cmenuFontIdx].k; renderNeon();
}
document.getElementById('cmenuPrev').addEventListener('click',e=>{ e.stopPropagation(); cmenuFontIdx=(cmenuFontIdx-1+FONTS_LIST.length)%FONTS_LIST.length; updateFontCarousel(); applyCarouselFont(); });
document.getElementById('cmenuNext').addEventListener('click',e=>{ e.stopPropagation(); cmenuFontIdx=(cmenuFontIdx+1)%FONTS_LIST.length; updateFontCarousel(); applyCarouselFont(); });
cmenuColorBtn.addEventListener('click',e=>{ e.stopPropagation(); cmenuColorSub.classList.toggle('open'); });
cmenuColorSub.addEventListener('click',e=>{
  const sw=e.target.closest('.cmenu-csw'); if(!sw)return; e.stopPropagation(); if(activeCharIdx===null)return;
  if(!S.charOverrides[activeCharIdx])S.charOverrides[activeCharIdx]={};
  S.charOverrides[activeCharIdx].color=sw.dataset.color; cmenuColorBtn.style.background=sw.dataset.color;
  cmenuColorSub.querySelectorAll('.cmenu-csw').forEach(s=>s.classList.toggle('on',s===sw)); cmenuColorSub.classList.remove('open'); renderNeon();
});
document.getElementById('cmenuReset').addEventListener('click',e=>{ e.stopPropagation(); if(activeCharIdx===null)return; delete S.charOverrides[activeCharIdx]; closeCharMenu(); renderNeon(); });
document.addEventListener('pointerdown',e=>{ if(!charMenu.classList.contains('visible'))return; if(charMenu.contains(e.target))return; if(e.target.closest('.nchar'))return; closeCharMenu(); });
signWrapper.addEventListener('pointermove',()=>{ if(dragging)closeCharMenu(); });

// ── Rotate ──
const rotHandle=document.getElementById('rotateHandle'), angleBadge=document.getElementById('angleBadge');
let rotating=false, rotStartAngle=0, rotAtStart=0;
function getAngleFromCenter(x,y){
  const r=posWrapper.getBoundingClientRect();
  return Math.atan2(y-(r.top+r.height/2), x-(r.left+r.width/2))*(180/Math.PI);
}
rotHandle.addEventListener('pointerdown',e=>{ e.stopPropagation();e.preventDefault(); rotating=true; rotStartAngle=getAngleFromCenter(e.clientX,e.clientY); rotAtStart=S.rotation; rotHandle.setPointerCapture(e.pointerId); rotHandle.classList.add('active'); angleBadge.classList.add('visible'); });
rotHandle.addEventListener('pointermove',e=>{ if(!rotating)return; S.rotation=rotAtStart+getAngleFromCenter(e.clientX,e.clientY)-rotStartAngle; const diff=S.rotation-Math.round(S.rotation/90)*90; if(Math.abs(diff)<4)S.rotation=Math.round(S.rotation/90)*90; renderNeon(); angleBadge.textContent=((Math.round(S.rotation)%360)+360)%360+'°'; });
rotHandle.addEventListener('pointerup',()=>{ rotating=false; rotHandle.classList.remove('active'); setTimeout(()=>angleBadge.classList.remove('visible'),800); scheduleHint(); });

// ── Hint ──
const sizeHint=document.getElementById('sizeHint'); let hintTimer=null, hintShown=false;
function scheduleHint(){ clearTimeout(hintTimer); hideHint(); hintTimer=setTimeout(showHint,1500); }
function showHint(){ if(hintShown)return; hintShown=true; sizeHint.style.opacity='1'; hintTimer=setTimeout(hideHint,3000); }
function hideHint(){ hintShown=false; sizeHint.style.opacity='0'; clearTimeout(hintTimer); }

// ── Tilt ──
const tiltHandleY=document.getElementById('tiltHandleY'), tiltBadge=document.getElementById('tiltBadge');
let tilting=false, tiltStartX=0, tiltAtStart=0, tiltTimer=null;
tiltHandleY.addEventListener('pointerdown',e=>{ e.stopPropagation();e.preventDefault(); tilting=true; tiltStartX=e.clientX; tiltAtStart=S.tiltY; hideHint(); tiltHandleY.setPointerCapture(e.pointerId); tiltHandleY.classList.add('active'); tiltBadge.classList.add('visible'); });
document.addEventListener('pointermove',e=>{ if(!tilting)return; let val=tiltAtStart+(e.clientX-tiltStartX)*.4; val=Math.max(-80,Math.min(80,val)); if(Math.abs(val)<3)val=0; S.tiltY=val; renderNeon(); tiltBadge.textContent=Math.round(val)+'°'; });
document.addEventListener('pointerup',()=>{ if(!tilting)return; tilting=false; tiltHandleY.classList.remove('active'); clearTimeout(tiltTimer); tiltTimer=setTimeout(()=>tiltBadge.classList.remove('visible'),800); scheduleHint(); });

// ── Drag letrero ──
let dragging=false, dragStartX=0, dragStartY=0, posAtDragX=0, posAtDragY=0, pointerDownTarget=null, charPointerMoved=false;
signWrapper.addEventListener('pointerdown',e=>{
  if(e.target.closest('#resizeHandle'))return;
  hideHint(); pointerDownTarget=e.target; charPointerMoved=false; dragging=true;
  dragStartX=e.clientX; dragStartY=e.clientY; posAtDragX=S.posX; posAtDragY=S.posY;
  signWrapper.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
});
signWrapper.addEventListener('pointermove',e=>{
  if(!dragging)return; const dx=e.clientX-dragStartX, dy=e.clientY-dragStartY;
  if(Math.abs(dx)>4||Math.abs(dy)>4)charPointerMoved=true; S.posX=posAtDragX+dx; S.posY=posAtDragY+dy; renderNeon();
});
signWrapper.addEventListener('pointerup',e=>{
  dragging=false;
  if(!charPointerMoved){ const sp=pointerDownTarget&&pointerDownTarget.closest('.nchar'); if(sp)openCharMenu(sp); }
  pointerDownTarget=null; scheduleHint();
});

// ── Drag fondo ──
let bgDragging=false, bgStartX=0, bgStartY=0, bgAtX=50, bgAtY=50;
previewCanvas.addEventListener('pointerdown',e=>{ if(e.target.closest('#signWrapper'))return; bgDragging=true; bgStartX=e.clientX; bgStartY=e.clientY; bgAtX=S.bgX; bgAtY=S.bgY; previewCanvas.style.cursor='grabbing'; previewCanvas.setPointerCapture(e.pointerId); });
previewCanvas.addEventListener('pointermove',e=>{ if(!bgDragging)return; S.bgX=Math.max(0,Math.min(100,bgAtX-(e.clientX-bgStartX)*.04)); S.bgY=Math.max(0,Math.min(100,bgAtY-(e.clientY-bgStartY)*.04)); previewCanvas.style.backgroundPosition=`${S.bgX}% ${S.bgY}%`; });
previewCanvas.addEventListener('pointerup',()=>{ bgDragging=false; previewCanvas.style.cursor='default'; });

// ── Resize ──
const rHandle=document.getElementById('resizeHandle');
let resizing=false, resizeStartX=0, scaleAtResize=1;
rHandle.addEventListener('pointerdown',e=>{ hideHint(); resizing=true; resizeStartX=e.clientX; scaleAtResize=S.scale; rHandle.setPointerCapture(e.pointerId); e.stopPropagation(); e.preventDefault(); });
rHandle.addEventListener('pointermove',e=>{ if(!resizing)return; S.scale=Math.max(.05,scaleAtResize+(e.clientX-resizeStartX)*.006); renderNeon(); updateDimBadge(); });
rHandle.addEventListener('pointerup',()=>{ resizing=false; scheduleHint(); });

previewCanvas.addEventListener('wheel',e=>{ e.preventDefault(); S.scale=Math.max(.05,S.scale-e.deltaY*.001); renderNeon(); updateDimBadge(); },{passive:false});

// ── Pinch ──
let lastPinchDist=null;
previewCanvas.addEventListener('touchstart',e=>{ if(e.touches.length===2){lastPinchDist=getPinchDist(e.touches);e.preventDefault();} },{passive:false});
previewCanvas.addEventListener('touchmove',e=>{ if(e.touches.length===2&&lastPinchDist!==null){ const d=getPinchDist(e.touches); S.scale=Math.max(.05,S.scale+(d-lastPinchDist)*.005); lastPinchDist=d; renderNeon(); updateDimBadge(); e.preventDefault(); } },{passive:false});
previewCanvas.addEventListener('touchend',e=>{ if(e.touches.length<2)lastPinchDist=null; });
function getPinchDist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);}

// ── Controls ──
document.getElementById('textInput').addEventListener('input',function(){
  const v=this.value.slice(0,80); this.value=v; S.text=v;
  document.getElementById('charCount').textContent=v.length+' caracteres';
  S.charOverrides={}; closeCharMenu(); renderNeon(); updateDimBadge(); dots();
});
document.getElementById('fontGrid').addEventListener('click',e=>{
  const b=e.target.closest('.fbtn'); if(!b)return;
  document.querySelectorAll('.fbtn').forEach(x=>x.classList.remove('on')); b.classList.add('on'); S.font=b.dataset.font;
  recalcFontSize(); dots();
});
document.getElementById('colorGrid').addEventListener('click',e=>{
  const s=e.target.closest('.cswatch'); if(!s)return;
  document.querySelectorAll('.cswatch').forEach(x=>x.classList.remove('on')); s.classList.add('on'); S.color=s.dataset.c;
  document.getElementById('colorLabel').textContent=s.dataset.n; renderNeon(); dots();
});
document.getElementById('wallGrid').addEventListener('click',e=>{
  const b=e.target.closest('.wbtn'); if(!b)return;
  document.querySelectorAll('.wbtn').forEach(x=>x.classList.remove('on')); b.classList.add('on');
  previewCanvas.style.backgroundImage=`url('${b.dataset.url}')`; overlay.style.background=`rgba(0,0,0,${b.dataset.ov})`; dots();
});

document.getElementById('mountGrid').addEventListener('click',e=>{
  const b=e.target.closest('.mbtn'); if(!b)return;
  document.querySelectorAll('.mbtn').forEach(x=>x.classList.remove('on')); b.classList.add('on'); S.mount=b.dataset.m;
  renderNeon(); dots();
});

document.getElementById('tRgb').addEventListener('change',function(){ S.rgb=this.checked; this.checked?startRGB():stopRGB(); dots(); });
document.getElementById('tPower').addEventListener('change',function(){
  S.power=this.checked;
  if(this.checked){ renderNeon(); }
  else { neonEl.style.color='#5a5a5a'; neonEl.style.textShadow='none'; applyMount(); }
});

// ── Dots ──
function dots(){
  const checks=[S.text.trim().length>0,S.font!=='Pacifico',S.color!=='#b3f0ff',!!document.querySelector('.wbtn.on:not(:first-child)'),S.mount!=='libre',S.backing||S.rgb];
  checks.forEach((ok,i)=>document.getElementById('d'+(i+1)).classList.toggle('on',ok));
  document.getElementById('d1').classList.add('on');
}

// ── Mobile sheet ──
const isMobile=()=>window.innerWidth<=768;
const SHEET_COLLAPSED=52, SHEET_HALF=220, SHEET_FULL=380;
let sheetH=SHEET_COLLAPSED, sheetOpen=false;
function initMobileSheet(){
  if(!isMobile())return;
  const handle=document.getElementById('sheetHandle'), tabsEl=document.getElementById('sheetTabs');
  const blocks=document.querySelectorAll('.block[data-tab]'), sh=document.getElementById('scrollHint');
  handle.style.display='flex'; tabsEl.style.display='flex';
  if(sh)sh.textContent='✌️ Pellizca para redimensionar';
  tabsEl.innerHTML='';
  blocks.forEach((b,i)=>{ const btn=document.createElement('button'); btn.className='stab'+(i===0?' on':''); btn.textContent=b.dataset.tab; btn.addEventListener('click',()=>switchTab(i)); tabsEl.appendChild(btn); });
  switchTab(0);
  if(handle._init)return; handle._init=true;
  handle.addEventListener('click',()=>{ sheetOpen=!sheetOpen; setSheetHeight(sheetOpen?SHEET_HALF:SHEET_COLLAPSED); });
  let sheetDragStartY=0, sheetHAtStart=0, sheetDragging=false;
  handle.addEventListener('pointerdown',e=>{ sheetDragging=true; sheetDragStartY=e.clientY; sheetHAtStart=sheetH; handle.setPointerCapture(e.pointerId); e.stopPropagation(); });
  handle.addEventListener('pointermove',e=>{ if(!sheetDragging)return; setSheetHeight(Math.max(SHEET_COLLAPSED,Math.min(SHEET_FULL,sheetHAtStart+(sheetDragStartY-e.clientY))),false); });
  handle.addEventListener('pointerup',()=>{ sheetDragging=false; const snaps=[SHEET_COLLAPSED,SHEET_HALF,SHEET_FULL]; const cl=snaps.reduce((a,b)=>Math.abs(b-sheetH)<Math.abs(a-sheetH)?b:a); setSheetHeight(cl); sheetOpen=cl>SHEET_COLLAPSED; });
}
function setSheetHeight(h,animate=true){ sheetH=h; const sb=document.getElementById('sidebar'); sb.style.transition=animate?'height .3s cubic-bezier(.4,0,.2,1)':'none'; sb.style.height=h+'px'; }
function switchTab(idx){ document.querySelectorAll('.block[data-tab]').forEach((b,i)=>b.classList.toggle('active',i===idx)); document.querySelectorAll('.stab').forEach((t,i)=>t.classList.toggle('on',i===idx)); if(isMobile()&&sheetH<SHEET_HALF){setSheetHeight(SHEET_HALF);sheetOpen=true;} }

// ── Preview mode ──
const btnPreview=document.getElementById('btnPreview');
let previewActive=false, previewSnapshot=null;
btnPreview.addEventListener('click',e=>{
  e.stopPropagation(); if(previewActive)return;
  const rectBefore=previewCanvas.getBoundingClientRect();
  previewActive=true; document.body.classList.add('preview-mode');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const rectAfter=previewCanvas.getBoundingClientRect();
    const ratioW=rectAfter.width/(rectBefore.width||1), ratioH=rectAfter.height/(rectBefore.height||1), ratio=Math.max(ratioW,ratioH);
    previewSnapshot={scale:S.scale,posX:S.posX,posY:S.posY};
    S.scale*=ratio; S.posX*=ratioW; S.posY*=ratioH; renderNeon(); updateDimBadge();
    if(S.backing) drawAcrylic();
  }));
  document.addEventListener('click',exitPreview);
});
function exitPreview(){
  if(!previewActive)return; previewActive=false; document.body.classList.remove('preview-mode');
  document.removeEventListener('click',exitPreview);
  if(previewSnapshot){ S.scale=previewSnapshot.scale; S.posX=previewSnapshot.posX; S.posY=previewSnapshot.posY; previewSnapshot=null; renderNeon(); updateDimBadge(); }
  if(S.backing) drawAcrylic();
}

// ── URL params ──
(function(){ const p=new URLSearchParams(location.search); if(p.get('t')){S.text=p.get('t');document.getElementById('textInput').value=S.text;} if(p.get('f'))S.font=p.get('f'); if(p.get('c'))S.color=p.get('c'); })();

if(window.ResizeObserver){ new ResizeObserver(()=>renderNeon()).observe(previewCanvas); }

window.addEventListener('resize',()=>{
  if(isMobile()){ initMobileSheet(); }
  else { const sb=document.getElementById('sidebar'); sb.style.height=''; sb.style.transition=''; document.querySelectorAll('.block').forEach(b=>{b.style.display='';b.classList.remove('active');}); document.getElementById('sheetHandle').style.display='none'; document.getElementById('sheetTabs').style.display='none'; }
  renderNeon();
});

// ── Init ──
recalcFontSize(); scheduleHint(); dots(); initMobileSheet();