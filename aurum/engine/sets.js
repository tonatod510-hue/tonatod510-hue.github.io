'use strict';
/* =====================================================================
   DÉCORS d'Aurum (noir & or). Tous en coordonnées 1920×1080, avec des
   marges pour les mouvements de caméra.
   ===================================================================== */
const M = 500; // marge hors cadre

// ---------- éléments communs ----------
function wall(c, top, bot, o = {}) {
  c.fillStyle = vGrad(c, top, bot, [[0, o.c0 || '#140f0a'], [1, o.c1 || '#2c2115']]); c.fillRect(-M, top, W + 2 * M, bot - top);
  if (o.stripes) { c.fillStyle = 'rgba(0,0,0,.18)'; for (let x = -M; x < W + M; x += 64) c.fillRect(x, top, 26, bot - top); }
  if (o.motif) { c.fillStyle = 'rgba(214,170,102,.10)'; for (let y = top + 30; y < bot - 20; y += 70) for (let x = -M + ((y / 70) % 2) * 32; x < W + M; x += 64) { c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); } }
  c.fillStyle = PAT.dark; c.globalAlpha = .25; c.fillRect(-M, top, W + 2 * M, bot - top); c.globalAlpha = 1;
}
function floorWood(c, y0, o = {}) {
  c.fillStyle = vGrad(c, y0, H + M, [[0, o.c0 || '#3a2a18'], [1, o.c1 || '#120c07']]); c.fillRect(-M, y0, W + 2 * M, H + M - y0);
  const vx = o.vx ?? W / 2, vy = y0 - 900; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2.2;
  for (let i = -24; i <= 24; i++) { const bx = vx + i * 120, by = H + M, t0 = (y0 - vy) / (by - vy); c.beginPath(); c.moveTo(vx + (bx - vx) * t0, y0); c.lineTo(bx, by); c.stroke(); }
  for (let k = 1; k < 12; k++) { const yy = y0 + Math.pow(k, 1.6) * 9; c.beginPath(); c.moveTo(-M, yy); c.lineTo(W + M, yy); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-M, y0 - 4, W + 2 * M, 8); c.fillStyle = 'rgba(214,170,102,.25)'; c.fillRect(-M, y0 - 6, W + 2 * M, 2);
}
function floorTiles(c, y0, o = {}) {
  c.fillStyle = vGrad(c, y0, H + M, [[0, o.c0 || '#4a3820'], [1, o.c1 || '#15100a']]); c.fillRect(-M, y0, W + 2 * M, H + M - y0);
  const vx = o.vx ?? W / 2, vy = y0 - 600; c.strokeStyle = 'rgba(0,0,0,.38)'; c.lineWidth = 2.2;
  for (let i = -30; i <= 30; i++) { const bx = vx + i * 160, by = H + M, t0 = (y0 - vy) / (by - vy); c.beginPath(); c.moveTo(vx + (bx - vx) * t0, y0); c.lineTo(bx, by); c.stroke(); }
  for (let k = 1; k < 14; k++) { const yy = y0 + (Math.pow(1.38, k) - 1) * 14; c.beginPath(); c.moveTo(-M, yy); c.lineTo(W + M, yy); c.stroke(); }
}
function skyGrad(c, top, bot, mode) {
  const P = { night: ['#06070b', '#10131a', '#1d1a17'], dawn: ['#1a1410', '#5a3d22', '#d79b52'], day: ['#2a1f14', '#6b4b28', '#c8955a'], dusk: ['#0e0b09', '#3a2716', '#a06a35'] }[mode];
  c.fillStyle = vGrad(c, top, bot, [[0, P[0]], [.6, P[1]], [1, P[2]]]); c.fillRect(-M, top, W + 2 * M, bot - top);
}
function stars(c, n, box, T, a = 1) { for (let i = 0; i < n; i++) { const x = box[0] + hash(i * 3.1) * (box[2] - box[0]), y = box[1] + hash(i * 7.7) * (box[3] - box[1]); c.fillStyle = `rgba(245,225,185,${a * (.35 + .65 * (.5 + .5 * Math.sin(T * 2 + i)))})`; c.beginPath(); c.arc(x, y, .8 + hash(i) * 1.8, 0, TAU); c.fill(); } }
function skyline(c, base, scale, mode, T, seed = 1, tone = 2) {
  // dômes, tours et flèches d'Aurum
  let x = -M; let k = 0;
  while (x < W + M) {
    const w = (80 + hash(seed + k * 1.7) * 160) * scale, h = (120 + hash(seed + k * 2.3) * 300) * scale, kind = Math.floor(hash(seed + k * 5.1) * 4);
    const p = new Path2D();
    p.rect(x, base - h, w, h);
    if (kind === 0) { p.moveTo(x, base - h); p.bezierCurveTo(x, base - h - w * .9, x + w, base - h - w * .9, x + w, base - h); p.moveTo(x + w / 2 + 3, base - h - w * .68); p.rect(x + w / 2 - 3, base - h - w * .68 - 50 * scale, 6, 50 * scale); }
    if (kind === 1) { p.moveTo(x + w * .3, base - h); p.lineTo(x + w * .5, base - h - 160 * scale); p.lineTo(x + w * .7, base - h); }
    if (kind === 2) { p.rect(x + w * .3, base - h - 90 * scale, w * .4, 90 * scale); p.moveTo(x + w * .3, base - h - 90 * scale); p.bezierCurveTo(x + w * .3, base - h - 150 * scale, x + w * .7, base - h - 150 * scale, x + w * .7, base - h - 90 * scale); }
    c.fillStyle = mode === 'night' ? ['#0c0d11', '#14151a', '#1b1a1a'][tone % 3] : goldGrad(c, x, x + w, tone);
    c.fill(p);
    if (mode !== 'night') { c.save(); c.clip(p); c.fillStyle = PAT.dark; c.globalAlpha = .5; c.fillRect(x + w * .55, base - h - 400, w, h + 400); c.restore(); }
    // fenêtres
    for (let wy = base - h + 20 * scale; wy < base - 20 * scale; wy += 34 * scale) for (let wx = x + 12 * scale; wx < x + w - 16 * scale; wx += 26 * scale) {
      const on = hash(seed * 9 + wx * .37 + wy * .11) > (mode === 'night' ? .62 : .82);
      if (on) { c.fillStyle = mode === 'night' ? `rgba(255,205,120,${.55 + .4 * Math.sin(T * .7 + wx)})` : 'rgba(40,25,10,.55)'; c.fillRect(wx, wy, 9 * scale, 14 * scale); }
    }
    x += w + (6 + hash(seed + k) * 30) * scale; k++;
  }
}
function sun(c, x, y, r, a = 1) {
  glow(c, x, y, r * 4, 'rgba(255,210,140,A)', .5 * a);
  const g = c.createRadialGradient(x - r * .25, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#fff3d2'); g.addColorStop(.6, '#f3c983'); g.addColorStop(1, '#d99a52');
  c.save(); c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
}
function curtain(c, x, top, w, h, open, side) {
  const ww = w * (1 - open * .7); const x0 = side < 0 ? x : x + w - ww;
  const p = new Path2D(); p.moveTo(x0, top); p.lineTo(x0 + ww, top);
  const n = 6; for (let k = n; k >= 0; k--) { const xx = x0 + ww * k / n; p.lineTo(xx + Math.sin(k * 1.7) * 6, top + h + (k % 2 ? 10 : 0)); }
  p.closePath(); paint(c, p, { fill: goldGrad(c, x0, x0 + ww, 2), dots: PAT.dark, dx: x0 + ww * .5, da: .5, stroke: '#0c0804', lw: 3 });
  c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; for (let k = 1; k < 6; k++) { const xx = x0 + ww * k / 6; c.beginPath(); c.moveTo(xx, top + 10); c.lineTo(xx + Math.sin(k) * 6, top + h); c.stroke(); }
}
function frameGold(c, x, y, w, h, inner) {
  const o = rect(x - 16, y - 16, w + 32, h + 32, 6); paint(c, o, { fill: goldGrad(c, x, x + w, 0), dots: PAT.dark, dx: x + w * .6, da: .6, stroke: '#140d06', lw: 3 });
  const i = rect(x, y, w, h, 3); c.save(); c.clip(i); inner && inner(c); c.restore(); c.strokeStyle = '#140d06'; c.lineWidth = 3; c.stroke(i);
}
function plant(c, x, base, s) {
  const pot = new Path2D(); pot.moveTo(x - 40 * s, base - 90 * s); pot.lineTo(x + 40 * s, base - 90 * s); pot.lineTo(x + 30 * s, base); pot.lineTo(x - 30 * s, base); pot.closePath();
  for (let k = 0; k < 7; k++) { const a = -PI / 2 + (k - 3) * .32; c.save(); c.translate(x, base - 90 * s); c.rotate(a + PI / 2); const lf = new Path2D(); lf.ellipse(0, -80 * s, 18 * s, 80 * s, 0, 0, TAU); paint(c, lf, { fill: k % 2 ? '#6d5331' : '#8a6a3d', stroke: '#140d06', lw: 2.4 }); c.restore(); }
  paint(c, pot, { fill: goldGrad(c, x - 40 * s, x + 40 * s, 1), stroke: '#140d06', lw: 3 });
}

// ---------- CHAMBRE ----------
// o : {time:'night'|'dawn'|'evening', curtain:0..1, T, lamp:bool, clock:'05:59', rooftop: alpha Nox}
function setBedroom(c, o) {
  const T = o.T || 0, fl = 780;
  wall(c, -M, fl, { c0: '#120d09', c1: '#2a1f14', stripes: true, motif: true });
  // fenêtre
  const wx = 1180, wy = 150, ww = 520, wh = 520;
  c.save(); const win = new Path2D(); win.moveTo(wx, wy + wh); win.lineTo(wx, wy + 120); win.quadraticCurveTo(wx + ww / 2, wy - 60, wx + ww, wy + 120); win.lineTo(wx + ww, wy + wh); win.closePath(); c.clip(win);
  const mode = o.time === 'dawn' ? 'dawn' : o.time === 'evening' ? 'dusk' : 'night';
  skyGrad(c, wy - 80, wy + wh, mode);
  if (mode === 'night') stars(c, 60, [wx, wy - 60, wx + ww, wy + 300], T);
  if (mode === 'dawn') sun(c, wx + ww * .62, wy + wh * .78, 70, 1);
  if (o.centrale) centrale(c, wx + 150, wy + wh - 40, .34, T, o.centrale);
  skyline(c, wy + wh + 10, .55, mode === 'night' ? 'night' : 'day', T, 3, 2);
  if (o.rooftop != null) {
    c.fillStyle = '#0a0a0c'; c.fillRect(wx - 20, wy + wh - 150, ww + 40, 200);
    c.fillStyle = '#141418'; c.fillRect(wx + 300, wy + wh - 210, 160, 70);
    if (o.rooftop > 0) { c.save(); c.globalAlpha = o.rooftop; drawNox(c, { x: wx + 410, y: wy + wh - 150, s: .2, T, noShadow: true, glow: 2.2 }); c.restore(); }
  }
  c.restore();
  // cadre fenêtre + croisillons
  c.lineWidth = 16; c.strokeStyle = '#7a5830'; c.stroke(win); c.lineWidth = 5; c.strokeStyle = '#c9a063'; c.stroke(win);
  c.strokeStyle = '#6d5331'; c.lineWidth = 10; c.beginPath(); c.moveTo(wx + ww / 2, wy + 20); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + 300); c.lineTo(wx + ww, wy + 300); c.stroke();
  const sill = rect(wx - 30, wy + wh, ww + 60, 24, 4); paint(c, sill, { fill: goldGrad(c, wx, wx + ww, 1), stroke: '#0c0804', lw: 3 });
  if (mode !== 'night') lightRays(c, wx + ww * .5, wy + wh * .5, PI * .78, .5, 1100, mode === 'dawn' ? .14 : .08, T);
  curtain(c, wx - 90, wy - 70, 260, wh + 110, o.curtain ?? 0, -1); curtain(c, wx + ww - 170, wy - 70, 260, wh + 110, o.curtain ?? 0, 1);
  c.fillStyle = '#5a4122'; c.fillRect(wx - 120, wy - 84, ww + 240, 14);
  // dessins épinglés (elle dessine)
  const drawings = [[930, 230, 120, 90, 0], [1060, 300, 90, 120, 1], [900, 360, 110, 80, 2]];
  for (const [x, y, w, h, k] of drawings) {
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((hash(k) - .5) * .12);
    const pp = rect(-w / 2, -h / 2, w, h, 2); paint(c, pp, { fill: '#d9d2c3', stroke: '#0c0804', lw: 2 });
    c.strokeStyle = '#3a2a18'; c.lineWidth = 2;
    if (k === 0) { c.beginPath(); c.arc(-10, 6, 22, 0, TAU); for (let a = 0; a < 8; a++) { c.moveTo(-10 + Math.cos(a) * 28, 6 + Math.sin(a) * 28); c.lineTo(-10 + Math.cos(a) * 38, 6 + Math.sin(a) * 38); } c.stroke(); }
    if (k === 1) { c.beginPath(); c.moveTo(-30, 40); c.lineTo(-30, -10); c.quadraticCurveTo(0, -50, 30, -10); c.lineTo(30, 40); c.stroke(); c.beginPath(); c.arc(0, -4, 10, 0, TAU); c.stroke(); }
    if (k === 2) { c.beginPath(); c.moveTo(-40, 20); c.quadraticCurveTo(-10, -30, 10, 10); c.quadraticCurveTo(25, 30, 40, -10); c.stroke(); }
    c.fillStyle = '#c9a063'; c.beginPath(); c.arc(0, -h / 2 + 6, 4, 0, TAU); c.fill(); c.restore();
  }
  // bureau + lampe
  const desk = rect(860, 600, 300, 26, 4); paint(c, desk, { fill: goldGrad(c, 860, 1160, 1), stroke: '#0c0804', lw: 3 });
  for (const lx of [875, 1130]) { const lg = rect(lx, 626, 16, 160); paint(c, lg, { fill: '#3e2e1a', stroke: '#0c0804', lw: 2.5 }); }
  c.strokeStyle = '#140d06'; c.lineWidth = 6; c.beginPath(); c.moveTo(1100, 600); c.lineTo(1080, 520); c.lineTo(1040, 490); c.stroke();
  const shade = new Path2D(); shade.moveTo(1010, 470); shade.lineTo(1070, 470); shade.lineTo(1080, 510); shade.lineTo(1000, 510); shade.closePath(); paint(c, shade, { fill: '#c9a063', stroke: '#0c0804', lw: 2.5 });
  if (o.lamp) { glow(c, 1040, 540, 360, 'rgba(255,205,130,A)', .45); }
  for (let k = 0; k < 3; k++) { const bk = rect(900 + k * 26, 556 - k * 3, 22, 44 + k * 3, 2); paint(c, bk, { fill: ['#6d5331', '#3e3020', '#a98552'][k], stroke: '#0c0804', lw: 2 }); }
  floorWood(c, fl, { vx: 700 });
  // tapis
  c.fillStyle = 'rgba(160,110,55,.35)'; c.beginPath(); c.ellipse(820, 960, 520, 70, 0, 0, TAU); c.fill();
  // table de nuit + réveil
  const ns = rect(720, 610, 150, 180, 6); paint(c, ns, { fill: goldGrad(c, 720, 870, 2), dots: PAT.dark, dx: 800, da: .5, stroke: '#0c0804', lw: 3 });
  c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.strokeRect(735, 650, 120, 50); c.fillStyle = '#c9a063'; c.beginPath(); c.arc(795, 675, 5, 0, TAU); c.fill();
  drawClock(c, 795, 588, .55, o.clock || '05:59', T, o.ring);
}
function drawClock(c, x, y, s, time, T, ring) {
  c.save(); c.translate(x, y); c.scale(s, s); if (ring) c.rotate(Math.sin(T * 60) * .05);
  const b = rect(-80, -50, 160, 90, 16); paint(c, b, { fill: '#1a1612', stroke: '#000', lw: 4 });
  c.fillStyle = '#0a0806'; c.fillRect(-66, -38, 132, 62);
  c.save(); c.shadowColor = 'rgba(255,190,100,.9)'; c.shadowBlur = 16; c.font = '700 50px Oswald'; c.textAlign = 'center'; c.fillStyle = ring && Math.sin(T * 12) > 0 ? '#fff0c8' : '#e2b46a'; c.fillText(time, 0, 10); c.restore();
  c.fillStyle = '#2a221a'; c.fillRect(-60, 40, 20, 10); c.fillRect(40, 40, 20, 10);
  c.restore();
}
// lit vu depuis le pied (pour le cold open) : la tête d'Aya sur l'oreiller
function bedScene(c, o) {
  const T = o.T || 0;
  const hb = rect(160, 420, 560, 340, [40, 40, 4, 4]); paint(c, hb, { fill: goldGrad(c, 160, 720, 2), dots: PAT.dark, dx: 480, da: .5, stroke: '#0c0804', lw: 4 });
  c.strokeStyle = 'rgba(214,170,102,.4)'; c.lineWidth = 3; c.strokeRect(200, 460, 480, 260);
  const pil = rect(250, 560, 380, 120, 50); paint(c, pil, { fill: '#cbc4b4', dots: PAT.cloth, dx: 500, da: .3, stroke: '#0c0804', lw: 3 });
  if (o.aya !== false) {
    c.save(); c.beginPath(); c.rect(0, 0, W, 720); c.clip();
    drawPerson(c, 'ayaPJ', { x: 440, y: 1180, s: .92, T, e: o.e, look: o.look || 0, lookY: o.lookY ?? -.6, noShadow: true, tilt: o.tilt || 0, armL: 'down', armR: 'down', closedEyes: o.closedEyes });
    c.restore();
  }
  // couverture + pied du lit
  const bl = new Path2D(); bl.moveTo(130, 700); bl.quadraticCurveTo(440, 650 + (o.breath || 0), 750, 700); bl.lineTo(790, 960); bl.lineTo(90, 960); bl.closePath();
  paint(c, bl, { fill: goldGrad(c, 90, 790, 1), dots: PAT.dark, dx: 500, da: .55, stroke: '#0c0804', lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(90 + k * 140, 700); c.quadraticCurveTo(110 + k * 140, 820, 100 + k * 140, 960); c.stroke(); }
  const ft = rect(70, 950, 740, 60, 8); paint(c, ft, { fill: goldGrad(c, 70, 810, 2), stroke: '#0c0804', lw: 4 });
}

// ---------- MIROIR (plan par-dessus l'épaule) ----------
function setMirror(c, o, drawReflection) {
  const T = o.T || 0;
  wall(c, -M, 860, { c0: '#120d09', c1: '#2a1f14', stripes: true });
  floorWood(c, 860);
  const mx = 960, my = 470, rx = 300, ry = 420;
  glow(c, mx, my, 700, 'rgba(255,200,120,A)', .18);
  const fr = new Path2D(); fr.ellipse(mx, my, rx + 44, ry + 44, 0, 0, TAU);
  paint(c, fr, { fill: goldGrad(c, mx - rx, mx + rx, 0), dots: PAT.dark, dx: mx + 80, da: .6, stroke: '#140d06', lw: 4 });
  for (let k = 0; k < 32; k++) { const a = k / 32 * TAU; c.fillStyle = '#ecd29b'; c.beginPath(); c.arc(mx + Math.cos(a) * (rx + 22), my + Math.sin(a) * (ry + 22), 7, 0, TAU); c.fill(); c.strokeStyle = '#3a240c'; c.lineWidth = 2; c.stroke(); }
  const gl = new Path2D(); gl.ellipse(mx, my, rx, ry, 0, 0, TAU);
  c.save(); c.clip(gl);
  c.fillStyle = vGrad(c, my - ry, my + ry, [[0, '#3a2c1c'], [1, '#17110a']]); c.fillRect(mx - rx, my - ry, rx * 2, ry * 2);
  c.fillStyle = 'rgba(255,215,150,.25)'; c.fillRect(mx + 80, my - ry, 180, ry * 2);
  drawReflection(c, mx, my, rx, ry);
  c.strokeStyle = 'rgba(255,245,220,.12)'; c.lineWidth = 46; c.beginPath(); c.moveTo(mx - rx, my + 60); c.lineTo(mx + rx * .1, my - ry); c.stroke();
  c.lineWidth = 14; c.beginPath(); c.moveTo(mx - rx * .3, my + ry * .6); c.lineTo(mx + rx * .7, my - ry * .5); c.stroke();
  c.restore();
  c.strokeStyle = '#140d06'; c.lineWidth = 5; c.stroke(gl);
}

// ---------- CUISINE ----------
function setKitchen(c, o) {
  const T = o.T || 0, fl = 760;
  wall(c, -M, fl, { c0: '#16100a', c1: '#33261a' });
  // carrelage mural (crédence)
  c.save(); c.beginPath(); c.rect(1080, 380, 1340, 220); c.clip();
  for (let y = 380; y < 600; y += 36) for (let x = 1080 + ((y / 36) % 2) * 30; x < 2420; x += 60) { const t = rect(x, y, 58, 34, 3); paint(c, t, { fill: (Math.floor(x / 60) + Math.floor(y / 36)) % 3 ? '#4a3a26' : '#6d5331', stroke: '#140d06', lw: 1.5 }); }
  c.restore();
  // fenêtre lumineuse
  const wx = 560, wy = 160, ww = 380, wh = 330;
  c.save(); const win = rect(wx, wy, ww, wh, 6); c.clip(win); skyGrad(c, wy, wy + wh, 'dawn'); sun(c, wx + 260, wy + 250, 60, 1); skyline(c, wy + wh + 20, .4, 'day', T, 5, 1); c.restore();
  c.lineWidth = 14; c.strokeStyle = '#6d5331'; c.stroke(win); c.lineWidth = 8; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
  lightRays(c, wx + ww / 2, wy + wh / 2, PI * .35, .45, 1000, .16, T);
  // placards hauts
  for (let k = 0; k < 4; k++) { const cb = rect(1100 + k * 210, 110, 200, 220, 6); paint(c, cb, { fill: goldGrad(c, 1100 + k * 210, 1300 + k * 210, 2), dots: PAT.dark, dx: 1200 + k * 210, da: .5, stroke: '#0c0804', lw: 3 }); c.fillStyle = '#c9a063'; c.fillRect(1100 + k * 210 + 90, 290, 22, 8); }
  // plan de travail + four
  const ctr = rect(1060, 600, 1400, 200); paint(c, ctr, { fill: goldGrad(c, 1060, 2460, 2), dots: PAT.dark, dx: 1600, da: .5, stroke: '#0c0804', lw: 3 });
  const top = rect(1040, 588, 1440, 22, 4); paint(c, top, { fill: '#8a6a3d', stroke: '#0c0804', lw: 3 });
  const oven = rect(1500, 630, 260, 150, 8); paint(c, oven, { fill: '#1a1612', stroke: '#000', lw: 3 }); c.fillStyle = 'rgba(255,170,80,.35)'; c.fillRect(1525, 660, 210, 90);
  // casserole + vapeur
  const pot = rect(1560, 520, 140, 70, 12); paint(c, pot, { fill: '#2a2622', rim: '#8a857c', rx: 3, stroke: '#000', lw: 3 }); c.fillStyle = '#1a1612'; c.fillRect(1700, 540, 60, 10);
  steam(c, 1630, 515, T, 4, 1);
  // buffet + photo de famille
  const bf = rect(20, 470, 360, 300, 6); paint(c, bf, { fill: goldGrad(c, 20, 380, 2), dots: PAT.dark, dx: 250, da: .5, stroke: '#0c0804', lw: 3 });
  c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.strokeRect(45, 520, 140, 220); c.strokeRect(215, 520, 140, 220);
  familyPhoto(c, 200, 400, .55, T, o.photoGlint);
  plant(c, 320, 470, .5);
  // lampe suspendue
  c.strokeStyle = '#0c0804'; c.lineWidth = 4; c.beginPath(); c.moveTo(700, -M); c.lineTo(700, 120); c.stroke();
  const lamp = new Path2D(); lamp.moveTo(640, 170); lamp.quadraticCurveTo(700, 90, 760, 170); lamp.closePath(); paint(c, lamp, { fill: '#c9a063', stroke: '#0c0804', lw: 3 });
  glow(c, 700, 200, 520, 'rgba(255,205,130,A)', .32);
  floorTiles(c, fl, { c0: '#3a2c1a', c1: '#110c07', vx: 900 });
}
function steam(c, x, y, T, n, a) { c.lineWidth = 4; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const ph = (T * .45 + i / n) % 1; c.strokeStyle = `rgba(240,230,210,${a * .35 * Math.sin(PI * ph)})`; c.beginPath(); for (let j = 0; j <= 10; j++) { const px = x + (i - n / 2) * 14 + Math.sin(j * .7 + T * 3 + i) * 8, py = y - ph * 120 - j * 8; j ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); } }
function familyPhoto(c, x, y, s, T, glint = 0) {
  focusMark(c, 'photo', x, y, s); FOCUS_OFF++; // les personnages de la photo ne comptent pas pour le cadrage
  c.save(); c.translate(x, y); c.scale(s, s);
  frameGold(c, -130, -100, 260, 190, (x2) => {
    x2.fillStyle = vGrad(x2, -100, 90, [[0, '#5a4630'], [1, '#2a1f14']]); x2.fillRect(-130, -100, 260, 190);
    drawPerson(x2, 'mom', { x: -55, y: 260, s: .45, T: 0, expr: 'smile', noShadow: true });
    drawPerson(x2, CHARS.dad, { x: 45, y: 270, s: .47, T: 0, expr: 'smile', noShadow: true, armL: { tx: -150, ty: -470 } });
    drawPerson(x2, 'timi', { x: -10, y: 180, s: .36, T: 0, expr: 'happy', noShadow: true });
    drawPerson(x2, 'aya', { x: 95, y: 190, s: .34, T: 0, expr: 'smile', noShadow: true });
    // reflet doré qui masque le visage du père
    const g = x2.createRadialGradient(45, -30, 5, 45, -30, 70); g.addColorStop(0, `rgba(255,235,190,${.95})`); g.addColorStop(1, 'rgba(255,235,190,0)'); x2.fillStyle = g; x2.fillRect(-30, -100, 150, 140);
    if (glint) { x2.fillStyle = `rgba(255,255,255,${.25 * glint})`; x2.fillRect(-130, -100, 260, 190); }
  });
  const st = new Path2D(); st.moveTo(-30, 106); st.lineTo(30, 106); st.lineTo(60, 160); st.lineTo(-60, 160); st.closePath(); paint(c, st, { fill: '#6d5331', stroke: '#0c0804', lw: 3 });
  c.restore(); FOCUS_OFF--;
}
// table vue de face (cache le bas des personnages assis)
function kitchenTable(c, x, y, w, T, bowls = true) {
  const tp = new Path2D(); tp.moveTo(x - w / 2, y); tp.lineTo(x + w / 2, y); tp.lineTo(x + w / 2 + 40, y + 60); tp.lineTo(x - w / 2 - 40, y + 60); tp.closePath();
  paint(c, tp, { fill: goldGrad(c, x - w / 2, x + w / 2, 0), dots: PAT.dark, dx: x + w * .2, da: .5, stroke: '#0c0804', lw: 3 });
  const ap = rect(x - w / 2 - 40, y + 60, w + 80, 34); paint(c, ap, { fill: goldGrad(c, x - w / 2, x + w / 2, 1), stroke: '#0c0804', lw: 3 });
  for (const lx of [x - w / 2 - 20, x + w / 2 + 4]) { const lg = rect(lx, y + 94, 18, 230); paint(c, lg, { fill: '#3e2e1a', stroke: '#0c0804', lw: 2.5 }); }
  if (!bowls) return;
  for (const [bx, k] of [[x - 180, 0], [x + 40, 1], [x + 230, 2]]) {
    const b = new Path2D(); b.moveTo(bx - 50, y + 10); b.quadraticCurveTo(bx, y + 70, bx + 50, y + 10); b.closePath(); paint(c, b, { fill: '#d9d2c3', stroke: '#0c0804', lw: 2.5 });
    c.fillStyle = '#c9a063'; c.beginPath(); c.ellipse(bx, y + 12, 46, 9, 0, 0, TAU); c.fill(); c.stroke();
    if (k === 1) steam(c, bx, y, T, 3, .8);
  }
  const cup = rect(x + 120, y - 30, 40, 44, 6); paint(c, cup, { fill: '#e2c08a', stroke: '#0c0804', lw: 2.5 });
}

