'use strict';
/* =====================================================================
   AURUM — moteur d'épisode commun : timeline (répliques, pauses), contexte
   des plans, aides de mise en scène, scènes partagées, rendu d'une image.
   Chaque épisode (ep01.js, ep02.js…) définit LINES, PH et SHOTS puis appelle
   buildEpisode(SHOTS).
   ===================================================================== */

const VOX = typeof VO !== 'undefined' ? VO : {};
const lineDur = id => VOX[id]?.dur ?? PH[id] ?? 2;
function lineEnv(id, t) {
  if (t < 0 || t > lineDur(id)) return 0;
  if (VOX[id]) { const e = VOX[id].env; return e[Math.min(e.length - 1, Math.floor(t * 100))] || 0; }
  return clamp(.55 + .45 * Math.sin(t * 21) * Math.sin(t * 5.7 + 1)) * smooth(0, .08, t) * smooth(lineDur(id), lineDur(id) - .1, t);
}

// ---------- construction de la timeline ----------
// items : ['w', s] pause | ['l', id, {adv}] réplique (adv = de combien avance le curseur)
const EPI = { shots: [], lines: [], cues: [], sfx: [], dur: 0 };
function buildEpisode(defs) {
  let T0 = 0;
  for (const d of defs) {
    let cur = 0; const L = {};
    for (const it of d.items) {
      if (it[0] === 'w') cur += it[1];
      else if (it[0] === 'l') { const id = it[1], du = lineDur(id); L[id] = { t0: cur, t1: cur + du, dur: du }; EPI.lines.push({ id, t0: T0 + cur, t1: T0 + cur + du, who: LINES[id][0], text: LINES[id][1], ph: !VOX[id] }); cur += (it[2]?.adv ?? du); }
    }
    const shot = { ...d, start: T0, dur: cur, L };
    EPI.shots.push(shot);
    if (d.music) EPI.cues.push({ t: T0 + (d.musicAt || 0), cue: d.music });
    if (d.sfx) for (const [k, at, extra] of d.sfx) EPI.sfx.push({ k, t: T0 + (typeof at === 'function' ? at(L, cur) : at), ...(extra || {}) });
    T0 += cur;
  }
  EPI.dur = T0;
}
// contexte passé aux fonctions de dessin d'un plan
function shotCtx(shot, lt, T) {
  const S = { lt, d: shot.dur, T, L: id => shot.L[id] || { t0: 1e9, t1: 1e9, dur: 0 } };
  S.talk = (...ids) => { let v = 0; for (const id of ids) { const l = S.L(id); v = Math.max(v, lineEnv(id, lt - l.t0)); } return v; };
  S.k = (a, b) => clamp((lt - a) / (b - a));
  return S;
}

// ---------- aides de mise en scène ----------
const ex = (t, keys) => exprAt(t, keys);
function walkTo(lt, t0, t1, x0, x1) { const u = clamp((lt - t0) / (t1 - t0)); return { x: lerp(x0, x1, u), walk: u > 0 && u < 1 ? (lt - t0) * 7 : null }; }
function paperItem(c, side) { c.save(); c.translate(side * -14, 28); c.rotate(side * .2); const p = rect(-34, -4, 68, 48, 2); paint(c, p, { fill: '#e6dcc6', stroke: '#140d06', lw: 2 }); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-26, 6 + k * 9); c.lineTo(22, 6 + k * 9); c.stroke(); } c.restore(); }
function pendantItem(c, side, T) { c.save(); c.translate(0, 30); c.strokeStyle = '#d8b273'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, 36); c.stroke(); c.translate(0, 46); c.shadowColor = 'rgba(255,200,110,.9)'; c.shadowBlur = 22; c.fillStyle = '#e2bd79'; c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * PI / 8 + T, r = k % 2 ? 8 : 14; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }
function noteItem(c, side) { c.save(); c.translate(0, 34); const p = rect(-30, -4, 60, 40, 2); paint(c, p, { fill: '#e6dcc6', stroke: '#c9a063', lw: 3 }); c.restore(); }
const AYA_HEAD = (x, y, s) => ({ x, y: y - 622 * s });

