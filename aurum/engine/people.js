'use strict';
/* =====================================================================
   PERSONNAGES : corps paramétrable, coiffures, tenues, visage expressif,
   gestes (IK à 2 segments), bouche synchronisée sur la voix.
   Repère local : pieds en (0,0), le haut est en y négatif.
   ===================================================================== */

// ---------- expressions ----------
const EXPR = {
  neutral: {}, smile: { bIn: .1, bOut: .1, mc: .55, lid: .1 }, happy: { bIn: .25, bOut: .25, mc: .8, mo: .3, teeth: 1, lid: .15 },
  laugh: { bIn: .3, bOut: .3, happyEyes: 1, mc: .9, mo: .55, teeth: 1 }, sad: { bIn: .75, bOut: -.25, mc: -.5, lid: .25, ly: .35 },
  worried: { bIn: .85, bOut: -.1, wide: .15, mc: -.2, mw: .7 }, nervous: { bIn: .85, bOut: 0, wide: .22, mc: -.12, mw: .6, sweat: 1 },
  scared: { bIn: 1, bOut: .6, wide: .5, pupil: .65, mO: .55 }, surprised: { bIn: .8, bOut: .8, wide: .42, mO: .4 },
  annoyed: { bIn: -.6, bOut: .2, lid: .35, mc: -.25 }, angry: { bIn: -1, bOut: .3, wide: .05, mc: -.5, mw: 1.1 },
  smirk: { bIn: -.1, bOut: .45, lid: .4, mc: .35, smirk: 1 }, cold: { bIn: -.2, bOut: .15, lid: .45, mc: -.06 },
  determined: { bIn: -.35, bOut: .1, mc: .15 }, deadpan: { lid: .55, mc: 0 }, shy: { bIn: .5, mc: .25, mw: .7, blush: 1, ly: .45 },
  moved: { bIn: .8, bOut: -.15, mc: -.2, lid: .22, wet: 1 }, tired: { lid: .62, bIn: .25 }, excited: { bIn: .55, bOut: .5, wide: .3, mc: .85, mo: .45, teeth: 1 },
  curious: { bIn: .2, bOut: .55, wide: .12, mc: .05 }, sleep: { closed: 1, mc: .2 }, focus: { bIn: -.2, lid: .2, mc: 0 },
};
const EXPR_KEYS = ['bIn', 'bOut', 'wide', 'lid', 'pupil', 'mc', 'mw', 'mo', 'mO', 'teeth', 'blush', 'sweat', 'happyEyes', 'smirk', 'ly', 'wet', 'closed'];
const EXPR_DEF = { pupil: 1, mw: 1 };
function exprParams(e) { const p = typeof e === 'string' ? (EXPR[e] || {}) : (e || {}); const o = {}; for (const k of EXPR_KEYS) o[k] = p[k] ?? EXPR_DEF[k] ?? 0; return o; }
// expression changeant dans le temps avec fondu : exprAt(lt, [[0,'neutral'],[1.2,'smile']])
function exprAt(t, keys, dur = .18) {
  let i = 0; for (let k = 0; k < keys.length; k++) if (t >= keys[k][0]) i = k;
  const cur = exprParams(keys[i][1]); if (i === 0) return cur;
  const prev = exprParams(keys[i - 1][1]), u = ease((t - keys[i][0]) / dur); const o = {};
  for (const k of EXPR_KEYS) o[k] = lerp(prev[k], cur[k], u); return o;
}
function blinkAt(T, seed) { const per = 3.2 + hash(seed) * 2.2, ph = ((T + seed * 1.7) % per + per) % per; return ph < .15 ? Math.abs(Math.cos(PI * ph / .15)) : 1; }

// ---------- bras (IK 2 segments) ----------
function solveArm(sx, sy, side, pose, L1, L2) {
  let th1, th2;
  if (pose && pose.tx != null) {
    const dx = pose.tx - sx, dy = pose.ty - sy; let d = Math.hypot(dx, dy); d = clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - .5);
    const phi = Math.atan2(dx, dy), al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    th1 = phi - (pose.b ?? side) * al; const ex = sx + Math.sin(th1) * L1, ey = sy + Math.cos(th1) * L1; th2 = Math.atan2(pose.tx - ex, pose.ty - ey);
  } else { th1 = pose?.a1 ?? side * .08; th2 = pose?.a2 ?? side * .03; }
  return { th1, th2 };
}
// gestes prédéfinis (coordonnées locales du corps)
function armPreset(name, side, sw, T, ph = 0) {
  switch (name) {
    case 'down': return null;
    case 'swing': return { a1: side * .06 + Math.sin(ph) * .32 * side, a2: side * .03 + Math.sin(ph) * .22 * side - .12 };
    case 'hips': return { tx: side * (sw + 18), ty: -345, b: -side };
    case 'strap': return { tx: side * 40, ty: -452, b: -side };
    case 'chest': return { tx: side * -6, ty: -462, b: -side };
    case 'pendant': return { tx: side * 2, ty: -448, b: -side };
    case 'wave': return { tx: side * (sw + 80) + Math.sin(T * 9) * 18, ty: -690 + Math.cos(T * 9) * 6, b: side };
    case 'raise': return { tx: side * (sw + 40), ty: -720, b: side };
    case 'cross': return { tx: side * -38, ty: -418, b: -side };
    case 'hold': return { tx: side * 28, ty: -420, b: -side };
    case 'holdLow': return { tx: side * 34, ty: -380, b: -side };
    case 'chin': return { tx: side * 8, ty: -560, b: -side };
    case 'mouth': return { tx: side * 4, ty: -575, b: -side };
    case 'shrug': return { tx: side * (sw + 95), ty: -430, b: side };
    case 'point': return { tx: side * (sw + 210), ty: -520, b: side };
    case 'offer': return { tx: side * 40, ty: -470, b: -side };
    case 'shoulder': return { tx: side * -70, ty: -505, b: -side };
    case 'face': return { tx: side * 18, ty: -600, b: -side };
    case 'thumb': return { tx: side * (sw + 40), ty: -560, b: side };
    case 'pocket': return { tx: side * 74, ty: -292, b: -side, hand: 'hidden' };
  }
  return null;
}