// ---------- ENTRÉE ----------
function setEntrance(c, o) {
  const T = o.T || 0, fl = 800;
  wall(c, -M, fl, { c0: '#140e09', c1: '#2e2216', stripes: true, motif: true });
  const dx = 760, dy = 170, dw = 400, dh = 630, open = o.open || 0;
  // ouverture lumineuse derrière la porte
  c.save(); c.beginPath(); c.rect(dx, dy, dw, dh); c.clip(); c.fillStyle = vGrad(c, dy, dy + dh, [[0, '#fff0cc'], [1, '#d6a35c']]); c.fillRect(dx, dy, dw, dh); skyline(c, dy + dh - 120, .35, 'day', T, 8, 0); c.restore();
  if (open > 0) lightRays(c, dx + dw / 2, dy + dh / 2, PI * .5, 1.4 * open, 900, .2 * open, T);
  // porte (pivote)
  const pw = dw * (1 - open * .85);
  const door = rect(dx, dy, pw, dh, 4); paint(c, door, { fill: goldGrad(c, dx, dx + pw, 2), dots: PAT.dark, dx: dx + pw * .6, da: .5, stroke: '#0c0804', lw: 4 });
  if (pw > 120) { c.strokeStyle = 'rgba(214,170,102,.5)'; c.lineWidth = 3; c.strokeRect(dx + pw * .12, dy + 50, pw * .76, 220); c.strokeRect(dx + pw * .12, dy + 330, pw * .76, 250); c.fillStyle = '#e2c08a'; c.beginPath(); c.arc(dx + pw - 40, dy + 340, 12, 0, TAU); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke(); }
  const jamb = new Path2D(); jamb.rect(dx - 30, dy - 30, dw + 60, dh + 30); jamb.rect(dx, dy, dw, dh); c.fillStyle = '#6d5331'; c.fill(jamb, 'evenodd'); c.strokeStyle = '#0c0804'; c.lineWidth = 3; c.stroke(jamb);
  // portemanteau + chaussures
  c.fillStyle = '#5a4122'; c.fillRect(260, 260, 300, 18); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(290 + k * 80, 290, 10, 0, TAU); c.fill(); }
  const coat = new Path2D(); coat.moveTo(350, 290); coat.lineTo(310, 520); coat.lineTo(400, 520); coat.closePath(); paint(c, coat, { fill: '#3a3634', stroke: '#000', lw: 2.5 });
  const sr = rect(1300, 700, 300, 90, 6); paint(c, sr, { fill: goldGrad(c, 1300, 1600, 2), stroke: '#0c0804', lw: 3 });
  for (let k = 0; k < 4; k++) { const sh = rect(1320 + k * 70, 668, 56, 32, [14, 14, 5, 5]); paint(c, sh, { fill: k % 2 ? '#e8e6e1' : '#6d5331', stroke: '#000', lw: 2 }); }
  plant(c, 1720, 800, .9);
  floorWood(c, fl, { vx: 960 });
}

