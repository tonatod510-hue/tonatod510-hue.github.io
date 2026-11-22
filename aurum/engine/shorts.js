// Shorts verticaux (1080×1920) tirés de l'épisode : recadrage automatique sur le personnage qui parle,
// gros sous-titres, accroche en haut, carte de fin. À charger après main.js, page en ?scale=1.7777778
// (la hauteur 1080 devient 1920 px : le recadrage 9:16 fait alors exactement 1080 px de large).
const SHORTS = {
  s1: {
    title: ["PERSONNE N'A JAMAIS", 'VU SON VISAGE'],
    segs: [[164.13, 198.49]],
    focus: { 'Nox entre': [[0, 'nox']], "Personne ne m'avait parlé de lui": [[0, 'nox'], [2.3, 'aya']] },
  },
  // version TikTok du Short 1 : démarre sur la porte qui s'ouvre, fin « abonne-toi », textes hors des zones de l'interface TikTok
  t1: {
    title: ["PERSONNE N'A JAMAIS", 'VU SON VISAGE'],
    segs: [[166.73, 198.49]],
    focus: { 'Nox entre': [[0, 'nox']], "Personne ne m'avait parlé de lui": [[0, 'nox'], [2.3, 'aya']] },
    tagY: 255, titleY: 360, capX: 500, endText: ['LA SUITE ?', 'ABONNE-TOI'],
  },
  // TikTok : l'épisode entier découpé en 3 parties (chacune > 1 min), différent des Shorts YouTube
  p1: {
    title: ['PARTIE 1'], tag: 'AURUM  ·  ÉPISODE 1  ·  PARTIE 1/3', hookFade: 1.8,
    segs: [[0, 13.54], [20.04, 81.37]], // sans le générique
    focus: { 'La photo de famille': [[0, 'photo']], 'Miroir — essai 1': [[0, 1010]] },
    tagY: 255, titleY: 380, capX: 500, endBig: 'À SUIVRE', endText: ['PARTIE 2', 'ABONNE-TOI POUR LA SUITE'],
  },
  p2: {
    title: ['PARTIE 2'], tag: 'AURUM  ·  ÉPISODE 1  ·  PARTIE 2/3', hookFade: 1.8,
    segs: [[81.37, 168.6]], // jusqu'à Nox dans l'encadrement de la porte
    focus: { 'Tous les regards': [[0, 'vic']], 'Réactions': [[0, 'vic'], [1.4, 'nina']], 'Nox entre': [[0, 'nox']] },
    tagY: 255, titleY: 380, capX: 500, endBig: 'À SUIVRE', endText: ['PARTIE 3', 'ABONNE-TOI POUR LA SUITE'],
  },
  p3: {
    title: ['PARTIE 3'], tag: 'AURUM  ·  ÉPISODE 1  ·  PARTIE 3/3', hookFade: 1.8,
    segs: [[164.13, 221.69]],
    focus: { 'Nox entre': [[0, 'nox']], "Personne ne m'avait parlé de lui": [[0, 'nox'], [2.3, 'aya']], 'Le mot': [[0, 'FIT']], 'À la fenêtre': [[0, 'aya'], [1.1, ['aya', 'nox']], [3.9, 'aya']] },
    tagY: 255, titleY: 380, capX: 500, endBig: 'À SUIVRE', endText: ['ÉPISODE 2 : « N. »', 'ABONNE-TOI POUR LA SUITE'], endF: 96, // carte de fin de 4 s : la partie dépasse bien 1 min
  },
  s2: {
    title: ['PREMIER JOUR,', 'PREMIÈRE ENNEMIE'],
    segs: [[98.52, 140.49]],
    focus: {},
  },
  s3: {
    title: ['SON PÈRE A DISPARU', 'IL Y A TROIS ANS'],
    segs: [[70.04, 81.37], [201.61, 221.69]],
    focus: { 'La photo de famille': [[0, 'photo']], 'Le mot': [[0, 'FIT']], 'À la fenêtre': [[0, 'aya'], [1.1, ['aya', 'nox']], [3.9, 'aya']] },
  },
};
const SFPS = 24, END_F = 62, OW = 1080, OH = 1920, CW = H * 9 / 16; // largeur du recadrage 9:16 en unités 1920×1080
const MAIN = ['aya', 'nox', 'nina', 'vic', 'morel', 'mom', 'timi'];
const SCV = document.createElement('canvas'); SCV.width = OW; SCV.height = OH; const SX = SCV.getContext('2d');