// ---------- scènes partagées ----------
function classRows(c, S, o) {
  setClassroom(c, { T: S.T, doorOpen: o.door || 0 });
  const T = S.T, nx = o.noxT ?? -1;
  const rows = [
    { y: 700, s: .55, who: [['st3', 400], ['vic', 700], ['fol1', 960], ['fol2', 1220]] },
    { y: 800, s: .68, who: [['st1', 330], ['nina', 650], ['st4', 970], ['st2', 1290]] },
    { y: 930, s: .82, who: [['st3', 420], ['st2', 760], ['NOX', 1100], ['AYA', 1440]] },
  ];
  for (const r of rows) for (const [w, x] of r.who) {
    const deskW = 230 * r.s / .68;
    if (w === 'AYA') {
      if (o.aya) {
        if (o.ayaWalk != null && o.ayaWalk < 1) { const xx = lerp(1700, 1440, o.ayaWalk); drawPerson(c, 'aya', { x: xx, y: r.y + 330 * r.s + 40, s: r.s, T, walk: T * 7, expr: 'shy', armL: 'strap', armR: 'strap', pendant: true }); }
        else if (o.ayaE) drawPerson(c, 'aya', { x, y: r.y + 320 * r.s - 6, s: r.s, T, noLegs: true, e: o.ayaE, talk: o.ayaTalk || 0, turn: o.ayaTurn ?? 0, look: o.ayaLookX ?? 0, lookY: o.ayaLookY ?? 0, armL: 'hold', armR: o.ayaArmR || 'hold', pendant: true }); // ép. 2+
        else drawPerson(c, 'aya', { x, y: r.y + 320 * r.s - 6, s: r.s, T, noLegs: true, e: o.ayaLook ? ex(S.lt, [[0, 'curious'], [1.6, 'surprised']]) : exprParams(nx > 1.2 ? 'surprised' : 'shy'), turn: o.ayaLook || nx > 3 ? -.8 : o.turnToDoor ? -.8 * o.turnToDoor : 0, look: o.ayaLook || (nx > 1 && nx < 99) ? -1 : 0, armL: 'hold', armR: 'hold', pendant: true });
      }
      desk(c, x, r.y, deskW, r.s); continue;
    }
    if (w === 'NOX') {
      if (o.nox && nx > 0) {
        const p = clamp((nx - 1.0) / 3.4);
        const seatY = r.y + 320 * r.s - 6;
        if (p < 1) {
          // il descend l'allée de gauche depuis la porte, puis longe le premier rang jusqu'à sa place, et s'assoit
          let xx, yy, ss, tn;
          if (p < .45) { const q = ease(p / .45); xx = lerp(195, 215, q); yy = lerp(645, 1010, q); ss = lerp(.5, .74, q); tn = .08; }
          else if (p < .92) { const q = ease((p - .45) / .47); xx = lerp(215, x, q); yy = lerp(1010, seatY + 50, q); ss = lerp(.74, r.s, q); tn = .38; }
          else { const q = ease((p - .92) / .08); xx = x; yy = lerp(seatY + 50, seatY, q); ss = r.s; tn = .38 * (1 - q); }
          drawNox(c, { x: xx, y: yy, s: ss, T, walk: p > 0 && p < .92 ? T * 5.5 : null, turn: tn, alpha: smooth(.6, 1.1, nx) });
        }
        else drawNox(c, { x, y: seatY, s: r.s, T, noLegs: true, turn: o.ayaLook ? .35 : 0, glow: o.glow || 1, armL: 'cross', armR: 'cross' });
      }
      desk(c, x, r.y, deskW, r.s); continue;
    }
    const lookAt = o.stare ? 0 : o.turnToDoor ? -1 : 0;
    let e = 'neutral', arms = ['hold', 'hold'], talk = 0, turn = o.turnToDoor ? -.6 * o.turnToDoor : 0;
    if (o.stare) e = w === 'vic' ? 'cold' : w === 'nina' ? 'curious' : 'neutral';
    if (o.react) { if (w === 'vic') { e = 'smirk'; turn = .6; talk = (.5 + .5 * Math.sin(T * 14)) * (S.lt > .3 && S.lt < 1.8 ? 1 : 0); } if (w === 'fol1') { e = 'laugh'; turn = -.6; } if (w === 'nina') { e = 'happy'; arms = ['hold', 'thumb']; } }
    if (o.ayaLook && w === 'nina') e = 'surprised';
    let look = lookAt;
    if (o.stareAya) { turn = .5; look = 1; e = w === 'vic' ? 'cold' : w === 'nina' ? 'worried' : 'neutral'; } // ép. 2 : la classe se retourne vers Aya
    const ov = o.who?.[w] || {}; // surcharges par personnage (ép. 2+)
    drawPerson(c, w, { x, y: r.y + 320 * r.s - 6, s: r.s, T: T + x * .01, noLegs: true, expr: e, talk, turn, look, armL: arms[0], armR: arms[1], seed: x, ...ov });
    desk(c, x, r.y, deskW, r.s);
  }
  // lumière de la porte quand Nox entre
  if (o.door) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, 195, 560, 500, 'rgba(255,215,150,A)', .35 * o.door); c.restore(); }
}
function lunchScene(c, S, o) {
  setLunch(c, { T: S.T });
  const lv = o.ninaLeave || 0, lean = o.lean || 0;
  if (lv < 1) drawPerson(c, 'nina', { x: lerp(780, 380, ease(lv)), y: lv > .05 ? 1060 : 1108, s: .9, T: S.T, noLegs: lv <= .05, walk: lv > .05 ? S.T * 7 : null, e: o.nina, talk: o.ninaTalk ?? S.talk('i04', 'i05', 'i06', 'i07'), turn: lv > .05 ? -.5 : .45, look: 1, armL: o.ninaArm === 'mouth' ? 'mouth' : 'hold', armR: o.ninaArm === 'point' && S.lt < 2.4 ? { tx: 240, ty: -500, b: 1, hand: 'point' } : o.ninaArm === 'shrug' ? 'shrug' : lv > .05 ? 'swing' : 'hold', lean, alpha: 1 - smooth(.8, 1, lv) });
  drawPerson(c, 'aya', { x: 1140, y: 1108, s: .9, T: S.T, noLegs: true, e: o.aya, talk: o.ayaTalk ?? S.talk('a10', 'a11'), turn: -.45, look: -1, armL: 'hold', armR: o.ayaArm || 'hold', pendant: true, lean: -lean * .6 });
  lunchTable(c, 960, 830, 760, S.T);
}