// ---------- fiches personnages ----------
const SKIN = { aya: '#8e8c89', nina: '#6c6864', vic: '#a6a39e', mom: '#7b7874', timi: '#8a8783', morel: '#9b9791' };
const UNIFORM = { top: { type: 'blazer', color: '#1f1f23', trim: '#c9a063' }, bottom: { type: 'skirt', color: '#26262a' }, legs: '#141414' };
const CHARS = {
  aya: { name: 'Aya', skin: SKIN.aya, hair: { style: 'long', color: '#121212' }, ...UNIFORM, bag: 'backpack', pencil: true, fem: 1, headS: 1, bodyS: 1, eye: 1 },
  ayaPJ: { name: 'Aya', skin: SKIN.aya, hair: { style: 'long', color: '#121212' }, top: { type: 'pajama', color: '#4a4846' }, bottom: { type: 'pants', color: '#3c3a38' }, legs: '#3c3a38', fem: 1, headS: 1, bodyS: 1, eye: 1, shoes: 'none', skinFeet: true },
  nina: { name: 'Nina', skin: SKIN.nina, hair: { style: 'braids', color: '#141414' }, ...UNIFORM, headphones: true, bag: 'satchel', fem: 1, headS: 1, bodyS: .98, eye: 1.08 },
  vic: { name: 'Victoria', skin: SKIN.vic, hair: { style: 'pony', color: '#1a1a1a' }, ...UNIFORM, earrings: true, fem: 1, headS: .98, bodyS: 1.05, eye: .95, lashes: 1.4 },
  mom: { name: 'Maman', skin: SKIN.mom, hair: { style: 'wrap', color: '#141414' }, top: { type: 'apron', color: '#2c2a2a', apron: '#c4bcab' }, bottom: { type: 'dress', color: '#2c2a2a' }, legs: '#1b1b1b', earrings: true, fem: 1, headS: 1, bodyS: 1.07, eye: .95, shoes: 'slipper' },
  timi: { name: 'Timi', skin: SKIN.timi, hair: { style: 'curly', color: '#151515' }, top: { type: 'tshirt', color: '#5e5c5a' }, bottom: { type: 'shorts', color: '#2a2a2e' }, legs: 'skin', fem: 0, headS: 1.12, bodyS: .62, eye: 1.15 },
  morel: { name: 'M. Morel', skin: SKIN.morel, hair: { style: 'gray', color: '#8d8a85' }, top: { type: 'vest', color: '#2a2622', shirt: '#d6d0c2' }, bottom: { type: 'pants', color: '#232326' }, legs: '#232326', glasses: true, beard: true, fem: 0, headS: 1.02, bodyS: 1.14, eye: .9, shoes: 'dark' },
  nox: { name: 'Nox', skin: '#7f7c78', hair: { style: 'messy', color: '#d9d4c9' }, top: { type: 'coat', color: '#16161a', trim: '#c9a063' }, bottom: { type: 'pants', color: '#1f1f23' }, legs: '#1f1f23', fem: 0, headS: 1, bodyS: 1.08, eye: 1, shoes: 'dark', mask: true },
  dad: { name: 'Papa', skin: '#7a7672', hair: { style: 'short', color: '#141414' }, top: { type: 'vest', color: '#3a3430', shirt: '#cfc8b8' }, bottom: { type: 'pants', color: '#232326' }, legs: '#232326', beard: false, fem: 0, headS: 1, bodyS: 1.1, eye: .95, shoes: 'dark' },
  st1: { skin: '#7c7975', hair: { style: 'short', color: '#151515' }, top: UNIFORM.top, bottom: { type: 'pants', color: '#26262a' }, legs: '#26262a', fem: 0, headS: 1, bodyS: 1.05, eye: .95 },
  st2: { skin: '#9a9792', hair: { style: 'bob', color: '#1c1c1c' }, ...UNIFORM, fem: 1, headS: 1, bodyS: .98, eye: 1 },
  st3: { skin: '#625f5b', hair: { style: 'puff', color: '#121212' }, ...UNIFORM, fem: 1, headS: 1, bodyS: 1, eye: 1 },
  st4: { skin: '#8a8682', hair: { style: 'short', color: '#2a2a2a' }, top: UNIFORM.top, bottom: { type: 'pants', color: '#26262a' }, legs: '#26262a', fem: 0, headS: 1, bodyS: 1.02, eye: .95, glasses: true },
  fol1: { skin: '#94918c', hair: { style: 'bob', color: '#161616' }, ...UNIFORM, earrings: true, fem: 1, headS: .98, bodyS: 1, eye: .95 },
  fol2: { skin: '#76736f', hair: { style: 'pony', color: '#181818' }, ...UNIFORM, fem: 1, headS: .98, bodyS: 1, eye: .95 },
};