function shortFrames(cfg) { return cfg.segs.map(([a, b]) => Math.round((b - a) * SFPS)); }
function frameToT(cfg, f) { const n = shortFrames(cfg); for (let i = 0; i < n.length; i++) { if (f < n[i]) return { T: cfg.segs[i][0] + f / SFPS, seg: i }; f -= n[i]; } return null; }

// --- où regarder : personnage imposé, sinon celui qui parle (avec son interlocuteur s'il tient dans le cadre)
function rawTarget(cfg, T) {
  const sh = EPI.shots[shotAt(T)], lt = T - sh.start, ov = cfg.focus[sh.name];
  const vis = {}; for (const id of [...MAIN, 'photo']) { const f = FOCUS[id]; if (f && f.x > -60 && f.x < W + 60 && f.k > .12) vis[id] = f; }
  let want = null; if (ov) for (const [t0, v] of ov) if (lt >= t0) want = v;
  if (want === 'FIT') return { fit: true, shot: sh.start };
  if (typeof want === 'number') return { x: want, shot: sh.start }; // position fixe (ex. le reflet dans le miroir)
  if (want) { const ids = [].concat(want).filter(id => vis[id]); if (ids.length) return { x: ids.reduce((s, id) => s + vis[id].x, 0) / ids.length, shot: sh.start }; }
  // réplique en cours (la plus récemment commencée), sinon la dernière dite dans ce plan
  let ln = EPI.lines.filter(l => T >= l.t0 - .2 && T <= l.t1 + .35).pop();
  if (!ln) ln = EPI.lines.filter(l => l.t1 < T && l.t0 >= sh.start).pop();
  const sp = ln ? (ln.who === 'N' ? 'aya' : ln.who) : null;
  if (sp && vis[sp]) {
    const p = vis[sp].x, others = MAIN.filter(id => id !== sp && vis[id]).map(id => vis[id].x).sort((a, b) => Math.abs(a - p) - Math.abs(b - p));
    const o = others[0];
    // les deux visages tiennent dans le cadre : on les garde ensemble ; sinon, cadre sur celui qui parle, légèrement tourné vers l'autre
    if (o != null && Math.abs(o - p) <= 400) return { x: (o + p) / 2, shot: sh.start };
    if (o != null && Math.abs(o - p) < 900) return { x: p + Math.sign(o - p) * 60, shot: sh.start };
    return { x: p, shot: sh.start };
  }
  const ids = MAIN.filter(id => vis[id]);
  if (ids.length) { const xs = ids.map(id => vis[id].x); if (Math.max(...xs) - Math.min(...xs) <= 400) return { x: (Math.max(...xs) + Math.min(...xs)) / 2, shot: sh.start }; return { x: vis[ids[0]].x, shot: sh.start }; }
  return { x: W / 2, shot: sh.start };
}
// passe 1 (page à basse résolution) : trajectoire lissée du cadre, sans à-coups, coupée net aux changements de plan
function prepare(id) {
  const cfg = SHORTS[id], n = shortFrames(cfg).reduce((a, b) => a + b, 0), raw = [];
  for (let f = 0; f < n; f++) { const { T } = frameToT(cfg, f); for (const k in FOCUS) delete FOCUS[k]; renderAt(T); raw.push(rawTarget(cfg, T)); }
  const a = 1 - Math.exp(-1 / (SFPS * .28)), xs = raw.map(r => r.x ?? W / 2), fw = xs.slice(), bw = xs.slice();
  for (let f = 1; f < n; f++) if (raw[f].shot === raw[f - 1].shot && !raw[f].fit) fw[f] = fw[f - 1] + a * (xs[f] - fw[f - 1]);
  for (let f = n - 2; f >= 0; f--) if (raw[f].shot === raw[f + 1].shot && !raw[f].fit) bw[f] = bw[f + 1] + a * (fw[f] - bw[f + 1]); else bw[f] = fw[f];
  bw[n - 1] = fw[n - 1];
  return { n, end: cfg.endF || END_F, path: raw.map((r, f) => r.fit ? { fit: 1 } : { x: clamp(bw[f], CW / 2, W - CW / 2) }) };
}