// ---------- rendu d'une image ----------
function drawShot(X, shot, lt, T) {
  const S = shotCtx(shot, lt, T), cam = shot.cam ? shot.cam(S) : null;
  if (shot.bg) {
    const b = L1.x; b.setTransform(SCALE, 0, 0, SCALE, 0, 0); b.fillStyle = '#000'; b.fillRect(0, 0, W, H);
    b.save(); applyCam(b, cam, T); shot.bg(b, S); b.restore();
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    if (shot.bgBlur) { X.filter = `blur(${shot.bgBlur * SCALE}px)`; X.drawImage(L1.c, 0, 0); X.filter = 'none'; }
    else if (shot.heat) heatBlit(X, L1.c, shot.heat, 0, H * .85, T);
    else X.drawImage(L1.c, 0, 0);
    X.restore();
    if (shot.fg) { X.save(); X.setTransform(SCALE, 0, 0, SCALE, 0, 0); applyCam(X, cam, T); shot.fg(X, S); X.restore(); }
  } else {
    X.save(); X.setTransform(SCALE, 0, 0, SCALE, 0, 0); X.fillStyle = '#000'; X.fillRect(0, 0, W, H); applyCam(X, cam, T); shot.draw(X, S); X.restore();
  }
}
function shotAt(T) { const A = EPI.shots; let i = A.findIndex(s => T < s.start + s.dur); if (i < 0) i = A.length - 1; return i; }
function renderAt(T) {
  T = clamp(T, 0, EPI.dur - 1e-4);
  const i = shotAt(T), sh = EPI.shots[i], lt = T - sh.start;
  drawShot(OX, sh, lt, T);
  OX.save(); OX.setTransform(1, 0, 0, 1, 0, 0);
  OX.drawImage(VIGN, 0, 0);
  OX.globalCompositeOperation = 'overlay'; OX.globalAlpha = .05; const f = Math.floor(T * 12); OX.translate(-Math.floor(hash(f) * 512), -Math.floor(hash(f + 3) * 512)); OX.fillStyle = PAT.grain; OX.fillRect(0, 0, PX + 512, PY + 512);
  OX.restore();
  let blk = 0; if (sh.fadeIn) blk = Math.max(blk, 1 - clamp(lt / sh.fadeIn)); if (sh.fadeOut) blk = Math.max(blk, clamp((lt - (sh.dur - sh.fadeOut)) / sh.fadeOut));
  if (blk > 0) { OX.save(); OX.setTransform(1, 0, 0, 1, 0, 0); OX.fillStyle = `rgba(0,0,0,${blk})`; OX.fillRect(0, 0, PX, PY); OX.restore(); }
}