// ---------- RUE D'AURUM (travelling, parallaxe) ----------
function setStreet(c, o) {
  const T = o.T || 0, scroll = o.scroll || 0, fl = 820, dusk = o.time === 'dusk';
  skyGrad(c, -M, 700, dusk ? 'dusk' : 'day'); sun(c, 1500 - scroll * .05, dusk ? 600 : 260, dusk ? 150 : 90, 1);
  c.save(); c.translate(-scroll * .15, 0); skyline(c, 640, 1.0, dusk ? 'night' : 'day', T, 11, 1); c.restore();
  c.save(); c.translate(-scroll * .35, 0); skyline(c, 720, 1.25, dusk ? 'night' : 'day', T, 17, 2); c.restore();
  if (o.centrale) { // la Centrale, au bout de la rue, devant la ville (un léger voile de distance)
    centrale(c, (o.centraleX ?? 1350) - scroll * .08, 740, o.centraleS ?? .64, T, o.centrale);
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = dusk ? 'rgba(90,50,30,.18)' : 'rgba(200,160,110,.16)'; c.fillRect(-M, 150, W + 2 * M, 600); c.restore();
  }
  // façades de premier plan avec arches et auvents
  c.save(); c.translate(-scroll * .7, 0);
  for (let k = -2; k < 16; k++) {
    const x = k * 420, h = 560 + hash(k * 3.3) * 120, top = fl - h;
    if (o.gap && x - scroll * .7 + 410 > o.gap[0] && x - scroll * .7 < o.gap[1]) { // ouverture (place / belvédère) : on voit l'horizon
      const bal = rect(x - 6, fl - 96, 422, 96); paint(c, bal, { fill: '#2a1d10', dots: PAT.dark, dx: x + 200, da: .5, stroke: '#140d06', lw: 3 });
      c.fillStyle = '#c9a063'; c.fillRect(x - 6, fl - 100, 422, 8); c.fillStyle = '#140d06'; for (let b = 0; b < 8; b++) c.fillRect(x + 14 + b * 52, fl - 88, 12, 80);
      continue;
    }
    const f = rect(x, top, 410, h); paint(c, f, { fill: goldGrad(c, x, x + 410, k % 2 ? 1 : 0), dots: PAT.dark, dx: x + 250, da: .55, stroke: '#140d06', lw: 3 });
    c.fillStyle = '#140d06'; c.fillRect(x, top, 410, 16);
    for (let j = 0; j < 3; j++) { const ax = x + 30 + j * 130, ay = top + 80; const a = new Path2D(); a.moveTo(ax, ay + 150); a.lineTo(ax, ay + 40); a.quadraticCurveTo(ax + 50, ay - 10, ax + 100, ay + 40); a.lineTo(ax + 100, ay + 150); a.closePath(); paint(c, a, { fill: hash(k * 7 + j) > .6 ? '#ffd79a' : '#2a1f14', stroke: '#140d06', lw: 3 }); }
    if (hash(k * 5.5) > .4) { const aw = new Path2D(); aw.moveTo(x + 20, fl - 260); aw.lineTo(x + 390, fl - 260); aw.lineTo(x + 410, fl - 180); aw.lineTo(x, fl - 180); aw.closePath(); paint(c, aw, { fill: k % 3 ? '#8a6a3d' : '#3e3020', stroke: '#140d06', lw: 3 }); c.fillStyle = 'rgba(255,240,200,.35)'; for (let s = 0; s < 8; s++) c.fillRect(x + 20 + s * 48, fl - 258, 22, 76);
      // étal du marché
      const st = rect(x + 60, fl - 140, 290, 70, 4); paint(c, st, { fill: '#5a4122', stroke: '#140d06', lw: 3 }); for (let s = 0; s < 9; s++) { c.fillStyle = ['#e2c08a', '#c9a063', '#8a6a3d'][s % 3]; c.beginPath(); c.arc(x + 85 + s * 30, fl - 146, 14, 0, TAU); c.fill(); c.strokeStyle = '#140d06'; c.lineWidth = 2; c.stroke(); } }
    // graffiti (masque-éclipse)
    if (k === 5) { // graffiti : le masque-éclipse de Nox (anneau d'or, deux fentes)
      c.save(); c.translate(x + 300, top + 330); c.globalAlpha = .9;
      c.shadowColor = 'rgba(255,190,100,.9)'; c.shadowBlur = 22; c.strokeStyle = '#f0c983'; c.lineWidth = 9; c.beginPath(); c.ellipse(0, 0, 54, 62, 0, 0, TAU); c.stroke(); c.shadowBlur = 0;
      c.fillStyle = '#070709'; c.beginPath(); c.ellipse(0, 0, 50, 58, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(240,201,131,.55)'; for (const [dx, h] of [[-30, 34], [6, 52], [34, 26]]) c.fillRect(dx, 58, 3.5, h);
      c.shadowColor = 'rgba(255,200,120,.9)'; c.shadowBlur = 12; c.fillStyle = '#f6d9a0';
      for (const sd of [-1, 1]) { c.save(); c.translate(sd * 20, -6); c.rotate(sd * .12); c.beginPath(); c.moveTo(-15, 0); c.quadraticCurveTo(0, -6, 15, 0); c.quadraticCurveTo(0, 3.5, -15, 0); c.fill(); c.restore(); }
      c.restore(); }
    if (dusk) { // crépuscule : façades assombries, fenêtres allumées
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#93705a'; c.fillRect(x - 2, top - 2, 414, h + 4); c.restore();
      c.save(); c.globalCompositeOperation = 'screen'; for (let j = 0; j < 3; j++) if (hash(k * 7 + j) > .6) glow(c, x + 80 + j * 130, top + 170, 120, 'rgba(255,200,120,A)', .45); c.restore();
    }
    // lampadaire
    const lx = x + 405; c.fillStyle = '#140d06'; c.fillRect(lx - 5, fl - 420, 10, 420); c.beginPath(); c.arc(lx, fl - 430, 16, 0, TAU); c.fill(); glow(c, lx, fl - 430, 60, 'rgba(255,210,140,A)', .5);
  }
  c.restore();
  // trottoir + rue
  c.fillStyle = vGrad(c, fl, H + M, [[0, '#4a3820'], [1, '#1a130b']]); c.fillRect(-M, fl, W + 2 * M, H + M - fl);
  c.save(); c.translate(-((scroll * 1.0) % 120), 0); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let x = -M; x < W + M + 120; x += 120) { c.beginPath(); c.moveTo(x, fl); c.lineTo(x - 60, fl + 120); c.stroke(); } c.restore();
  c.fillStyle = '#140d06'; c.fillRect(-M, fl + 118, W + 2 * M, 10); c.fillStyle = 'rgba(214,170,102,.35)'; c.fillRect(-M, fl + 116, W + 2 * M, 3);
}