// --- sous-titres : courts morceaux, au rythme de la voix
function chunks(cfg) {
  const out = [];
  for (const l of EPI.lines) {
    if (!cfg.segs.some(([a, b]) => l.t0 < b && l.t1 > a)) continue;
    const words = l.text.replace(/\s+/g, ' ').trim().split(' '), parts = []; let cur = '';
    for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (cur && nx.length > 20) { parts.push(cur); cur = w; } else cur = nx; if (/[.!?…]»?$/.test(w) && cur.length >= 10) { parts.push(cur); cur = ''; } }
    if (cur) parts.push(cur);
    const tot = parts.reduce((s, p) => s + p.length + 4, 0); let t = l.t0;
    for (const p of parts) { const d = (l.t1 - l.t0) * (p.length + 4) / tot; out.push({ t0: t, t1: t + d, text: p, nar: l.who === 'N' }); t += d; }
  }
  return out;
}
function caption(c, ch, T, y, cx = OW / 2 - 20) {
  const k = clamp((T - ch.t0) / .09), s = .88 + .12 * ease(k);
  c.save(); c.translate(cx, y); c.scale(s, s);
  c.font = '700 92px Oswald'; c.textAlign = 'center'; c.lineJoin = 'round'; if ('letterSpacing' in c) c.letterSpacing = '1px';
  let lines = [ch.text]; if (c.measureText(ch.text).width > 840) { const w = ch.text.split(' '); let best = 1, bd = 1e9; for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (d < bd) { bd = d; best = i; } } lines = [w.slice(0, best).join(' '), w.slice(best).join(' ')]; }
  lines.forEach((ln, i) => { const yy = (i - (lines.length - 1) / 2) * 104; c.lineWidth = 16; c.strokeStyle = 'rgba(0,0,0,.92)'; c.strokeText(ln, 0, yy); c.fillStyle = ch.nar ? '#f3cf8a' : '#ffffff'; c.fillText(ln, 0, yy); });
  c.restore();
}
function hook(c, cfg, t = 0) {
  const big = cfg.hookFade ? 1 - smooth(cfg.hookFade, cfg.hookFade + .6, t) : 1;
  if (cfg.hookFade) { // parties TikTok : tout le haut (bandeau + titre) disparaît après ~2 s
    if (big <= 0) return;
    c.save(); c.globalAlpha = big;
    const g = c.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, 'rgba(0,0,0,.82)'); g.addColorStop(.6, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, OW, 560);
    txt(c, cfg.tag || 'AURUM  ·  ÉPISODE 1', OW / 2, cfg.tagY ?? 200, 30, { fill: '#e8dcc4', ls: 8, weight: 600 });
    const gt = c.createLinearGradient(0, 240, 0, 420); gt.addColorStop(0, '#fbe6b8'); gt.addColorStop(.5, '#dcb172'); gt.addColorStop(1, '#a87a42');
    cfg.title.forEach((ln, i) => txt(c, ln, OW / 2, (cfg.titleY ?? 310) + i * 96, 120, { fill: gt, ls: 3, shadow: 'rgba(0,0,0,.9)', blur: 18, sy: 4 }));
    c.restore(); return;
  }
  c.save(); c.globalAlpha = .45 + .55 * big;
  const g = c.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, 'rgba(0,0,0,.82)'); g.addColorStop(.6, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, OW, 560 * (.5 + .5 * big)); c.restore();
  txt(c, cfg.tag || 'AURUM  ·  ÉPISODE 1', OW / 2, cfg.tagY ?? 200, 30, { fill: '#e8dcc4', ls: 8, weight: 600 });
  const gt = c.createLinearGradient(0, 240, 0, 420); gt.addColorStop(0, '#fbe6b8'); gt.addColorStop(.5, '#dcb172'); gt.addColorStop(1, '#a87a42');
  if (big > 0) { c.save(); c.globalAlpha = big; cfg.title.forEach((ln, i) => txt(c, ln, OW / 2, (cfg.titleY ?? 310) + i * 96, cfg.hookFade ? 120 : 88, { fill: gt, ls: 3, shadow: 'rgba(0,0,0,.9)', blur: 18, sy: 4 })); c.restore(); }
}
function eclipse(c, x, y, r, T) {
  c.save(); c.translate(x, y);
  c.shadowColor = 'rgba(255,190,100,.95)'; c.shadowBlur = 40 + 8 * Math.sin(T * 3); c.strokeStyle = '#f0c983'; c.lineWidth = r * .1; c.beginPath(); c.ellipse(0, 0, r * .88, r, 0, 0, TAU); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = '#060608'; c.beginPath(); c.ellipse(0, 0, r * .82, r * .94, 0, 0, TAU); c.fill();
  c.shadowColor = 'rgba(255,200,120,.9)'; c.shadowBlur = 18; c.fillStyle = '#f6d9a0';
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * r * .33, -r * .08); c.rotate(sd * .12); c.beginPath(); c.moveTo(-r * .25, 0); c.quadraticCurveTo(0, -r * .1, r * .25, 0); c.quadraticCurveTo(0, r * .06, -r * .25, 0); c.fill(); c.restore(); }
  c.restore();
}
function endShort(c, k, T, lines = ["L'ÉPISODE 1 EN ENTIER", 'SUR LA CHAÎNE'], big = 'AURUM') {
  c.save(); c.globalAlpha = smooth(0, .25, k);
  c.fillStyle = '#050403'; c.fillRect(0, 0, OW, OH);
  const g = c.createRadialGradient(OW / 2, 820, 20, OW / 2, 820, 760); g.addColorStop(0, 'rgba(214,160,80,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, OW, OH);
  c.restore();
  c.save(); c.globalAlpha = smooth(.1, .45, k); eclipse(c, OW / 2, 760, 150, T); c.restore();
  c.save(); c.globalAlpha = smooth(.25, .6, k);
  const gt = c.createLinearGradient(0, 1000, 0, 1130); gt.addColorStop(0, '#fbe6b8'); gt.addColorStop(.5, '#dcb172'); gt.addColorStop(1, '#a87a42');
  txt(c, big, OW / 2, 1120, big === 'AURUM' ? 150 : 128, { fill: gt, ls: big === 'AURUM' ? 24 : 14, shadow: 'rgba(0,0,0,.85)', blur: 24, sy: 4 });
  c.restore();
  c.save(); c.globalAlpha = smooth(.4, .75, k);
  lines.forEach((ln, i) => txt(c, ln, OW / 2, 1250 + i * 75, 54, { fill: '#efe3cb', ls: 6, weight: 600 }));
  c.restore();
}

let PLAN = null, CHK = null, CUR = null;
window.SH = {
  prepare(id) { return prepare(id); },
  setPlan(id, plan) { CUR = id; PLAN = plan; CHK = chunks(SHORTS[id]); },
  frame(f, q = .92) {
    const cfg = SHORTS[CUR], c = SX; c.setTransform(1, 0, 0, 1, 0, 0);
    if (f >= PLAN.n) {
      const fl = PLAN.n - 1, m = frameToT(cfg, fl), p = PLAN.path[fl]; renderAt(m.T); compose(c, p);
      endShort(c, (f - PLAN.n) / PLAN.end * 2.3, (f - PLAN.n) / SFPS, cfg.endText, cfg.endBig);
    } else {
      const m = frameToT(cfg, f), p = PLAN.path[f]; renderAt(m.T); compose(c, p);
      hook(c, cfg, f / SFPS);
      const ch = CHK.find(x => m.T >= x.t0 && m.T < x.t1); if (ch) caption(c, ch, m.T, p.fit ? 1420 : 1390, cfg.capX);
    }
    return SCV.toDataURL('image/jpeg', q);
  },
};
function compose(c, p) {
  c.fillStyle = '#000'; c.fillRect(0, 0, OW, OH);
  if (p.fit) {
    // plan trop large (le mot) : image entière au centre, fond flou
    const sw = PY * OW / OH; c.save(); c.filter = 'blur(28px) brightness(.45)'; c.drawImage(cv, (PX - sw) / 2, 0, sw, PY, -40, -40, OW + 80, OH + 80); c.restore();
    const h = OW * PY / PX; c.drawImage(cv, 0, 0, PX, PY, 0, (OH - h) / 2 + 40, OW, h);
  } else {
    const sx = clamp(Math.round((p.x - CW / 2) * SCALE), 0, PX - OW); c.drawImage(cv, sx, 0, OW, PY, 0, 0, OW, OH);
  }
}

// --- miniatures verticales des Shorts (1080×1920)
const THUMBS = {
  s1: { T: 178.3, on: 'nox', title: ["PERSONNE N'A", 'JAMAIS VU', 'SON VISAGE'], y: 360 },
  s2: { T: 115.9, on: 'vic', title: ['PREMIER JOUR,', 'PREMIÈRE', 'ENNEMIE'], y: 1400 },
  s3: { T: 217.6, on: 'aya', title: ['SON PÈRE', 'A DISPARU…'], y: 330, note: 210.9 },
};
function thumbTitle(c, lines, y0) {
  const top = y0 - 150, bot = y0 + lines.length * 150 + 20;
  const g = c.createLinearGradient(0, top - 220, 0, bot + 220); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.3, 'rgba(0,0,0,.72)'); g.addColorStop(.7, 'rgba(0,0,0,.72)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, top - 220, OW, bot - top + 440);
  lines.forEach((ln, i) => {
    const y = y0 + i * 150, gt = c.createLinearGradient(0, -115, 0, 0); gt.addColorStop(0, '#fff1cf'); gt.addColorStop(.5, '#e7bd78'); gt.addColorStop(1, '#a8773d');
    c.save(); c.font = '700 150px Oswald'; c.textAlign = 'center'; c.lineJoin = 'round'; if ('letterSpacing' in c) c.letterSpacing = '2px';
    let w = c.measureText(ln).width, s = Math.min(1, 980 / w); c.translate(OW / 2, y); c.scale(s, s);
    c.lineWidth = 18; c.strokeStyle = '#000'; c.strokeText(ln, 0, 0); c.shadowColor = 'rgba(255,190,100,.35)'; c.shadowBlur = 30; c.fillStyle = gt; c.fillText(ln, 0, 0); c.restore();
  });
}
window.SH.thumb = function (id, q = .9) {
  const o = THUMBS[id], c = SX; c.setTransform(1, 0, 0, 1, 0, 0);
  for (const k in FOCUS) delete FOCUS[k]; renderAt(o.T);
  const x = FOCUS[o.on] ? FOCUS[o.on].x : W / 2; compose(c, { x: clamp(x, CW / 2, W - CW / 2) });
  if (o.note) {
    // le mot, posé en bas de l'image
    renderAt(o.note); c.save(); c.translate(OW / 2, 1500); c.rotate(-.035); c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 50;
    const sx = (960 - 530) * SCALE, sy = (560 - 310) * SCALE, sw = 1060 * SCALE, sh = 620 * SCALE, dw = 960, dh = dw * sh / sw;
    c.drawImage(cv, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh); c.restore();
  }
  thumbTitle(c, o.title, o.y);
  txt(c, 'AURUM', OW / 2, o.y < 900 ? 150 : 200, 44, { fill: '#e8dcc4', ls: 14, weight: 600, shadow: 'rgba(0,0,0,.9)', blur: 12 });
  return SCV.toDataURL('image/jpeg', q);
};