// ---------- morceaux de corps ----------
const SH_Y = -505; // hauteur des épaules
function drawLegs(c, ch, lL, lR, sitHide) {
  const skirt = ch.bottom.type === 'skirt' || ch.bottom.type === 'dress';
  for (const side of [-1, 1]) {
    const lift = side < 0 ? lL : lR; c.save(); c.translate(0, -lift);
    const x0 = side < 0 ? -48 : 10, w = 38;
    const legCol = ch.legs === 'skin' ? ch.skin : ch.legs;
    const top = ch.bottom.type === 'pants' ? -340 : -300;
    const lg = rect(x0, top, w, -top - 28, 6);
    paint(c, lg, { fill: legCol, rim: side < 0 ? '#9a958b' : null, rx: 3, dots: ch.legs === 'skin' ? PAT.skin : null, dx: x0 + 22, da: .6, stroke: '#000', lw: 2.8 });
    if (ch.bottom.type === 'pants') { c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + w * .5, -300); c.lineTo(x0 + w * .52, -120); c.stroke(); }
    // chaussures
    const st = ch.shoes || 'sneaker';
    if (st !== 'none') {
      const sx = side < 0 ? -68 : 8, sw = 60;
      const sh = rect(sx, -38, sw, 38, [18, 18, 7, 7]);
      const col = st === 'dark' ? '#1a1a1a' : st === 'slipper' ? '#6d5331' : '#e8e6e1';
      paint(c, sh, { fill: col, stroke: '#000', lw: 2.8 });
      if (st === 'sneaker') { c.fillStyle = '#bdb8ae'; c.fillRect(sx + 3, -13, sw - 6, 6); c.fillStyle = '#c29b5f'; c.fillRect(sx + 3, -7, sw - 6, 5); c.strokeStyle = '#000'; c.lineWidth = 2.8; c.stroke(sh); }
    } else if (ch.skinFeet) { const f = rect(side < 0 ? -58 : 12, -26, 46, 26, [14, 14, 6, 6]); paint(c, f, { fill: ch.skin, stroke: '#000', lw: 2.5 }); }
    c.restore();
  }
}
function torsoPath(ch) {
  const t = ch.top.type, p = new Path2D();
  const sw = 78, hw = ch.top.type === 'apron' || ch.top.type === 'vest' ? 82 : t === 'coat' ? 86 : 72;
  const bot = t === 'apron' ? -205 : t === 'coat' ? -178 : t === 'tshirt' ? -300 : t === 'pajama' ? -320 : -318;
  p.moveTo(-sw + 14, -522); p.quadraticCurveTo(-sw - 6, -518, -sw - 4, -490);
  p.lineTo(-hw - (t === 'apron' ? 18 : t === 'coat' ? 22 : 0), bot + 12); p.quadraticCurveTo(-hw - 2, bot, -hw + 10, bot);
  p.lineTo(hw - 10, bot); p.quadraticCurveTo(hw + 2, bot, hw + (t === 'apron' ? 18 : t === 'coat' ? 22 : 0), bot + 12);
  p.lineTo(sw + 4, -490); p.quadraticCurveTo(sw + 6, -518, sw - 14, -522); p.closePath();
  return { p, bot, sw, hw };
}
function drawBottom(c, ch) {
  const b = ch.bottom.type;
  if (b === 'skirt') {
    const p = new Path2D(); p.moveTo(-70, -330); p.lineTo(70, -330); p.lineTo(86, -240); p.lineTo(-86, -240); p.closePath();
    paint(c, p, { fill: ch.bottom.color, rim: '#8f8a80', rx: 3, dots: PAT.cloth, dx: 10, da: .7, stroke: '#000', lw: 2.8 });
    c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; for (const x of [-48, -18, 14, 44]) { c.beginPath(); c.moveTo(x * .8, -326); c.lineTo(x, -242); c.stroke(); }
    c.fillStyle = '#c9a063'; c.fillRect(-84, -248, 168, 4);
  } else if (b === 'shorts') {
    const p = new Path2D(); p.moveTo(-66, -312); p.lineTo(66, -312); p.lineTo(72, -250); p.lineTo(6, -250); p.lineTo(0, -280); p.lineTo(-6, -250); p.lineTo(-72, -250); p.closePath();
    paint(c, p, { fill: ch.bottom.color, stroke: '#000', lw: 2.8 });
  } else if (b === 'dress') {
    const p = new Path2D(); p.moveTo(-74, -330); p.lineTo(74, -330); p.lineTo(98, -150); p.lineTo(-98, -150); p.closePath();
    paint(c, p, { fill: ch.bottom.color, rim: '#8f8a80', rx: 3, dots: PAT.cloth, dx: 14, da: .7, stroke: '#000', lw: 2.8 });
  }
}
function drawTorso(c, ch, o) {
  const { p, bot, sw } = torsoPath(ch); const t = ch.top.type;
  if (ch.bag === 'backpack') { const bp = rect(-70, -545, 140, 200, 30); paint(c, bp, { fill: '#2e2a26', stroke: '#000', lw: 3 }); }
  paint(c, p, { fill: ch.top.color, rim: '#cfcac0', rx: 4, dots: t === 'pajama' ? PAT.light : PAT.cloth, dx: 14, da: t === 'blazer' ? .55 : .8, stroke: '#000', lw: 3 });
  if (t === 'blazer') {
    // chemise + ruban/cravate dorée
    const v = new Path2D(); v.moveTo(-30, -524); v.lineTo(0, -450); v.lineTo(30, -524); v.closePath(); paint(c, v, { fill: '#e6e2d8', stroke: '#000', lw: 2.2 });
    if (ch.fem) { const rb = new Path2D(); rb.moveTo(0, -500); rb.lineTo(-14, -512); rb.lineTo(-14, -490); rb.closePath(); rb.moveTo(0, -500); rb.lineTo(14, -512); rb.lineTo(14, -490); rb.closePath(); paint(c, rb, { fill: '#c9a063', stroke: '#000', lw: 1.8 }); }
    else { const ti = new Path2D(); ti.moveTo(-6, -506); ti.lineTo(6, -506); ti.lineTo(9, -462); ti.lineTo(0, -452); ti.lineTo(-9, -462); ti.closePath(); paint(c, ti, { fill: '#c9a063', stroke: '#000', lw: 1.8 }); }
    // revers dorés
    c.strokeStyle = ch.top.trim; c.lineWidth = 3.2; c.beginPath(); c.moveTo(-32, -522); c.lineTo(-6, -440); c.lineTo(-6, bot + 2); c.moveTo(32, -522); c.lineTo(6, -440); c.lineTo(6, bot + 2); c.stroke();
    c.fillStyle = '#d8b273'; for (const y of [-412, -372]) { c.beginPath(); c.arc(-14, y, 4, 0, TAU); c.fill(); }
    // écusson (soleil) sur la poitrine
    c.save(); c.translate(-44, -462); const sh = new Path2D(); sh.moveTo(-11, -10); sh.lineTo(11, -10); sh.lineTo(11, 4); sh.quadraticCurveTo(0, 16, -11, 4); sh.closePath(); paint(c, sh, { fill: '#c9a063', stroke: '#000', lw: 1.6 });
    c.fillStyle = '#1f1f23'; c.beginPath(); c.arc(0, -1, 4, 0, TAU); c.fill(); c.restore();
    c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(24, -380); c.lineTo(58, -380); c.stroke();
  } else if (t === 'apron') {
    const a = new Path2D(); a.moveTo(-46, -470); a.lineTo(46, -470); a.lineTo(58, -215); a.lineTo(-58, -215); a.closePath();
    paint(c, a, { fill: ch.top.apron, dots: PAT.cloth, dx: 10, da: .35, stroke: '#000', lw: 2.6 });
    c.strokeStyle = '#b08a52'; c.lineWidth = 3; c.strokeRect(-40, -330, 80, 50);
    c.strokeStyle = '#000'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-46, -470); c.lineTo(-30, -522); c.moveTo(46, -470); c.lineTo(30, -522); c.stroke();
    const nk = new Path2D(); nk.moveTo(-24, -523); nk.quadraticCurveTo(0, -500, 24, -523); nk.closePath(); paint(c, nk, { fill: ch.skin, stroke: '#000', lw: 2 });
  } else if (t === 'tshirt') {
    const nk = new Path2D(); nk.moveTo(-26, -522); nk.quadraticCurveTo(0, -498, 26, -522); paint(c, nk, { fill: ch.skin, stroke: '#000', lw: 2 });
    c.save(); c.translate(6, -420); c.fillStyle = '#c9a063'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, r = k % 2 ? 11 : 26; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke(); c.restore();
  } else if (t === 'vest') {
    const sh = new Path2D(); sh.moveTo(-34, -524); sh.lineTo(0, -440); sh.lineTo(34, -524); sh.closePath(); paint(c, sh, { fill: ch.top.shirt, stroke: '#000', lw: 2 });
    const ti = new Path2D(); ti.moveTo(-7, -508); ti.lineTo(7, -508); ti.lineTo(10, -455); ti.lineTo(0, -444); ti.lineTo(-10, -455); ti.closePath(); paint(c, ti, { fill: '#b08a52', stroke: '#000', lw: 1.8 });
    c.fillStyle = '#c9a063'; for (const y of [-430, -395, -360]) { c.beginPath(); c.arc(0, y, 4.5, 0, TAU); c.fill(); }
    c.strokeStyle = '#000'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -440); c.lineTo(0, bot); c.stroke();
  } else if (t === 'coat') {
    // long manteau à col montant, ouvert sur l'uniforme, épingle « éclipse »
    const inner = new Path2D(); inner.moveTo(-26, -520); inner.lineTo(26, -520); inner.lineTo(14, bot); inner.lineTo(-14, bot); inner.closePath(); paint(c, inner, { fill: '#26262b', stroke: '#000', lw: 2 });
    const ti = new Path2D(); ti.moveTo(-6, -508); ti.lineTo(6, -508); ti.lineTo(9, -462); ti.lineTo(0, -452); ti.lineTo(-9, -462); ti.closePath(); paint(c, ti, { fill: '#c9a063', stroke: '#000', lw: 1.8 });
    for (const sd of [-1, 1]) {
      const lap = new Path2D(); lap.moveTo(sd * 26, -540); lap.lineTo(sd * 46, -560); lap.lineTo(sd * 60, -512); lap.lineTo(sd * 30, -430); lap.lineTo(sd * 18, bot + 4); lap.lineTo(sd * 12, -520); lap.closePath();
      paint(c, lap, { fill: '#1c1c21', rim: sd < 0 ? '#bdb8ae' : null, rx: 3, stroke: '#000', lw: 2.6 });
    }
    c.strokeStyle = ch.top.trim; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-46, -560); c.lineTo(-60, -512); c.moveTo(46, -560); c.lineTo(60, -512); c.stroke();
    c.fillStyle = '#c9a063'; for (const y of [-400, -340, -280]) { c.beginPath(); c.arc(30, y, 4.2, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,.7)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-84, -300); c.lineTo(-44, -296); c.moveTo(84, -300); c.lineTo(44, -296); c.stroke();
    c.save(); c.translate(-42, -470); c.shadowColor = 'rgba(255,190,100,.8)'; c.shadowBlur = 10; c.strokeStyle = '#e2bd79'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.stroke(); c.shadowBlur = 0; c.fillStyle = '#0a0a0c'; c.beginPath(); c.arc(1.5, 0, 8, 0, TAU); c.fill(); c.restore();
  } else if (t === 'pajama') {
    const nk = new Path2D(); nk.moveTo(-28, -522); nk.quadraticCurveTo(0, -492, 28, -522); paint(c, nk, { fill: ch.skin, stroke: '#000', lw: 2 });
    c.fillStyle = '#c9a063'; for (let k = 0; k < 7; k++) { const x = -50 + (k % 4) * 32 + (k > 3 ? 16 : 0), y = -470 + Math.floor(k / 4) * 70; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); }
  }
  if (ch.bag === 'backpack') for (const side of [-1, 1]) {
    const s = new Path2D(); s.moveTo(side * 46, -522); s.quadraticCurveTo(side * 66, -460, side * 60, -360); s.lineTo(side * 47, -362); s.quadraticCurveTo(side * 52, -460, side * 34, -520); s.closePath();
    paint(c, s, { fill: '#2e2a26', stroke: '#000', lw: 2.4 }); c.fillStyle = '#c9a063'; c.fillRect(side * 54 - 6, -432, 12, 8);
  }
  if (ch.bag === 'satchel') { c.strokeStyle = '#000'; c.lineWidth = 12; c.beginPath(); c.moveTo(-60, -515); c.lineTo(62, -330); c.stroke(); c.strokeStyle = '#6d5331'; c.lineWidth = 8; c.stroke(); }
  if (o.pendant) {
    c.strokeStyle = '#d8b273'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, -523); c.quadraticCurveTo(0, -470, 22, -523); c.stroke();
    c.save(); c.translate(0, -470); const g = .6 + .4 * Math.sin((o.T || 0) * 3);
    c.shadowColor = `rgba(255,200,110,${.6 * g})`; c.shadowBlur = 14; c.fillStyle = '#e2bd79';
    c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * PI / 8, r = k % 2 ? 7 : 12; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
    c.shadowBlur = 0; c.strokeStyle = '#000'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = '#fff4d6'; c.beginPath(); c.arc(-2, -2, 2.4, 0, TAU); c.fill(); c.restore();
  }
}
function drawHand(c, ch, side, kind) {
  if (kind === 'hidden') return;
  const sz = ch.bodyS < .8 ? 1.15 : 1;
  c.save(); c.scale(sz, sz);
  const p = new Path2D(); p.ellipse(0, 12, 13, 17, 0, 0, TAU);
  paint(c, p, { fill: ch.skin, dots: PAT.skin, dx: 3, da: .5, stroke: '#000', lw: 2.4 });
  const th = new Path2D(); th.ellipse(side * -10, 6, 5, 9, side * .5, 0, TAU); paint(c, th, { fill: ch.skin, stroke: '#000', lw: 2.2 });
  if (kind === 'point') { const f = rect(-4, 20, 8, 24, 4); paint(c, f, { fill: ch.skin, stroke: '#000', lw: 2.2 }); }
  if (kind === 'open') { c.strokeStyle = '#000'; c.lineWidth = 1.6; for (const x of [-5, 0, 5]) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x * 1.2, 28); c.stroke(); } }
  c.restore();
}
function drawArmPart(c, ch, side, pose, T) {
  const sw = 78, sx = side * (sw - 6), sy = SH_Y + 6, L1 = 118, L2 = 112;
  const { th1, th2 } = solveArm(sx, sy, side, pose, L1, L2);
  const sleeve = ch.top.type === 'tshirt' ? 'short' : ch.top.type === 'vest' ? 'shirt' : 'long';
  const col = sleeve === 'shirt' ? ch.top.shirt : ch.top.color;
  c.save(); c.translate(sx, sy); c.rotate(-th1);
  const up = rect(-19, -12, 38, L1 + 22, 17);
  paint(c, up, { fill: col, rim: '#cfcac0', rx: 3, dots: PAT.cloth, dx: 4, da: .55, stroke: '#000', lw: 2.8 });
  c.translate(0, L1); c.rotate(-(th2 - th1));
  if (sleeve === 'short') { const fa = rect(-14, -8, 28, L2 + 6, 13); paint(c, fa, { fill: ch.skin, dots: PAT.skin, dx: 2, da: .5, stroke: '#000', lw: 2.6 }); }
  else {
    const fa = rect(-18, -10, 36, L2 + 4, 16); paint(c, fa, { fill: col, rim: '#cfcac0', rx: 3, dots: PAT.cloth, dx: 4, da: .55, stroke: '#000', lw: 2.8 });
    if (ch.top.type === 'blazer') { c.fillStyle = '#e6e2d8'; c.fillRect(-15, L2 - 8, 30, 8); c.fillStyle = ch.top.trim; c.fillRect(-17, L2 - 16, 34, 4); }
  }
  c.translate(0, L2); drawHand(c, ch, side, pose?.hand);
  if (pose?.item) pose.item(c, side, T);
  c.restore();
  const ex = sx + Math.sin(th1) * L1, ey = sy + Math.cos(th1) * L1;
  return { x: ex + Math.sin(th2) * (L2 + 12), y: ey + Math.cos(th2) * (L2 + 12) };
}