// ---------- PORTAIL DU LYCÉE ----------
function setGate(c, o) {
  const T = o.T || 0, fl = 860;
  skyGrad(c, -M, 760, 'day'); sun(c, 1500, 230, 80, 1);
  skyline(c, 700, .9, 'day', T, 23, 2);
  // bâtiment principal au fond
  const bx = 560, bw = 800; const bd = rect(bx, 300, bw, 460); paint(c, bd, { fill: goldGrad(c, bx, bx + bw, 1), dots: PAT.dark, dx: bx + 500, da: .5, stroke: '#140d06', lw: 3 });
  for (let j = 0; j < 6; j++) for (let r = 0; r < 2; r++) { const w2 = rect(bx + 40 + j * 128, 360 + r * 170, 70, 120, [35, 35, 3, 3]); paint(c, w2, { fill: hash(j + r * 7) > .5 ? '#ffd79a' : '#2a1f14', stroke: '#140d06', lw: 3 }); }
  const tw = rect(900, 120, 120, 200); paint(c, tw, { fill: goldGrad(c, 900, 1020, 0), dots: PAT.dark, dx: 970, da: .5, stroke: '#140d06', lw: 3 });
  const dome = new Path2D(); dome.moveTo(890, 124); dome.bezierCurveTo(890, 30, 1030, 30, 1030, 124); dome.closePath(); paint(c, dome, { fill: '#c9a063', stroke: '#140d06', lw: 3 });
  schoolClock(c, 960, 210, 42, o.hour ?? 7, o.min ?? 55);
  // arbres dorés
  for (const [tx, ts] of [[300, 1.2], [1660, 1.3], [160, .9], [1800, .9]]) goldTree(c, tx, fl - 40, ts, T);
  // murs + grilles
  for (const sd of [-1, 1]) { const wl = rect(sd < 0 ? -M : 1340, 640, sd < 0 ? 580 + M : 600 + M, 220); paint(c, wl, { fill: goldGrad(c, 0, W, 2), dots: PAT.dark, dx: 960, da: .5, stroke: '#140d06', lw: 3 }); }
  // piliers + arche
  for (const px of [520, 1400]) { const p = rect(px - 60, 260, 120, 600); paint(c, p, { fill: goldGrad(c, px - 60, px + 60, 0), dots: PAT.dark, dx: px + 10, da: .6, stroke: '#140d06', lw: 4 }); const cap = rect(px - 80, 230, 160, 40, 4); paint(c, cap, { fill: '#c9a063', stroke: '#140d06', lw: 3 }); const lan = rect(px - 22, 170, 44, 60, 8); paint(c, lan, { fill: '#2a1f14', stroke: '#140d06', lw: 3 }); glow(c, px, 200, 90, 'rgba(255,210,140,A)', .6); c.fillStyle = '#ffe2a8'; c.fillRect(px - 12, 182, 24, 36); }
  const arch = new Path2D(); arch.moveTo(460, 330); arch.quadraticCurveTo(960, 120, 1460, 330); arch.lineTo(1460, 300); arch.quadraticCurveTo(960, 80, 460, 300); arch.closePath(); paint(c, arch, { fill: '#c9a063', stroke: '#140d06', lw: 3 });
  const plaque = rect(700, 236, 520, 74, 10); paint(c, plaque, { fill: '#1a140d', stroke: '#c9a063', lw: 5 });
  txt(c, "LYCÉE D'AURUM", 960, 290, 52, { fill: '#e8c88a', ls: 6, shadow: 'rgba(255,190,100,.6)', blur: 14, sy: 0 });
  // grilles ouvertes
  for (const sd of [-1, 1]) { const gx = sd < 0 ? 580 : 1340; c.strokeStyle = '#140d06'; c.lineWidth = 9; for (let k = 0; k < 6; k++) { const x = gx + sd * -k * 26 - (sd < 0 ? 0 : 0); c.beginPath(); c.moveTo(gx + (sd < 0 ? -k * 24 - 20 : k * 24 + 20), 380); c.lineTo(gx + (sd < 0 ? -k * 24 - 20 : k * 24 + 20), fl); c.stroke(); } c.strokeStyle = '#c9a063'; c.lineWidth = 4; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(gx + (sd < 0 ? -k * 24 - 20 : k * 24 + 20), 380); c.lineTo(gx + (sd < 0 ? -k * 24 - 20 : k * 24 + 20), fl); c.stroke(); } }
  floorTiles(c, fl, { vx: 960 });
}
function schoolClock(c, x, y, r, h, m) {
  const f = new Path2D(); f.arc(x, y, r, 0, TAU); paint(c, f, { fill: '#efe6d2', stroke: '#140d06', lw: 4 });
  c.strokeStyle = '#140d06'; c.lineWidth = 2; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); c.lineTo(x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92); c.stroke(); }
  const am = m / 60 * TAU - PI / 2, ah = (h % 12 + m / 60) / 12 * TAU - PI / 2;
  c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ah) * r * .5, y + Math.sin(ah) * r * .5); c.stroke();
  c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(am) * r * .78, y + Math.sin(am) * r * .78); c.stroke();
}
// feuillage : union de cercles, contour net autour de l'ensemble (pas de cercles visibles à l'intérieur)
function canopy(c, L, T, dx) {
  const P = g => { const p = new Path2D(); for (const [lx, ly, r] of L) { const xx = lx + Math.sin(T * .8 + lx) * 3; p.moveTo(xx + r + g, ly); p.arc(xx, ly, r + g, 0, TAU); } return p; };
  c.fillStyle = '#140d06'; c.fill(P(4));
  const xs = L.map(l => l[0]); const p0 = P(0);
  paint(c, p0, { fill: goldGrad(c, Math.min(...xs) - 150, Math.max(...xs) + 150, 0), dots: PAT.dark, dx, da: .55, stroke: false });
  c.save(); c.clip(p0); c.strokeStyle = 'rgba(60,40,15,.35)'; c.lineWidth = 3; for (const [lx, ly, r] of L) { c.beginPath(); c.arc(lx, ly + r * .25, r * .7, PI * 1.1, PI * 1.6); c.stroke(); } c.restore();
}
function goldTree(c, x, base, s, T) {
  const tr = new Path2D(); tr.moveTo(x - 22 * s, base); tr.quadraticCurveTo(x - 10 * s, base - 160 * s, x - 30 * s, base - 300 * s); tr.lineTo(x + 26 * s, base - 300 * s); tr.quadraticCurveTo(x + 10 * s, base - 160 * s, x + 22 * s, base); tr.closePath();
  paint(c, tr, { fill: '#3e2e1a', stroke: '#140d06', lw: 3 });
  const L = []; for (let k = 0; k < 9; k++) L.push([x + (hash(k * 3 + s) - .5) * 260 * s, base - 330 * s - hash(k * 7 + s) * 170 * s, (70 + hash(k * 11) * 50) * s]);
  canopy(c, L, T, x + 40 * s);
}

