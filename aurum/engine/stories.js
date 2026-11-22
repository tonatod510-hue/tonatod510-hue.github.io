// Stories verticales (1080×1920) pour annoncer la série. À charger après shorts.js, page en ?scale=2.5
// (?handle=@pseudo pour changer le pseudo affiché). Textes gardés entre y 250 et 1650 (hors interface des stories).
const HANDLE = new URLSearchParams(location.search).get('handle') || '@studioaurum';
function goldG(c, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fbe6b8'); g.addColorStop(.5, '#dcb172'); g.addColorStop(1, '#a87a42'); return g; }
function shade(c, y0, y1, a0, a1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(0,0,0,${a0})`); g.addColorStop(1, `rgba(0,0,0,${a1})`); c.fillStyle = g; c.fillRect(0, y0, OW, y1 - y0); }
function frameAt(T) { for (const k in FOCUS) delete FOCUS[k]; renderAt(T); return { ...FOCUS }; }
// recadrage 9:16 de l'image de l'épisode, centré sur (cx, cy), avec zoom
function crop(c, cx, cy, zoom = 1) {
  const w = H * 9 / 16 / zoom, h = H / zoom, x0 = clamp(cx - w / 2, 0, W - w), y0 = clamp(cy - h / 2, 0, H - h);
  c.drawImage(cv, x0 * SCALE, y0 * SCALE, w * SCALE, h * SCALE, 0, 0, OW, OH);
}
const STORIES = [
  // 1. teaser : Aya à la fenêtre, Nox sur le toit d'en face
  (c) => {
    const f = frameAt(212.9), x = f.aya && f.nox ? (f.aya.x + f.nox.x) / 2 : 960; crop(c, x, 540);
    shade(c, 0, 760, .85, 0); shade(c, 1150, OH, 0, .9);
    txt(c, 'NOUVELLE SÉRIE ANIMÉE', OW / 2, 340, 42, { fill: '#efe3cb', ls: 10, weight: 600 });
    txt(c, 'AURUM', OW / 2, 570, 230, { fill: goldG(c, 380, 570), ls: 30, shadow: 'rgba(0,0,0,.9)', blur: 30, sy: 5 });
    txt(c, 'ÉPISODE 1 · DISPO MAINTENANT', OW / 2, 1470, 50, { fill: '#efe3cb', ls: 5, weight: 600 });
    txt(c, HANDLE, OW / 2, 1570, 62, { fill: goldG(c, 1520, 1575), ls: 3 });
  },
  // 2. « Qui est Nox ? »
  (c) => {
    const f = frameAt(178.3), n = f.nox || { x: 960, y: 400 }; crop(c, n.x, n.y + 20, 1.35);
    shade(c, 0, 780, .88, 0); shade(c, 1250, OH, 0, .9);
    txt(c, 'QUI EST', OW / 2, 360, 76, { fill: '#efe3cb', ls: 12, weight: 600 });
    txt(c, 'NOX ?', OW / 2, 590, 230, { fill: goldG(c, 400, 590), ls: 16, shadow: 'rgba(0,0,0,.9)', blur: 30, sy: 5 });
    txt(c, "Personne n'a jamais vu son visage.", OW / 2, 1470, 50, { fill: '#ffffff', weight: 600, shadow: 'rgba(0,0,0,.9)', blur: 12 });
    txt(c, 'DIS-NOUS TA THÉORIE EN COMMENTAIRE', OW / 2, 1545, 36, { fill: '#efe3cb', ls: 4, weight: 600 });
    txt(c, HANDLE, OW / 2, 1630, 56, { fill: goldG(c, 1585, 1635), ls: 3 });
  },
  // 3. les personnages
  (c) => {
    c.fillStyle = vGrad(c, 0, OH, [[0, '#1c140c'], [1, '#060504']]); c.fillRect(0, 0, OW, OH);
    txt(c, 'AURUM  ·  ÉPISODE 1', OW / 2, 270, 32, { fill: '#e8dcc4', ls: 8, weight: 600 });
    txt(c, 'LES PERSONNAGES', OW / 2, 360, 86, { fill: goldG(c, 290, 362), ls: 6 });
    const cast = [
      ['aya', 'AYA', 'LA NOUVELLE', { expr: 'smile', pendant: true, armL: 'down', armR: 'pendant', turn: .15 }],
      ['nina', 'NINA', "L'AMIE", { expr: 'happy', armL: 'down', armR: 'thumb', turn: -.1 }],
      ['vic', 'VICTORIA', 'LA RIVALE', { expr: 'smirk', armL: 'hips', armR: 'down', turn: .2 }],
      ['nox', 'NOX', 'LE MYSTÈRE', { glow: 1.8 }],
    ];
    const cw = 490, ch = 560;
    cast.forEach(([id, name, role, o], i) => {
      const x0 = 40 + (i % 2) * (cw + 20), y0 = 410 + Math.floor(i / 2) * (ch + 20);
      c.save(); const r = rect(x0, y0, cw, ch, 18); c.clip(r);
      c.fillStyle = vGrad(c, y0, y0 + ch, [[0, '#3a2b18'], [1, '#120c07']]); c.fillRect(x0, y0, cw, ch);
      glow(c, x0 + cw / 2, y0 + 190, 300, 'rgba(240,190,110,A)', .35);
      const k = 1.12; c.translate(x0 + cw / 2, y0 + 800 * k); c.scale(k, k);
      if (id === 'nox') drawNox(c, { x: 0, y: 0, s: 1, T: 2, noShadow: true, glow: o.glow });
      else drawPerson(c, id, { x: 0, y: 0, s: 1, T: 2.0, noShadow: true, ...o });
      c.setTransform(1, 0, 0, 1, 0, 0); shade(c, y0 + ch - 190, y0 + ch, 0, .92);
      txt(c, name, x0 + cw / 2, y0 + ch - 62, 62, { fill: goldG(c, y0 + ch - 110, y0 + ch - 60), ls: 6 });
      txt(c, role, x0 + cw / 2, y0 + ch - 22, 28, { fill: '#efe3cb', ls: 6, weight: 600 });
      c.restore();
      c.strokeStyle = 'rgba(216,178,115,.85)'; c.lineWidth = 3; c.stroke(r);
    });
    txt(c, HANDLE, OW / 2, 1630, 56, { fill: goldG(c, 1585, 1635), ls: 3 });
  },
  // 4. le programme des 3 parties
  (c) => {
    c.fillStyle = vGrad(c, 0, OH, [[0, '#120d08'], [1, '#040302']]); c.fillRect(0, 0, OW, OH);
    stars(c, 90, [0, 0, OW, 900], 2.0, .8); glow(c, OW / 2, 520, 520, 'rgba(214,160,80,A)', .3);
    eclipse(c, OW / 2, 500, 140, 2.0);
    txt(c, 'AURUM', OW / 2, 820, 170, { fill: goldG(c, 680, 820), ls: 26, shadow: 'rgba(0,0,0,.85)', blur: 24, sy: 4 });
    txt(c, 'ÉPISODE 1 · LE PREMIER JOUR', OW / 2, 890, 36, { fill: '#efe3cb', ls: 6, weight: 600 });
    [['PARTIE 1', "AUJOURD'HUI"], ['PARTIE 2', 'DEMAIN'], ['PARTIE 3', 'APRÈS-DEMAIN']].forEach(([a, b], i) => {
      const y = 1010 + i * 120, on = i === 0;
      const r = rect(110, y, 860, 96, 14); c.fillStyle = on ? 'rgba(216,178,115,.92)' : 'rgba(255,255,255,.05)'; c.fill(r);
      c.strokeStyle = 'rgba(216,178,115,.8)'; c.lineWidth = 3; c.stroke(r);
      txt(c, a, 150, y + 66, 52, { fill: on ? '#120c06' : '#e8c88e', align: 'left', ls: 4 });
      txt(c, b, 930, y + 66, 44, { fill: on ? '#120c06' : '#efe3cb', align: 'right', ls: 4, weight: 600 });
    });
    txt(c, 'ABONNE-TOI POUR NE RIEN RATER', OW / 2, 1490, 40, { fill: '#efe3cb', ls: 5, weight: 600 });
    txt(c, HANDLE, OW / 2, 1590, 68, { fill: goldG(c, 1535, 1595), ls: 3 });
  },
];
window.ST = { render(i, q = .92) { const c = SX; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, OW, OH); STORIES[i](c); return SCV.toDataURL('image/jpeg', q); } };