// ---------- tête ----------
function headDims(ch) { return ch.fem ? { rx: 49, ry: 60 } : ch.bodyS < .8 ? { rx: 54, ry: 58 } : { rx: 52, ry: 62 }; }
function hairBack(c, ch, o) {
  const h = ch.hair, col = h.color;
  if (o.back) return;
  if (h.style === 'long') { const p = rect(-66, -688, 132, 270, [66, 66, 22, 22]); paint(c, p, { fill: col, stroke: '#000', lw: 2.6 }); }
  if (h.style === 'braids') { const p = rect(-70, -690, 140, 250, [68, 68, 30, 30]); paint(c, p, { fill: col, stroke: '#000', lw: 2.6 }); }
  if (h.style === 'pony') {
    const sw = Math.sin((o.T || 0) * 2.2 + .5) * .08 + (o.walk != null ? Math.sin(o.walk) * .1 : 0);
    c.save(); c.translate(8, -684); c.rotate(sw);
    const p = new Path2D(); p.moveTo(-16, 4); p.bezierCurveTo(-10, -40, 60, -46, 74, 10); p.bezierCurveTo(92, 70, 86, 170, 70, 236);
    p.quadraticCurveTo(58, 250, 50, 232); p.bezierCurveTo(60, 160, 58, 70, 40, 24); p.quadraticCurveTo(20, 2, 16, 8); p.closePath();
    paint(c, p, { fill: col, rim: '#5a5a5a', rx: 3, stroke: '#000', lw: 2.6 });
    c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(46, -10); c.bezierCurveTo(76, 30, 76, 130, 66, 220); c.stroke(); c.restore();
  }
  if (h.style === 'bob') { const p = rect(-62, -684, 124, 150, [62, 62, 20, 20]); paint(c, p, { fill: col, stroke: '#000', lw: 2.6 }); }
}
function drawFace(c, ch, o, e, hy) {
  const turn = o.turn || 0, fx = turn * 15, T = o.T || 0, es = ch.eye || 1;
  const blink = o.closedEyes ? 0 : blinkAt(T, o.seed || 1);
  const ey = hy + 4, talk = o.talk || 0;
  // yeux
  for (const sd of [-1, 1]) {
    const ex = fx + sd * 21 - (sd * turn > 0 ? sd * turn * 5 : 0);
    const wsc = 1 - Math.max(0, sd * turn) * .18;
    if (e.closed > .5 || blink < .25) {
      c.strokeStyle = '#000'; c.lineWidth = 3.2; c.beginPath(); c.arc(ex, ey - 3, 11 * es, PI * .15, PI * .85); c.stroke();
    } else if (e.happyEyes > .5) {
      c.strokeStyle = '#000'; c.lineWidth = 3.6; c.beginPath(); c.arc(ex, ey + 6, 11 * es, PI * 1.15, PI * 1.85); c.stroke();
    } else {
      const rx = 12.5 * es * wsc, ry = 8.6 * es * (1 + e.wide) * blink;
      c.save(); c.translate(ex, ey);
      const ew = new Path2D(); ew.ellipse(0, 0, rx, ry, 0, 0, TAU);
      c.fillStyle = '#f1efea'; c.fill(ew); c.save(); c.clip(ew);
      const px = clamp((o.look ?? 0) + turn * .6, -1, 1) * 4.5, py = (o.lookY ?? e.ly ?? 0) * 3;
      c.fillStyle = '#141414'; c.beginPath(); c.arc(px, py + .5, 5.8 * es * e.pupil, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(px + 2, py - 1.8, 1.8 * es, 0, TAU); c.fill();
      if (e.wet > 0) { c.fillStyle = `rgba(255,255,255,${.5 * e.wet})`; c.beginPath(); c.arc(px - 2.5, py + 2.5, 1.4, 0, TAU); c.fill(); }
      if (e.lid > 0) { c.fillStyle = ch.skin; c.fillRect(-rx - 2, -ry - 2, rx * 2 + 4, ry * 2 * e.lid + 1); }
      c.restore();
      c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath();
      const ly = -ry + ry * 2 * e.lid; c.moveTo(-rx - 1.5, ly * .6 + (e.lid ? 0 : 0)); c.quadraticCurveTo(0, ly - (e.lid ? 0 : 2.5), rx + 1.5, ly * .6); c.stroke();
      if (ch.fem) { c.lineWidth = 2.4 * (ch.lashes || 1); c.beginPath(); c.moveTo(sd * (rx + 1), ly * .6); c.lineTo(sd * (rx + 6), ly * .6 - 4); c.stroke(); }
      c.strokeStyle = `rgba(0,0,0,${ch.hair.style === 'gray' || ch.hair.style === 'wrap' ? .45 : .22})`; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 3, rx * .9, PI * .3, PI * .7); c.stroke();
      c.restore();
    }
    // sourcils
    const by = ey - 19 * es - e.wide * 5;
    const inY = by - e.bIn * 7, outY = by - e.bOut * 6 - (e.smirk && sd > 0 ? 5 : 0);
    c.strokeStyle = ch.hair.style === 'gray' ? '#5d5a55' : '#101010'; c.lineWidth = ch.fem ? 4.2 : 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ex + sd * 14, outY); c.quadraticCurveTo(ex + sd * 2, Math.min(inY, outY) - 2.5, ex - sd * 10, inY); c.stroke();
  }
  // nez
  c.strokeStyle = 'rgba(0,0,0,.75)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(fx + 2 + turn * 3, ey + 6); c.lineTo(fx - 3 + turn * 6, ey + 24); c.quadraticCurveTo(fx + 2 + turn * 6, ey + 28, fx + 6 + turn * 4, ey + 24); c.stroke();
  // joues
  if (e.blush > 0) for (const sd of [-1, 1]) { c.fillStyle = `rgba(205,140,110,${.32 * e.blush})`; c.beginPath(); c.ellipse(fx + sd * 30, ey + 22, 12, 6, 0, 0, TAU); c.fill(); }
  // bouche
  const my = ey + 46, mw = 13 * e.mw * (1 + .25 * Math.max(0, e.mc)), mc = e.mc;
  const open = Math.max(e.mo, talk * .95), O = Math.max(e.mO, 0);
  c.save(); c.translate(fx + turn * 3, my);
  if (O > .05 && open < .3) {
    const p = new Path2D(); p.ellipse(0, 1, mw * .42 + 2, mw * .55 * O + 3, 0, 0, TAU); paint(c, p, { fill: '#2a1a16', stroke: '#000', lw: 2.4 });
  } else if (open > .06) {
    const top = -2 - mc * 3, bot = 4 + open * 15 - Math.min(0, mc) * 2, cy = -mc * 4;
    const p = new Path2D(); p.moveTo(-mw, cy); p.quadraticCurveTo(0, top - 3, mw, cy - (e.smirk ? 3 : 0)); p.quadraticCurveTo(0, bot + 6, -mw, cy); p.closePath();
    c.fillStyle = '#2a1a16'; c.fill(p);
    c.save(); c.clip(p);
    if (e.teeth > 0 || (mc > .2 && open > .3)) { c.fillStyle = '#f2efe8'; c.fillRect(-mw, top - 6, mw * 2, 6 + open * 3); }
    c.fillStyle = '#7d5f5a'; c.beginPath(); c.ellipse(0, bot + 4, mw * .6, 5 + open * 3, 0, 0, TAU); c.fill(); c.restore();
    c.lineWidth = 2.6; c.strokeStyle = '#000'; c.stroke(p);
  } else {
    c.strokeStyle = '#000'; c.lineWidth = 2.8; c.beginPath();
    const ly = -mc * 4, ry2 = -mc * 4 - (e.smirk ? 5 : 0);
    c.moveTo(-mw, ly); c.quadraticCurveTo(0, mc * 6, mw, ry2); c.stroke();
  }
  c.restore();
  // larmes, goutte de sueur
  if (o.tears > 0) for (const sd of [-1, 1]) {
    const ex = fx + sd * 21; c.strokeStyle = `rgba(232,190,115,${.75 * o.tears})`; c.lineWidth = 3.4; c.beginPath(); c.moveTo(ex, ey + 8); c.quadraticCurveTo(ex - sd * 2, ey + 30, ex + sd * 2, ey + 52 * o.tears); c.stroke();
    const ph = (T * .8 + (sd > 0 ? .4 : 0)) % 1; c.fillStyle = `rgba(240,200,130,${o.tears * (1 - ph * .5)})`; const yy = ey + 10 + ph * 70; c.beginPath(); c.moveTo(ex, yy - 9); c.quadraticCurveTo(ex + 6, yy + 2, ex, yy + 5); c.quadraticCurveTo(ex - 6, yy + 2, ex, yy - 9); c.fill();
  }
  if (e.sweat > 0) { const x = fx + 46, y = hy - 30; c.fillStyle = `rgba(220,225,230,${.8 * e.sweat})`; c.beginPath(); c.moveTo(x, y - 12); c.quadraticCurveTo(x + 8, y + 3, x, y + 7); c.quadraticCurveTo(x - 8, y + 3, x, y - 12); c.fill(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.stroke(); }
}
function hairFront(c, ch, o, hy) {
  const h = ch.hair, col = h.color, turn = o.turn || 0, fx = turn * 15;
  const { rx, ry } = headDims(ch);
  if (o.back) {
    if (h.style === 'long') { const p = rect(-64, hy - 68, 128, 280, [64, 64, 24, 24]); paint(c, p, { fill: col, rim: '#4a4a4a', rx: 3, stroke: '#000', lw: 2.6 }); c.strokeStyle = '#2c2c2c'; c.lineWidth = 2.2; for (const x of [-30, -8, 14, 34]) { c.beginPath(); c.moveTo(x, hy - 40); c.quadraticCurveTo(x + 6, hy + 80, x - 2, hy + 200); c.stroke(); } }
    else if (h.style === 'messy') { // de dos : crâne couvert de mèches en pointes
      const cap = new Path2D(); cap.moveTo(-rx - 4, hy + 24);
      const pts = [[-rx - 14, hy - 10], [-rx - 4, hy - 40], [-rx - 16, hy - 62], [-26, hy - ry - 12], [-30, hy - ry - 32], [-4, hy - ry - 14], [10, hy - ry - 40], [24, hy - ry - 10], [46, hy - ry - 24], [rx - 2, hy - ry + 4], [rx + 18, hy - 46], [rx + 4, hy - 22], [rx + 14, hy + 4], [rx + 2, hy + 26], [rx - 14, hy + 44], [12, hy + 38], [-6, hy + 52], [-20, hy + 38], [-rx + 10, hy + 46]];
      for (const [x, y] of pts) cap.lineTo(x, y); cap.closePath();
      paint(c, cap, { fill: col, rim: '#fbf7ee', rx: 3, dots: PAT.dark2, dx: 10, da: .35, stroke: '#000', lw: 2.6 });
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 2; for (const [x0, y0, x1, y1] of [[-24, hy - 50, -10, hy - 10], [8, hy - 58, 4, hy - 14], [30, hy - 44, 22, hy - 4]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    }
    else { const p = new Path2D(); p.ellipse(0, hy, rx + 4, ry + 4, 0, 0, TAU); paint(c, p, { fill: col, stroke: '#000', lw: 2.6 }); }
    return;
  }
  if (h.style === 'long') {
    const cap = new Path2D(); cap.moveTo(-rx - 4, hy - 8); cap.bezierCurveTo(-rx - 6, hy - ry - 24, rx + 6, hy - ry - 24, rx + 4, hy - 8);
    cap.quadraticCurveTo(rx - 10, hy - 50, fx * .4 + 4, hy - 52); cap.quadraticCurveTo(-rx + 6, hy - 48, -rx - 4, hy - 8); cap.closePath();
    paint(c, cap, { fill: col, rim: '#575757', rx: 3, stroke: '#000', lw: 2.6 });
    for (const sd of [-1, 1]) {
      const p = new Path2D(); p.moveTo(sd * (rx - 6), hy - 46); p.bezierCurveTo(sd * (rx + 12), hy - 20, sd * (rx + 12), hy + 60, sd * (rx + 18), hy + 190);
      p.quadraticCurveTo(sd * (rx + 4), hy + 202, sd * (rx - 10), hy + 192); p.lineTo(sd * (rx - 10), hy + 10); p.quadraticCurveTo(sd * (rx - 12), hy - 30, sd * (rx - 6), hy - 46); p.closePath();
      paint(c, p, { fill: col, rim: sd < 0 ? '#5c5c5c' : null, rx: 3, stroke: '#000', lw: 2.4 });
      c.strokeStyle = '#2e2e2e'; c.lineWidth = 2; c.beginPath(); c.moveTo(sd * (rx + 2), hy - 10); c.quadraticCurveTo(sd * (rx + 6), hy + 80, sd * (rx + 10), hy + 180); c.stroke();
    }
    if (ch.pencil) { c.save(); c.translate(rx + 4, hy - 18); c.rotate(-.42); const pc = rect(-3.5, -30, 7, 46, 1.5); paint(c, pc, { fill: '#d8b273', stroke: '#000', lw: 1.6 }); c.fillStyle = '#e9d9b8'; c.beginPath(); c.moveTo(-3.5, 16); c.lineTo(3.5, 16); c.lineTo(0, 25); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(-1.2, 22); c.lineTo(1.2, 22); c.lineTo(0, 25); c.fill(); c.fillStyle = '#8f8a82'; c.fillRect(-3.5, -30, 7, 6); c.restore(); }
  } else if (h.style === 'braids') {
    const cap = new Path2D(); cap.moveTo(-rx - 5, hy - 2); cap.bezierCurveTo(-rx - 8, hy - ry - 28, rx + 8, hy - ry - 28, rx + 5, hy - 2); cap.quadraticCurveTo(rx - 8, hy - 52, 0, hy - 50); cap.quadraticCurveTo(-rx + 8, hy - 52, -rx - 5, hy - 2); cap.closePath();
    paint(c, cap, { fill: col, rim: '#575757', rx: 3, stroke: '#000', lw: 2.6 });
    c.save(); c.clip(cap); c.strokeStyle = '#2e2e2e'; c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 12, hy - 50); c.quadraticCurveTo(k * 18, hy - ry - 8, k * 6, hy - ry - 18); c.stroke(); } c.restore();
    for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) {
      const x0 = sd * (rx - 4 + k * 7), len = 150 + k * 22 + (o.walk != null ? Math.sin(o.walk + k) * 4 : 0);
      c.save(); c.translate(x0, hy - 20); c.rotate(sd * (.04 + k * .03) + Math.sin((o.T || 0) * 2 + k) * .02);
      const b = rect(-6, 0, 12, len, 6); paint(c, b, { fill: col, stroke: '#000', lw: 2 });
      c.strokeStyle = '#333'; c.lineWidth = 1.4; for (let y = 10; y < len; y += 12) { c.beginPath(); c.moveTo(-5, y); c.lineTo(5, y + 5); c.stroke(); }
      c.fillStyle = '#d8b273'; c.beginPath(); c.arc(0, len + 4, 6, 0, TAU); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 1.6; c.stroke(); c.restore();
    }
  } else if (h.style === 'pony') {
    const cap = new Path2D(); cap.moveTo(-rx - 3, hy - 4); cap.bezierCurveTo(-rx - 6, hy - ry - 22, rx + 6, hy - ry - 22, rx + 3, hy - 4); cap.quadraticCurveTo(rx - 4, hy - 40, 10, hy - 56); cap.quadraticCurveTo(-30, hy - 44, -rx - 3, hy - 4); cap.closePath();
    paint(c, cap, { fill: col, rim: '#666', rx: 3, stroke: '#000', lw: 2.6 });
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, hy - 56); c.quadraticCurveTo(-10, hy - ry - 10, -20, hy - ry - 14); c.stroke();
    c.save(); c.translate(14, hy - ry - 6); c.rotate(.5); c.fillStyle = '#c9a063'; c.fillRect(-12, -5, 24, 10); c.strokeStyle = '#000'; c.lineWidth = 1.6; c.strokeRect(-12, -5, 24, 10); c.restore();
  } else if (h.style === 'wrap') {
    const w = new Path2D(); w.moveTo(-rx - 6, hy - 18); w.bezierCurveTo(-rx - 20, hy - ry - 70, rx + 20, hy - ry - 70, rx + 6, hy - 18); w.quadraticCurveTo(0, hy - 46, -rx - 6, hy - 18); w.closePath();
    paint(c, w, { fill: '#b88f55', rim: '#e6c88c', rx: 3, dots: PAT.dark, dx: 10, da: .6, stroke: '#000', lw: 2.8 });
    c.strokeStyle = '#5a4122'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-rx + k * 8, hy - 28 - k * 14); c.quadraticCurveTo(0, hy - 60 - k * 16, rx - k * 8, hy - 28 - k * 14); c.stroke(); }
    const kn = new Path2D(); kn.ellipse(10, hy - ry - 40, 26, 18, -.3, 0, TAU); paint(c, kn, { fill: '#c89d5e', stroke: '#000', lw: 2.6 });
  } else if (h.style === 'curly') {
    const p = new Path2D(); const n = 13;
    for (let k = 0; k <= n; k++) { const a = PI + k / n * PI, x = Math.cos(a) * (rx + 6), y = hy - 12 + Math.sin(a) * (ry + 16); p.moveTo(x + 16, y); p.arc(x, y, 16, 0, TAU); }
    p.moveTo(rx, hy - 30); p.ellipse(0, hy - 34, rx + 2, ry - 10, 0, PI, TAU);
    paint(c, p, { fill: col, stroke: '#000', lw: 2.4 });
  } else if (h.style === 'gray') {
    for (const sd of [-1, 1]) { const p = new Path2D(); p.moveTo(sd * (rx - 4), hy + 10); p.bezierCurveTo(sd * (rx + 10), hy + 4, sd * (rx + 10), hy - 46, sd * (rx - 6), hy - 52); p.quadraticCurveTo(sd * (rx - 14), hy - 30, sd * (rx - 10), hy + 10); p.closePath(); paint(c, p, { fill: col, stroke: '#000', lw: 2.4 }); }
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, hy - 44); c.quadraticCurveTo(0, hy - 50, 22, hy - 44); c.stroke();
  } else if (h.style === 'short') {
    const cap = new Path2D(); cap.moveTo(-rx - 3, hy - 14); cap.bezierCurveTo(-rx - 6, hy - ry - 26, rx + 6, hy - ry - 26, rx + 3, hy - 14); cap.quadraticCurveTo(rx - 10, hy - 44, 0, hy - 48); cap.quadraticCurveTo(-rx + 12, hy - 40, -rx - 3, hy - 14); cap.closePath();
    paint(c, cap, { fill: col, rim: '#555', rx: 3, stroke: '#000', lw: 2.6 });
  } else if (h.style === 'bob') {
    const cap = new Path2D(); cap.moveTo(-rx - 8, hy + 50); cap.bezierCurveTo(-rx - 14, hy - ry - 26, rx + 14, hy - ry - 26, rx + 8, hy + 50); cap.lineTo(rx - 8, hy + 50); cap.quadraticCurveTo(rx - 6, hy - 40, 0, hy - 44); cap.quadraticCurveTo(-rx + 6, hy - 40, -rx + 8, hy + 50); cap.closePath();
    paint(c, cap, { fill: col, rim: '#555', rx: 3, stroke: '#000', lw: 2.6 });
  } else if (h.style === 'messy') {
    const cap = new Path2D(); cap.moveTo(-rx - 6, hy - 2);
    const spikes = [[-rx - 14, hy - 40], [-rx + 2, hy - 62], [-rx - 6, hy - ry - 6], [-24, hy - ry - 4], [-30, hy - ry - 30], [-4, hy - ry - 10], [8, hy - ry - 38], [22, hy - ry - 8], [44, hy - ry - 24], [rx - 2, hy - ry + 6], [rx + 16, hy - 46], [rx + 2, hy - 30], [rx + 10, hy - 6]];
    for (const [x, y] of spikes) cap.lineTo(x, y);
    cap.lineTo(rx - 6, hy - 30); cap.lineTo(rx - 22, hy - 42); cap.lineTo(14, hy - 34); cap.lineTo(-6, hy - 50); cap.lineTo(-22, hy - 30); cap.lineTo(-rx + 12, hy - 40); cap.lineTo(-rx + 2, hy - 14); cap.closePath();
    paint(c, cap, { fill: col, rim: '#fbf7ee', rx: 3, dots: PAT.dark2, dx: 10, da: .35, stroke: '#000', lw: 2.6 });
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (const [x0, y0, x1, y1] of [[-30, hy - 62, -14, hy - 40], [10, hy - 70, 4, hy - 46], [34, hy - 60, 26, hy - 40]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  } else if (h.style === 'puff') {
    const p = new Path2D(); p.arc(0, hy - ry - 26, 46, 0, TAU); paint(c, p, { fill: col, stroke: '#000', lw: 2.6 });
    const cap = new Path2D(); cap.moveTo(-rx - 2, hy - 10); cap.bezierCurveTo(-rx - 4, hy - ry - 18, rx + 4, hy - ry - 18, rx + 2, hy - 10); cap.quadraticCurveTo(0, hy - 50, -rx - 2, hy - 10); cap.closePath();
    paint(c, cap, { fill: col, stroke: '#000', lw: 2.4 }); c.fillStyle = '#c9a063'; c.fillRect(-26, hy - ry - 6, 52, 8);
  }
  // accessoires de tête
  if (ch.earrings) for (const sd of [-1, 1]) { c.strokeStyle = '#d8b273'; c.lineWidth = 3; c.beginPath(); c.arc(sd * (rx + 1), hy + 22, 7, 0, TAU); c.stroke(); }
  if (ch.glasses) { c.strokeStyle = '#c9a063'; c.lineWidth = 3; for (const sd of [-1, 1]) { const g = rect(fx + sd * 21 - 16, hy - 8, 32, 24, 7); c.stroke(g); c.save(); c.clip(g); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx + sd * 21 - 10, hy + 16); c.lineTo(fx + sd * 21 + 4, hy - 8); c.stroke(); c.restore(); } c.beginPath(); c.moveTo(fx - 5, hy + 2); c.lineTo(fx + 5, hy + 2); c.stroke(); }
  if (ch.headphones) { const p = new Path2D(); p.moveTo(-58, -520); p.quadraticCurveTo(0, -470, 58, -520); c.strokeStyle = '#000'; c.lineWidth = 12; c.stroke(p); c.strokeStyle = '#c9a063'; c.lineWidth = 7; c.stroke(p); for (const sd of [-1, 1]) { const cup = rect(sd * 58 - 14, -540, 28, 36, 10); paint(c, cup, { fill: '#2b2b2b', stroke: '#000', lw: 2.4 }); } }
}
function drawHead(c, ch, o, e) {
  const { rx, ry } = headDims(ch); const hy = -622;
  // cou
  const nk = rect(-15, hy + ry - 14, 30, 56); paint(c, nk, { fill: ch.skin, dots: PAT.skin, dx: 2, da: .9, stroke: '#000', lw: 2.4 });
  c.save(); const pv = hy + ry; c.translate(0, pv); c.rotate(o.tilt || 0); c.translate(0, -pv);
  if (!o.back) {
    if (ch.hair.style === 'short' || ch.hair.style === 'curly' || ch.hair.style === 'gray' || ch.hair.style === 'messy') for (const sd of [-1, 1]) { const ear = new Path2D(); ear.ellipse(sd * (rx - 2), hy + 6, 9, 13, 0, 0, TAU); paint(c, ear, { fill: ch.skin, stroke: '#000', lw: 2.2 }); }
    const head = new Path2D(); head.ellipse(0, hy, rx, ry, 0, 0, TAU);
    paint(c, head, { fill: ch.skin, rim: '#cfcbc4', rx: 3, dots: PAT.skin, dx: 16, da: .9, stroke: '#000', lw: 2.8 });
    if (ch.beard) {
      const b = new Path2D(); b.moveTo(-rx + 2, hy + 4); b.quadraticCurveTo(-rx + 4, hy + ry + 18, 0, hy + ry + 22); b.quadraticCurveTo(rx - 4, hy + ry + 18, rx - 2, hy + 4);
      b.quadraticCurveTo(rx - 14, hy + 30, 18, hy + 34); b.quadraticCurveTo(0, hy + 26, -18, hy + 34); b.quadraticCurveTo(-rx + 14, hy + 30, -rx + 2, hy + 4); b.closePath();
      paint(c, b, { fill: '#8d8a85', dots: PAT.dark2, dx: 0, da: .4, stroke: '#000', lw: 2.4 });
    }
    if (ch.mask) drawMask(c, ch, o, hy, rx, ry); else drawFace(c, ch, o, e, hy);
  }
  hairFront(c, ch, o, hy);
  c.restore();
}