// ---------- COUR ----------
function setCourtyard(c, o) {
  const T = o.T || 0, fl = 700;
  skyGrad(c, -M, 400, 'day');
  // façade
  const fx = -M, fw = W + 2 * M; const fa = rect(fx, 120, fw, fl - 120); paint(c, fa, { fill: goldGrad(c, 0, W, 1), dots: PAT.dark, dx: 1300, da: .5, stroke: '#140d06', lw: 3 });
  c.fillStyle = '#140d06'; c.fillRect(fx, 120, fw, 18);
  for (let j = -3; j < 14; j++) { const ax = j * 170 + 20; const a = new Path2D(); a.moveTo(ax, fl); a.lineTo(ax, 420); a.quadraticCurveTo(ax + 60, 340, ax + 120, 420); a.lineTo(ax + 120, fl); a.closePath(); paint(c, a, { fill: '#1d150d', stroke: '#140d06', lw: 3 }); const w2 = rect(ax + 20, 190, 80, 130, [40, 40, 3, 3]); paint(c, w2, { fill: hash(j * 3) > .5 ? '#ffd79a' : '#2a1f14', stroke: '#140d06', lw: 3 }); }
  // tour de l'horloge
  const tw = rect(860, -120, 200, 260); paint(c, tw, { fill: goldGrad(c, 860, 1060, 0), dots: PAT.dark, dx: 980, da: .5, stroke: '#140d06', lw: 3 });
  schoolClock(c, 960, 40, 62, o.hour ?? 7, o.min ?? 58);
  floorTiles(c, fl, { c0: '#5a4428', c1: '#171009', vx: 960 });
  // fontaine
  if (o.fountain !== false) {
    const bs = new Path2D(); bs.ellipse(o.fx ?? 1500, 760, 210, 50, 0, 0, TAU); paint(c, bs, { fill: goldGrad(c, 1290, 1710, 0), stroke: '#140d06', lw: 4 });
    c.fillStyle = 'rgba(255,230,180,.6)'; c.beginPath(); c.ellipse(o.fx ?? 1500, 758, 180, 36, 0, 0, TAU); c.fill();
    const col = rect((o.fx ?? 1500) - 20, 620, 40, 140); paint(c, col, { fill: '#c9a063', stroke: '#140d06', lw: 3 });
    for (let k = 0; k < 6; k++) { const ph = (T * 1.2 + k / 6) % 1; c.fillStyle = `rgba(255,240,210,${.7 * (1 - ph)})`; c.beginPath(); c.arc((o.fx ?? 1500) + (k - 2.5) * 22 * ph, 620 - Math.sin(ph * PI) * 50 + ph * 40, 4, 0, TAU); c.fill(); }
  }
  goldTree(c, 140, fl + 20, 1.1, T); goldTree(c, 1800, fl + 20, 1.0, T);
  // bancs
  for (const bx of [380, 1100]) { const b = rect(bx, 700, 240, 22, 4); paint(c, b, { fill: '#6d5331', stroke: '#140d06', lw: 3 }); c.fillStyle = '#3e2e1a'; c.fillRect(bx + 20, 722, 14, 50); c.fillRect(bx + 206, 722, 14, 50); }
}
// figurants (élèves) dans le fond, avec brume de profondeur
const EXTRAS = ['st1', 'st2', 'st3', 'st4', 'st2', 'st1', 'st3', 'st4'];
function crowd(c, T, list, fog = .35) {
  for (const p of list) drawPerson(c, EXTRAS[p.k % EXTRAS.length], { x: p.x + (p.vx || 0) * T, y: p.y, s: p.s, T: T + p.k, expr: p.e || 'neutral', turn: p.turn || 0, walk: p.vx ? (T * 6 + p.k) : null, armL: p.vx ? 'swing' : 'down', armR: p.vx ? 'swing' : 'down', seed: p.k, back: p.back, talk: p.talk ? (.5 + .5 * Math.sin(T * 9 + p.k)) * (Math.sin(T * 1.3 + p.k) > 0 ? 1 : 0) : 0 });
  if (fog > 0) { c.fillStyle = `rgba(40,28,16,${fog})`; c.fillRect(-M, -M, W + 2 * M, H + 2 * M); }
}

