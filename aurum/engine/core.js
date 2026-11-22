'use strict';
/* =====================================================================
   AURUM — moteur d'animation (canvas 2D vectoriel)
   Espace de travail : 1920×1080 (16:9). Rendu à n'importe quelle échelle
   (SCALE = 2 → 3840×2160, 4K) sans perte : tout est dessiné en vectoriel.
   ===================================================================== */
const W = 1920, H = 1080, PI = Math.PI, TAU = Math.PI * 2;
const Q = new URLSearchParams(location.search);
const SCALE = parseFloat(Q.get('scale') || '1');
const PX = Math.round(W * SCALE), PY = Math.round(H * SCALE);

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rgba = (r, g, b, a) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// interpolation par clés : kf(t, [[t0,v0],[t1,v1],...], easing)
function kf(t, keys, fn = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [ta, va] = keys[i - 1], [tb, vb] = keys[i];
      const u = fn((t - ta) / Math.max(1e-6, tb - ta));
      if (typeof va === 'number') return lerp(va, vb, u);
      if (Array.isArray(va)) return va.map((x, j) => lerp(x, vb[j], u));
      return u < .5 ? va : vb;
    }
  }
  return keys[keys.length - 1][1];
}
// valeur discrète : step(t, [[t0,'a'],[t1,'b']])
function step(t, keys) { let v = keys[0][1]; for (const [k, x] of keys) if (t >= k) v = x; return v; }

// ---------- toiles ----------
const cv = document.getElementById('cv');
cv.width = PX; cv.height = PY;
const OX = cv.getContext('2d');
function layer() { const c = mk(PX, PY); return { c, x: c.getContext('2d') }; }
const L1 = layer(), L2 = layer(), L3 = layer();

// ---------- textures (créées à la résolution réelle pour rester nettes en 4K) ----------
const PAT = {};
function dotPattern(col, cell, r) {
  const s = SCALE, c = mk(Math.round(cell * s), Math.round(cell * s)), x = c.getContext('2d'); x.fillStyle = col;
  for (const [px, py] of [[.25, .25], [.75, .75]]) { x.beginPath(); x.arc(px * cell * s, py * cell * s, r * s, 0, TAU); x.fill(); }
  const p = OX.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix().scale(1 / s)); return p;
}
let GRAIN, VIGN;
function initCore() {
  PAT.dark = dotPattern('rgba(25,14,4,0.5)', 11, 2.3);
  PAT.dark2 = dotPattern('rgba(0,0,0,0.45)', 9, 1.9);
  PAT.light = dotPattern('rgba(255,255,255,0.07)', 9, 1.8);
  PAT.cloth = dotPattern('rgba(0,0,0,0.4)', 9, 2.0);
  PAT.skin = dotPattern('rgba(0,0,0,0.22)', 8, 1.6);
  PAT.gold = dotPattern('rgba(235,195,125,0.16)', 11, 2.2);
  GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'); const im = g.createImageData(512, 512);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); PAT.grain = OX.createPattern(GRAIN, 'repeat');
  VIGN = mk(PX, PY); const v = VIGN.getContext('2d'); v.scale(SCALE, SCALE);
  const vg = v.createRadialGradient(W / 2, H * .52, H * .38, W / 2, H * .52, H * 1.05);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.62)'); v.fillStyle = vg; v.fillRect(0, 0, W, H);
}

// ---------- peinture « cartoon » : remplissage, liseré clair, trame, contour ----------
function paint(c, path, o) {
  if (o.rim) { c.fillStyle = o.rim; c.fill(path); c.save(); c.clip(path); c.translate(o.rx ?? 4, o.ry ?? 0); c.fillStyle = o.fill; c.fill(path); c.restore(); }
  else { c.fillStyle = o.fill; c.fill(path); }
  if (o.dots) { c.save(); c.clip(path); c.globalAlpha *= (o.da ?? 1); c.fillStyle = o.dots; c.fillRect(o.dx ?? 0, -9000, 18000, 18000); c.restore(); }
  if (o.stroke !== false) { c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = o.lw ?? 3; c.strokeStyle = o.stroke || '#000'; c.stroke(path); }
}
function goldGrad(c, x0, x1, tone = 0) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  const A = [['#dcb879', '#b78e55', '#7a5830'], ['#a98552', '#87683d', '#56401f'], ['#6d5331', '#55402a', '#2f2314'], ['#3e3020', '#30251a', '#1c150d']][tone];
  g.addColorStop(0, A[0]); g.addColorStop(.55, A[1]); g.addColorStop(1, A[2]); return g;
}
function vGrad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rect(x, y, w, h, r = 0) { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; }
function glow(c, x, y, r, col, a = 1) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }

// ---------- caméra ----------
// cam = {x, y (point visé), z (zoom), r (rotation), shake}
function applyCam(c, cam, T) {
  if (!cam) return;
  let { x = W / 2, y = H / 2, z = 1, r = 0, shake = 0 } = cam;
  if (shake) { x += (hash(Math.floor(T * 24)) - .5) * shake; y += (hash(Math.floor(T * 24) + 3.3) - .5) * shake; }
  c.translate(W / 2, H / 2); c.scale(z, z); if (r) c.rotate(r); c.translate(-x, -y);
}
// ondulation de chaleur (bandes horizontales décalées)
function heatBlit(dst, srcCanvas, amp, y0, y1, T) {
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(srcCanvas, 0, 0);
  if (amp > .2) {
    const st = Math.max(2, Math.round(2 * SCALE));
    for (let y = Math.max(0, Math.round(y0 * SCALE)); y < Math.min(PY, y1 * SCALE); y += st) {
      const yy = y / SCALE, dx = amp * SCALE * (Math.sin(yy * .05 + T * 6.5) + .5 * Math.sin(yy * .12 - T * 10));
      if (Math.abs(dx) > .3) dst.drawImage(srcCanvas, 0, y, PX, st, dx, y, PX, st);
    }
  }
  dst.restore();
}

// ---------- particules / ambiance ----------
function dust(c, T, n, seed, box = [0, 0, W, H], col = '245,205,135', a0 = .5) {
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) {
    const r1 = hash(seed * 13 + i * 1.37), r2 = hash(seed * 7 + i * 7.11), r3 = hash(seed + i * 3.3), hh = y1 - y0 + 60;
    const y = y1 - ((r2 * hh + T * (14 + r3 * 30)) % hh), x = x0 + r1 * (x1 - x0) + Math.sin(T * .8 + i) * 14;
    const a = a0 * (.3 + .7 * hash(i + seed * 2)) * (.55 + .45 * Math.sin(T * 2 + i * 1.7));
    c.fillStyle = `rgba(${col},${a})`; c.beginPath(); c.arc(x, y, 1.2 + r3 * 2.2, 0, TAU); c.fill();
  }
}
function lightRays(c, x, y, ang, spread, len, a, T) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let k = 0; k < 6; k++) {
    const aa = ang + (k - 2.5) * spread / 6 + Math.sin(T * .3 + k) * .01;
    const g = c.createLinearGradient(x, y, x + Math.cos(aa) * len, y + Math.sin(aa) * len);
    g.addColorStop(0, `rgba(255,220,160,${a * (.5 + .5 * hash(k))})`); g.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x, y);
    c.lineTo(x + Math.cos(aa - .03) * len, y + Math.sin(aa - .03) * len); c.lineTo(x + Math.cos(aa + .03) * len, y + Math.sin(aa + .03) * len); c.closePath(); c.fill();
  }
  c.restore();
}

// ---------- texte ----------
function txt(c, s, x, y, size, o = {}) {
  c.save(); c.font = `${o.weight || 700} ${size}px ${o.font || 'Oswald'}`; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'alphabetic';
  if ('letterSpacing' in c && o.ls) c.letterSpacing = o.ls + 'px';
  if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.blur ?? 12; c.shadowOffsetY = o.sy ?? 3; }
  c.fillStyle = o.fill || '#fff'; c.fillText(s, x, y);
  if (o.stroke) { c.shadowColor = 'transparent'; c.lineWidth = o.lw || 2; c.strokeStyle = o.stroke; c.strokeText(s, x, y); }
  c.restore();
}