// ---------- repères à l'écran (pour recadrer automatiquement, ex. Shorts verticaux) ----------
// FOCUS[id] = position à l'écran (unités 1920×1080) de la tête du personnage le plus grand dessiné sous ce nom.
var FOCUS = {}, FOCUS_OFF = 0;
function focusMark(c, id, x, y, sc) {
  if (FOCUS_OFF > 0) return;
  const m = c.getTransform(), k = Math.hypot(m.a, m.b) / SCALE * (sc || 1);
  const px = (m.a * x + m.c * y + m.e) / SCALE, py = (m.b * x + m.d * y + m.f) / SCALE, f = FOCUS[id];
  if (!f || k >= f.k) FOCUS[id] = { x: px, y: py, k };
}

// ---------- personnage complet ----------
// o : {x,y,s,turn,look,lookY,expr|e,talk,tilt,lean,slump,walk,armL,armR,alpha,back,pendant,tears,seed,T}
function drawPerson(c, chId, o) {
  const ch = typeof chId === 'string' ? CHARS[chId] : chId;
  const s = (o.s || 1), T = o.T || 0, bs = ch.bodyS || 1, hs = ch.headS || 1;
  const e = o.e || exprParams(o.expr || 'neutral');
  c.save(); c.translate(o.x, o.y); c.scale(s * (o.flip ? -1 : 1), s);
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0, 2, 120 * bs, 18 * bs, 0, 0, TAU); c.fill(); }
  let lL = 0, lR = 0, bob = Math.sin(T * 1.6 + (o.seed || 0)) * 1.5;
  if (o.walk != null) { lL = Math.max(0, Math.sin(o.walk)) * 22; lR = Math.max(0, -Math.sin(o.walk)) * 22; bob += -Math.abs(Math.sin(o.walk)) * 9; }
  if (o.hop) bob -= o.hop;
  c.save(); c.scale(bs, bs);
  if (!o.noLegs) drawLegs(c, ch, lL, lR);
  c.translate(0, bob / bs);
  const lean = o.lean || 0, slump = o.slump || 0;
  c.translate(0, -320); c.rotate(lean); c.translate(0, 320 + slump * 10);
  // derrière : cheveux longs, queue de cheval
  c.save(); const hsc = hs / bs; c.translate(0, SH_Y - 20); c.scale(hsc, hsc); c.translate(0, -(SH_Y - 20)); hairBack(c, ch, o); c.restore();
  drawBottom(c, ch);
  drawTorso(c, ch, { pendant: o.pendant, T });
  const armA = typeof o.armL === 'string' ? armPreset(o.armL, -1, 78, T, o.walk ?? T * 3) : o.armL;
  const armB = typeof o.armR === 'string' ? armPreset(o.armR, 1, 78, T, (o.walk ?? T * 3) + PI) : o.armR;
  const toLocal = (p) => { if (!p) return p; if (p.wx == null) return p; const k = s * bs; return { ...p, tx: (p.wx - o.x) / k, ty: (p.wy - o.y) / k - bob / bs - slump * 10, b: p.b }; };
  const frontArms = o.armsFront !== false;
  let hL, hR;
  if (!frontArms) { hL = drawArmPart(c, ch, -1, toLocal(armA), T); hR = drawArmPart(c, ch, 1, toLocal(armB), T); }
  // tête (échelle propre, ancrée au cou)
  c.save(); c.translate(0, SH_Y - 20); c.scale(hsc, hsc); c.translate(0, -(SH_Y - 20));
  c.translate(0, slump * 14); if (o.nod) c.translate(0, o.nod);
  drawHead(c, ch, { ...o, tilt: (o.tilt || 0) + slump * .12, tears: o.tears }, e);
  c.restore();
  if (frontArms) { hL = drawArmPart(c, ch, -1, toLocal(armA), T); hR = drawArmPart(c, ch, 1, toLocal(armB), T); }
  c.restore(); c.restore();
  const k = s * bs, w = p => ({ x: o.x + p.x * k * (o.flip ? -1 : 1), y: o.y + (p.y + bob / bs) * k });
  const head = { x: o.x, y: o.y + (-622 * (hs / bs) + (SH_Y - 20) * (1 - hs / bs)) * k };
  if (o.alpha == null || o.alpha > .3) focusMark(c, typeof chId === 'string' ? chId : (ch.name || '?'), head.x, head.y, k);
  return { lh: w(hL), rh: w(hR), head };
}