// ---------- SALLE DE CLASSE ----------
function setClassFront(c, o) { // le tableau, vu depuis les élèves
  const T = o.T || 0, fl = 820;
  wall(c, -M, fl, { c0: '#16100a', c1: '#30241a' });
  const bx = 360, by = 160, bw = 1200, bh = 400;
  frameGold(c, bx, by, bw, bh, (x) => { x.fillStyle = vGrad(x, by, by + bh, [[0, '#1d2420'], [1, '#141a17']]); x.fillRect(bx, by, bw, bh);
    txt(x, 'HISTOIRE', bx + 60, by + 80, 52, { fill: 'rgba(240,225,190,.85)', align: 'left', weight: 600 });
    txt(x, "La fondation d'Aurum", bx + 60, by + 150, 40, { fill: 'rgba(240,225,190,.7)', align: 'left', weight: 600 });
    txt(x, '— lundi 2 septembre —', bx + bw - 60, by + 80, 30, { fill: 'rgba(240,225,190,.55)', align: 'right', weight: 600 });
    x.strokeStyle = 'rgba(240,225,190,.45)'; x.lineWidth = 3; x.beginPath(); x.arc(bx + 900, by + 250, 70, 0, TAU); for (let a = 0; a < 12; a++) { x.moveTo(bx + 900 + Math.cos(a / 12 * TAU) * 85, by + 250 + Math.sin(a / 12 * TAU) * 85); x.lineTo(bx + 900 + Math.cos(a / 12 * TAU) * 110, by + 250 + Math.sin(a / 12 * TAU) * 110); } x.stroke();
  });
  // bureau du prof
  const dk = rect(1180, 640, 420, 40, 4); paint(c, dk, { fill: goldGrad(c, 1180, 1600, 0), stroke: '#140d06', lw: 3 }); const dkf = rect(1200, 680, 380, 150); paint(c, dkf, { fill: goldGrad(c, 1200, 1580, 2), dots: PAT.dark, dx: 1400, da: .5, stroke: '#140d06', lw: 3 });
  for (let k = 0; k < 3; k++) { const bk = rect(1230 + k * 40, 600 - k * 6, 34, 40 + k * 6, 2); paint(c, bk, { fill: ['#6d5331', '#a98552', '#3e3020'][k], stroke: '#140d06', lw: 2 }); }
  const gl = new Path2D(); gl.arc(1500, 590, 42, 0, TAU); paint(c, gl, { fill: '#c9a063', dots: PAT.dark, dx: 1500, da: .6, stroke: '#140d06', lw: 3 }); c.fillStyle = '#3e2e1a'; c.fillRect(1494, 632, 12, 12);
  floorWood(c, fl, { vx: 960 });
  // fenêtre de droite (lumière)
  lightRays(c, 2100, 100, PI * .82, .45, 1400, .12, T);
}
function studentBacks(c, T, y, n = 6, start = 0) {
  for (let k = 0; k < n; k++) { const x = start + k * 340 + (k % 2) * 40; drawPerson(c, EXTRAS[k % EXTRAS.length], { x, y: y + 520, s: 1.05, T: T + k, back: true, noShadow: true, seed: k + 2, tilt: Math.sin(T * .7 + k) * .03 }); }
}
function setClassroom(c, o) { // vue des élèves (rangées de tables)
  const T = o.T || 0, fl = 640;
  wall(c, -M, fl, { c0: '#16100a', c1: '#30241a' });
  // fenêtres à droite
  for (let k = 0; k < 2; k++) { const wx = 1500 + k * 260, wy = 120; c.save(); const win = rect(wx, wy, 220, 380, [110, 110, 4, 4]); c.clip(win); skyGrad(c, wy, wy + 380, 'day'); skyline(c, wy + 400, .35, 'day', T, 31 + k, 1); c.restore(); c.lineWidth = 12; c.strokeStyle = '#6d5331'; c.stroke(rect(wx, wy, 220, 380, [110, 110, 4, 4])); }
  lightRays(c, 1700, 300, PI * .8, .6, 1600, .14, T);
  // porte à gauche
  const dr = rect(80, 180, 230, 460, 4); paint(c, dr, { fill: o.doorOpen ? '#e9c98c' : goldGrad(c, 80, 310, 2), dots: o.doorOpen ? null : PAT.dark, dx: 200, da: .5, stroke: '#140d06', lw: 4 });
  if (o.doorOpen) { const pn = rect(80, 180, 230 * (1 - o.doorOpen * .8), 460, 4); paint(c, pn, { fill: goldGrad(c, 80, 310, 2), stroke: '#140d06', lw: 4 }); lightRays(c, 195, 410, 0, 1, 700, .15 * o.doorOpen, T); }
  c.fillStyle = '#d8b273'; c.fillRect(160, 140, 80, 26); txt(c, '2NDE B', 200, 160, 20, { fill: '#140d06', weight: 700 });
  // tableau d'affichage
  frameGold(c, 520, 180, 380, 230, x => { x.fillStyle = '#3e2e1a'; x.fillRect(520, 180, 380, 230); for (let k = 0; k < 6; k++) { const p = rect(540 + (k % 3) * 120, 200 + Math.floor(k / 3) * 105, 100, 85, 2); x.fillStyle = ['#d9d2c3', '#c9a063', '#a98552'][k % 3]; x.fill(p); } });
  floorWood(c, fl, { vx: 960, c0: '#3e2e1a' });
}
function desk(c, x, y, w, s = 1) {
  const tp = new Path2D(); tp.moveTo(x - w / 2, y); tp.lineTo(x + w / 2, y); tp.lineTo(x + w / 2 + 18 * s, y + 26 * s); tp.lineTo(x - w / 2 - 18 * s, y + 26 * s); tp.closePath();
  paint(c, tp, { fill: goldGrad(c, x - w / 2, x + w / 2, 0), stroke: '#140d06', lw: 3 });
  const fr = rect(x - w / 2 - 18 * s, y + 26 * s, w + 36 * s, 90 * s); paint(c, fr, { fill: goldGrad(c, x - w / 2, x + w / 2, 2), dots: PAT.dark, dx: x, da: .5, stroke: '#140d06', lw: 3 });
}

// ---------- DÉJEUNER (banc sous l'arbre) ----------
function setLunch(c, o) {
  const T = o.T || 0, fl = 760;
  skyGrad(c, -M, 500, 'day');
  const fa = rect(-M, 200, W + 2 * M, fl - 200); paint(c, fa, { fill: goldGrad(c, 0, W, 2), dots: PAT.dark, dx: 1200, da: .5, stroke: '#140d06', lw: 3 });
  for (let j = -2; j < 13; j++) { const w2 = rect(j * 190 + 40, 280, 90, 150, [45, 45, 3, 3]); paint(c, w2, { fill: hash(j * 9) > .55 ? '#ffd79a' : '#2a1f14', stroke: '#140d06', lw: 3 }); }
  floorTiles(c, fl, { c0: '#5a4428', c1: '#171009' });
  // grand arbre doré (canopée en haut du cadre)
  const tr = rect(1460, 140, 90, fl - 120); paint(c, tr, { fill: '#3e2e1a', stroke: '#140d06', lw: 3 });
  canopy(c, Array.from({ length: 14 }, (_, k) => [900 + hash(k * 4.1) * 1100, -40 + hash(k * 8.3) * 220, 90 + hash(k) * 80]), T, 1500);
  // lumière tachetée
  for (let k = 0; k < 18; k++) { const x = 300 + hash(k * 2.2) * 1500, y = 760 + hash(k * 5.5) * 260; c.fillStyle = `rgba(255,225,160,${.12 + .08 * Math.sin(T * 1.5 + k)})`; c.beginPath(); c.ellipse(x, y, 60, 14, 0, 0, TAU); c.fill(); }
}
function lunchTable(c, x, y, w, T) {
  kitchenTable(c, x, y, w, T, false);
  for (const tx of [x - 150, x + 150]) { const tray = rect(tx - 90, y + 4, 180, 40, 6); paint(c, tray, { fill: '#8a6a3d', stroke: '#140d06', lw: 2.5 }); c.fillStyle = '#d9d2c3'; c.beginPath(); c.ellipse(tx - 30, y + 20, 40, 12, 0, 0, TAU); c.fill(); c.fillStyle = '#c9a063'; c.beginPath(); c.ellipse(tx + 40, y + 18, 18, 10, 0, 0, TAU); c.fill(); const cup = rect(tx + 58, y - 26, 26, 40, 4); paint(c, cup, { fill: '#e2c08a', stroke: '#140d06', lw: 2 }); }
}

// ---------- INSERTS ----------
function insertNote(c, o) {
  const T = o.T || 0;
  c.fillStyle = vGrad(c, 0, H, [[0, '#1d150d'], [1, '#0b0805']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  glow(c, 960, 540, 800, 'rgba(255,200,120,A)', .25);
  c.save(); c.translate(960, 560); c.rotate(-.04);
  const p = rect(-520, -300, 1040, 600, 6); c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.fillStyle = '#e6dcc6'; c.fill(p); c.restore();
  paint(c, p, { fill: '#e6dcc6', dots: PAT.dark, dx: 300, da: .15, stroke: '#140d06', lw: 3 });
  c.strokeStyle = '#c9a063'; c.lineWidth = 8; c.strokeRect(-490, -270, 980, 540);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-520, 0); c.lineTo(520, 0); c.moveTo(0, -300); c.lineTo(0, 300); c.stroke();
  const k1 = clamp(o.write1 ?? 1), k2 = clamp(o.write2 ?? 1);
  const L1 = "Ton père n'est pas parti.", L2 = 'Ne fais confiance à personne.';
  c.font = 'italic 600 64px Georgia, serif'; c.fillStyle = '#2a1a0c'; c.textAlign = 'center';
  c.fillText(L1.slice(0, Math.round(L1.length * k1)), 0, -60); c.fillText(L2.slice(0, Math.round(L2.length * k2)), 0, 40);
  if ((o.sign ?? 1) > .5) { c.font = 'italic 700 70px Georgia, serif'; c.fillText('— N.', 280, 170); }
  c.save(); c.translate(-380, 170); c.fillStyle = '#c9a063'; c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * PI / 8, r = k % 2 ? 22 : 40; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = '#2a1a0c'; c.lineWidth = 3; c.stroke(); c.restore();
  c.restore();
}
function titleCard(c, o) {
  const T = o.T || 0, k = o.k ?? 1;
  c.fillStyle = '#050403'; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  const sy = lerp(760, 610, easeOut(k));
  glow(c, 960, sy, 900 * (.5 + .5 * k), 'rgba(255,200,120,A)', .35 * k);
  c.save(); c.globalAlpha = k; sun(c, 960, sy, 170, 1); c.restore();
  c.fillStyle = '#050403'; c.fillRect(-M, 640, W + 2 * M, H);
  c.fillStyle = 'rgba(214,170,102,.6)'; c.fillRect(560, 640, 800 * easeOut(k), 3);
  const a = smooth(.25, .8, k);
  c.save(); c.globalAlpha = a;
  const g = c.createLinearGradient(0, 470, 0, 600); g.addColorStop(0, '#fbe6b8'); g.addColorStop(.5, '#dcb172'); g.addColorStop(1, '#a87a42');
  txt(c, 'AURUM', 960, 600, 230, { fill: g, ls: 40, shadow: 'rgba(0,0,0,.8)', blur: 30, sy: 6 });
  txt(c, o.sub || 'ÉPISODE 1 — LE PREMIER JOUR', 960, 720, 40, { fill: '#e8dcc4', ls: 10, weight: 600 });
  c.restore();
  dust(c, T, 60, 9, [0, 0, W, H], '245,205,135', .6 * k);
}
function endCard(c, o) {
  const k = o.k ?? 1, T = o.T || 0;
  c.fillStyle = '#050403'; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  c.save(); c.globalAlpha = smooth(0, .5, k);
  txt(c, 'À SUIVRE', 960, 520, 130, { fill: '#dcb172', ls: 26, shadow: 'rgba(255,190,100,.35)', blur: 30, sy: 0 });
  c.restore();
  c.save(); c.globalAlpha = smooth(.45, 1, k);
  txt(c, o.next || 'AURUM — ÉPISODE 2 : « N. »', 960, 640, 40, { fill: '#e8dcc4', ls: 8, weight: 600 });
  c.restore();
}

// =====================================================================
//  ÉPISODE 2
// =====================================================================
// la Centrale d'Aurum : silhouette industrielle, tour surmontée d'un anneau (éteint)
function centrale(c, x, base, s, T, a = 1) {
  c.save(); c.translate(x, base); c.scale(s, s); c.globalAlpha *= a;
  const ink = '#0e0906', rim = 'rgba(232,190,120,.55)';
  const body = new Path2D();
  body.moveTo(-330, 0); body.lineTo(-330, -170); body.lineTo(-220, -210); body.lineTo(-220, -260); body.lineTo(-60, -260); body.lineTo(-60, -560);
  body.lineTo(60, -560); body.lineTo(60, -260); body.lineTo(220, -260); body.lineTo(220, -190); body.lineTo(330, -150); body.lineTo(330, 0); body.closePath();
  c.fillStyle = ink; c.fill(body); c.strokeStyle = rim; c.lineWidth = 3; c.stroke(body);
  for (const sd of [-1, 1]) { // tours de refroidissement
    const t = new Path2D(); const cx = sd * 430;
    t.moveTo(cx - 110, 0); t.quadraticCurveTo(cx - 50, -150, cx - 80, -320); t.lineTo(cx + 80, -320); t.quadraticCurveTo(cx + 50, -150, cx + 110, 0); t.closePath();
    c.fillStyle = ink; c.fill(t); c.stroke(t);
  }
  // l'anneau au sommet (une éclipse, éteinte) + un petit feu qui clignote
  c.strokeStyle = '#2a1d10'; c.lineWidth = 22; c.beginPath(); c.arc(0, -650, 95, 0, TAU); c.stroke();
  c.strokeStyle = rim; c.lineWidth = 3; c.beginPath(); c.arc(0, -650, 107, 0, TAU); c.stroke();
  c.fillStyle = ink; c.beginPath(); c.arc(0, -650, 84, 0, TAU); c.fill();
  c.fillStyle = ink; c.fillRect(-14, -560, 28, -10);
  const bl = .5 + .5 * Math.sin(T * 3); glow(c, 0, -760, 40, 'rgba(255,190,110,A)', .7 * bl); c.fillStyle = `rgba(255,214,150,${.6 + .4 * bl})`; c.beginPath(); c.arc(0, -760, 6, 0, TAU); c.fill();
  c.strokeStyle = ink; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -745); c.lineTo(0, -560); c.stroke();
  c.restore();
}
// bibliothèque du lycée : étagères, fenêtre haute, meuble d'archives à tiroirs
function setLibrary(c, o) {
  const T = o.T || 0, fl = 880;
  wall(c, -M, fl, { c0: '#120c07', c1: '#2a1e12' });
  // fenêtre haute en arc + rayons
  const wx = 1180, wy = 110, ww = 280, wh = 560;
  const win = new Path2D(); win.moveTo(wx, wy + wh); win.lineTo(wx, wy + 140); win.quadraticCurveTo(wx + ww / 2, wy - 40, wx + ww, wy + 140); win.lineTo(wx + ww, wy + wh); win.closePath();
  c.save(); c.clip(win); skyGrad(c, wy - 40, wy + wh, 'day'); sun(c, wx + ww * .7, wy + 200, 60, 1); skyline(c, wy + wh + 10, .4, 'day', T, 23, 2); c.restore();
  c.lineWidth = 14; c.strokeStyle = '#5a4026'; c.stroke(win); c.lineWidth = 4; c.strokeStyle = '#c9a063'; c.stroke(win);
  c.strokeStyle = '#4a3420'; c.lineWidth = 8; c.beginPath(); c.moveTo(wx + ww / 2, wy + 30); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + 330); c.lineTo(wx + ww, wy + 330); c.stroke();
  // étagères
  const cols = ['#5a4026', '#7a5a34', '#3a2a1a', '#a4824c', '#2a1f14', '#c9a063', '#6d5331', '#8a6a3d'];
  for (let sh = 0; sh < 3; sh++) {
    const x0 = 40 + sh * 360, w = 340, top = 120;
    const fr = rect(x0, top, w, fl - top); paint(c, fr, { fill: '#2a1d10', dots: PAT.dark, dx: x0 + 200, da: .5, stroke: '#0c0804', lw: 4 });
    for (let r = 0; r < 6; r++) {
      const y = top + 30 + r * 122, bot = y + 104; let x = x0 + 18, k = 0;
      while (x < x0 + w - 30) {
        const bw = 20 + hash(sh * 97 + r * 13 + k) * 26, bh = 70 + hash(sh * 31 + r * 7 + k * 3) * 30, col = cols[Math.floor(hash(sh * 11 + r * 5 + k * 1.7) * cols.length)];
        const lean = hash(sh + r * 3 + k * 5) > .93 ? .18 : 0;
        c.save(); c.translate(x, bot); c.rotate(lean); const b = rect(0, -bh, bw, bh, 2); paint(c, b, { fill: col, stroke: '#0c0804', lw: 2 });
        c.fillStyle = 'rgba(232,196,130,.55)'; c.fillRect(3, -bh + 12, bw - 6, 3); c.fillRect(3, -18, bw - 6, 3); c.restore();
        x += bw + 2 + (lean ? 10 : 0); k++;
      }
      c.fillStyle = '#4a3420'; c.fillRect(x0 + 8, bot, w - 16, 14); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x0 + 8, bot + 14, w - 16, 6);
    }
  }
  // meuble d'archives
  const ax = 1520, ay = 330, aw = 360, ah = fl - ay;
  const cab = rect(ax, ay, aw, ah, 6); paint(c, cab, { fill: '#3a2a1a', dots: PAT.dark, dx: ax + 220, da: .55, stroke: '#0c0804', lw: 4 });
  c.fillStyle = '#c9a063'; c.font = '600 22px Oswald'; c.textAlign = 'center'; c.fillText('ARCHIVES', ax + aw / 2, ay - 14);
  for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) {
    const dx = ax + 16 + k * 112, dy = ay + 16 + r * 104, open = (o.drawer && r === 2 && k === 1) ? o.drawer : 0;
    const d = rect(dx, dy + open * 40, 104, 92, 4); paint(c, d, { fill: open ? '#5a4026' : '#4a3420', stroke: '#0c0804', lw: 3 });
    c.fillStyle = '#e6dcc6'; c.fillRect(dx + 30, dy + 18 + open * 40, 44, 22); c.fillStyle = '#1b140c'; c.font = '600 12px Oswald'; c.fillText(String(1900 + r * 3 + k * 15 + 60), dx + 52, dy + 34 + open * 40);
    c.fillStyle = '#d8b273'; c.beginPath(); c.arc(dx + 52, dy + 62 + open * 40, 7, 0, TAU); c.fill();
    if (open) { const f = rect(dx + 6, dy + open * 40 - 30, 92, 34, 2); paint(c, f, { fill: '#d9ceb4', stroke: '#0c0804', lw: 2 }); }
  }
  floorWood(c, fl, { vx: 960, c0: '#3a2a1a' });
  lightRays(c, wx + ww / 2, wy + 300, PI * .72, .45, 1300, .12, T);
  dust(c, T, 70, 5, [600, 100, 1500, 900], '245,215,160', .5);
}
// coupure de journal (insert plein cadre)
function newsChar(base, over) { return { ...base, ...over }; }
function insertNewspaper(c, o) {
  const T = o.T || 0;
  c.fillStyle = vGrad(c, 0, H, [[0, '#1d150d'], [1, '#0b0805']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  glow(c, 960, 520, 900, 'rgba(255,200,120,A)', .22);
  c.save(); c.translate(960, 540); c.rotate(-.025);
  const p = rect(-640, -440, 1280, 900, 4); c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 50; c.fillStyle = '#d9ceb4'; c.fill(p); c.restore();
  paint(c, p, { fill: '#d9ceb4', dots: PAT.dark, dx: 300, da: .18, stroke: '#140d06', lw: 3 });
  const ink = '#1b140c';
  c.textAlign = 'center'; c.fillStyle = ink; c.font = '700 84px Oswald'; if ('letterSpacing' in c) c.letterSpacing = '10px'; c.fillText("L'ÉCHO D'AURUM", 0, -340); if ('letterSpacing' in c) c.letterSpacing = '0px';
  c.fillRect(-600, -320, 1200, 4); c.fillRect(-600, -308, 1200, 2);
  c.font = '600 22px Oswald'; c.fillText('ÉDITION SPÉCIALE  ·  14 OCTOBRE  ·  IL Y A TROIS ANS', 0, -280);
  c.font = '700 76px Oswald'; c.fillText('AURUM PLONGÉE DANS LE NOIR', 0, -190);
  c.font = 'italic 600 40px Georgia, serif'; c.fillText("La Centrale s'éteint sans explication", 0, -130);
  // la photo
  const px = -600, py = -90, pw = 700, ph = 440;
  c.save(); const fr = rect(px, py, pw, ph); c.clip(fr);
  c.fillStyle = vGrad(c, py, py + ph, [[0, '#b9ab8c'], [1, '#8f8065']]); c.fillRect(px, py, pw, ph);
  centrale(c, px + pw * .5, py + ph - 70, .42, 0, 1);
  c.fillStyle = '#7d6f55'; c.fillRect(px, py + ph - 80, pw, 80);
  const eng = (col, hair) => newsChar(CHARS.dad, { top: { type: 'vest', color: col, shirt: '#cfc8b8' }, hair: { style: 'short', color: hair } });
  const team = [[-250, eng('#4a4440', '#222'), .34], [-160, eng('#3a3836', '#555'), .36], [60, eng('#45403c', '#333'), .35], [150, eng('#3c3a38', '#777'), .33]];
  for (const [dx, ch, sc] of team) drawPerson(c, ch, { x: px + pw / 2 + dx, y: py + ph - 20, s: sc, T: 0, expr: 'smile', noShadow: true });
  // le père : au centre, visage découpé
  const dadX = px + pw / 2 - 50, dadY = py + ph - 18, ds = .37;
  drawPerson(c, CHARS.dad, { x: dadX, y: dadY, s: ds, T: 0, expr: 'smile', noShadow: true, armR: { tx: 180, ty: -300, b: -1 } });
  // l'enfant aux cheveux blancs, de dos, à côté de lui
  const kid = newsChar(CHARS.nox, { mask: false, top: { type: 'tshirt', color: '#3a3836' }, bodyS: .8, headS: 1.05 });
  drawPerson(c, kid, { x: dadX + 75, y: dadY + 4, s: .27, T: 0, back: true, noShadow: true, armL: 'down', armR: 'down', glow: 0 });
  if (o.kidGlow) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, dadX + 75, dadY - 190, 90, 'rgba(255,220,160,A)', .35 * o.kidGlow); c.restore(); }
  // effet photo imprimée
  c.fillStyle = 'rgba(120,96,60,.28)'; c.fillRect(px, py, pw, ph);
  c.globalAlpha = .35; c.fillStyle = PAT.dark; c.fillRect(px, py, pw, ph); c.globalAlpha = 1;
  c.restore();
  // le trou : visage découpé
  const hx = dadX, hy = dadY - 622 * ds * 1.1 + 4, hr = 26;
  const hole = new Path2D(); for (let k = 0; k <= 18; k++) { const a = k / 18 * TAU, r = hr * (1 + (hash(k * 3.7) - .5) * .35); k ? hole.lineTo(hx + Math.cos(a) * r * .85, hy + Math.sin(a) * r) : hole.moveTo(hx + Math.cos(a) * r * .85, hy + Math.sin(a) * r); } hole.closePath();
  c.fillStyle = '#0b0805'; c.fill(hole); c.strokeStyle = '#efe6d2'; c.lineWidth = 3; c.stroke(hole);
  c.strokeStyle = ink; c.lineWidth = 3; c.strokeRect(px, py, pw, ph);
  c.font = 'italic 500 22px Georgia, serif'; c.textAlign = 'left'; c.fillText("L'équipe de la Centrale, la veille de la panne.", px, py + ph + 34);
  // colonnes de texte
  c.fillStyle = 'rgba(27,20,12,.55)';
  for (let col = 0; col < 2; col++) for (let k = 0; k < 15; k++) { const x0 = 140 + col * 240, w = 210 - (hash(col * 31 + k) > .85 ? 80 : 0); c.fillRect(x0, -80 + k * 30, w, 9); }
  c.restore();
}
// le badge d'accès (recto / verso)
function badgeItem(c, side) { c.save(); c.translate(0, 34); c.rotate(-.15 * side); const p = rect(-34, -4, 68, 44, 5); paint(c, p, { fill: '#1d1d22', stroke: '#c9a063', lw: 3 }); c.strokeStyle = '#c9a063'; c.lineWidth = 2; c.beginPath(); c.arc(-16, 14, 8, 0, TAU); c.stroke(); c.restore(); }
function insertBadge(c, o) {
  const T = o.T || 0, flip = o.flip || 0;
  c.fillStyle = vGrad(c, 0, H, [[0, '#2a1a10'], [1, '#08060a']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  glow(c, 960, 540, 800, 'rgba(255,170,90,A)', .25);
  c.save(); c.translate(960, 540); c.rotate(-.04 + Math.sin(T * .6) * .01);
  const sx = Math.cos(flip * PI); c.scale(Math.max(.02, Math.abs(sx)), 1);
  const card = rect(-400, -250, 800, 500, 30);
  c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 50; c.fillStyle = '#18181c'; c.fill(card); c.restore();
  if (sx >= 0) {
    paint(c, card, { fill: '#1b1b20', dots: PAT.dark2, dx: 200, da: .4, stroke: '#c9a063', lw: 6 });
    c.strokeStyle = 'rgba(201,160,99,.5)'; c.lineWidth = 2; c.strokeRect(-372, -222, 744, 444);
    // logo éclipse
    c.save(); c.translate(-280, -130); c.shadowColor = 'rgba(255,190,100,.8)'; c.shadowBlur = 16; c.strokeStyle = '#e2bd79'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 52, 0, TAU); c.stroke(); c.shadowBlur = 0; c.fillStyle = '#0a0a0c'; c.beginPath(); c.arc(4, 0, 44, 0, TAU); c.fill(); c.restore();
    txt(c, "CENTRALE D'AURUM", -200, -118, 58, { fill: '#e2bd79', align: 'left', ls: 4 });
    txt(c, 'ACCÈS · NIVEAU 3', -200, -62, 34, { fill: '#efe3cb', align: 'left', ls: 6, weight: 600 });
    // emplacement photo, arraché
    const ph = rect(140, -40, 200, 240, 6); paint(c, ph, { fill: '#2a2a30', stroke: '#c9a063', lw: 3 });
    c.fillStyle = '#e6dcc6'; c.beginPath(); c.moveTo(140, -40); c.lineTo(230, -40); c.lineTo(205, -12); c.lineTo(222, 6); c.lineTo(180, 22); c.lineTo(140, 14); c.closePath(); c.fill();
    txt(c, 'N° 0347', -340, 40, 30, { fill: '#bfae8f', align: 'left', ls: 4, weight: 600 });
    c.fillStyle = '#c9a063'; for (let k = 0; k < 38; k++) { const w = hash(k * 5.1) > .6 ? 6 : 3; c.fillRect(-340 + k * 11, 120, w, 70); }
  } else {
    paint(c, card, { fill: '#e6dcc6', dots: PAT.dark, dx: 200, da: .15, stroke: '#c9a063', lw: 6 });
    const wr = o.write ?? 1;
    c.save(); c.beginPath(); c.rect(-380, -240, 760 * wr, 480); c.clip();
    c.fillStyle = '#2a1a0c'; c.textAlign = 'center'; c.font = 'italic 600 92px Georgia, serif'; c.fillText('Minuit.', 0, -40); c.fillText('Porte Est.', 0, 80);
    c.restore();
    if ((o.sign ?? 0) > .5) { c.save(); c.fillStyle = '#9a7440'; c.font = 'italic 700 60px Georgia, serif'; c.textAlign = 'right'; c.fillText('— N.', 340, 200); c.restore(); }
  }
  c.restore();
}