// ---------- Nox « l'Éclipse » : masque noir cerclé d'or, cheveux cendrés, long manteau ----------
function drawMask(c, ch, o, hy, rx, ry) {
  const T = o.T || 0, g = o.glow ?? 1, turn = o.turn || 0, fx = turn * 12;
  const m = new Path2D(); m.ellipse(fx * .3, hy + 2, rx - 2, ry - 1, 0, 0, TAU);
  // couronne dorée (éclipse)
  c.save(); c.shadowColor = `rgba(255,196,110,${Math.min(1, .9 * g)})`; c.shadowBlur = 26 * g; c.strokeStyle = '#f0c983'; c.lineWidth = 5; c.stroke(m); c.restore();
  const gr = c.createRadialGradient(fx - 12, hy - 20, 4, fx * .3, hy, ry); gr.addColorStop(0, '#2a2a30'); gr.addColorStop(1, '#070709');
  c.fillStyle = gr; c.fill(m);
  c.save(); c.clip(m); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 6; c.beginPath(); c.arc(fx - 6, hy - 6, ry * .78, PI * 1.05, PI * 1.45); c.stroke(); c.restore();
  c.strokeStyle = '#000'; c.lineWidth = 2.4; c.stroke(m);
  // fentes des yeux (lueur dorée discrète)
  const op = blinkAt(T, 9.1);
  for (const sd of [-1, 1]) {
    const ex = fx + sd * 20, ey = hy - 4;
    c.save(); c.translate(ex, ey); c.rotate(sd * .12); c.scale(1, op);
    c.shadowColor = `rgba(255,200,120,${.9 * g})`; c.shadowBlur = 14 * g;
    c.fillStyle = '#f6d9a0'; c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, -5.5, 14, 0); c.quadraticCurveTo(0, 3.2, -14, 0); c.fill();
    c.restore();
  }
  // fine fêlure dorée sur le masque (indice pour la suite)
  c.strokeStyle = 'rgba(226,189,121,.75)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(fx + 24, hy - ry + 10); c.lineTo(fx + 16, hy - 30); c.lineTo(fx + 26, hy - 18); c.stroke();
}
function drawNox(c, o) {
  const r = drawPerson(c, 'nox', { x: o.x, y: o.y, s: o.s || 1, T: o.T || 0, turn: o.turn || 0, walk: o.walk, noLegs: o.noLegs, alpha: o.alpha, noShadow: o.noShadow, glow: o.glow ?? 1, back: o.back, seed: 9, armL: o.armL ?? 'pocket', armR: o.armR ?? 'pocket' });
  return { slit: r.head, head: r.head };
}
