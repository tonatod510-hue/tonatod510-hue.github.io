// Identité de la chaîne YouTube : bannière (2560×1440) et photo de profil (carré centré)
initCore();
const NAME = (new URLSearchParams(location.search).get('name') || 'STUDIO AURUM').toUpperCase();
function goldText(c, s, x, y, size, ls) { const g = c.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, '#fbe6b8'); g.addColorStop(.5, '#dcb172'); g.addColorStop(1, '#a87a42'); txt(c, s, x, y, size, { fill: g, ls, shadow: 'rgba(0,0,0,.85)', blur: 24, sy: 5 }); }
window.show = (what) => {
  const c = OX, T = 1.7; c.setTransform(SCALE, 0, 0, SCALE, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  if (what === 'banner') {
    skyGrad(c, -M, 820, 'dusk'); stars(c, 160, [0, 0, W, 520], T, .9); sun(c, 960, 640, 230, 1);
    skyline(c, 780, .95, 'day', T, 71, 2); skyline(c, 900, 1.35, 'night', T, 73, 1);
    c.fillStyle = vGrad(c, 880, H, [[0, '#0b0907'], [1, '#050403']]); c.fillRect(-M, 880, W + 2 * M, 400);
    drawPerson(c, 'aya', { x: 250, y: 1380, s: 1.25, T, expr: 'determined', turn: .35, look: 1, pendant: true, armL: 'strap', armR: 'pendant', noShadow: true });
    drawPerson(c, 'nina', { x: 1520, y: 1420, s: 1.15, T, expr: 'smile', turn: -.4, look: -1, armL: 'hold', armR: 'down', noShadow: true });
    drawNox(c, { x: 1760, y: 1400, s: 1.02, T, noShadow: true, glow: 1.8, turn: -.15 });
    const v = c.createRadialGradient(960, 540, 200, 960, 540, 900); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    // zone sûre (texte toujours visible) : x 380–1540, y 382–698
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(380, 430, 1160, 230);
    c.fillStyle = 'rgba(214,170,102,.7)'; c.fillRect(560, 432, 800, 2); c.fillRect(560, 656, 800, 2);
    goldText(c, NAME, 960, 585, 130, 22);
    txt(c, 'HISTOIRES ANIMÉES  ·  NOIR & OR  ·  NOUVEL ÉPISODE CHAQUE SEMAINE', 960, 640, 26, { fill: '#efe3cb', ls: 5, weight: 600 });
  } else {
    // photo de profil : carré 1080×1080 centré (x 420–1500)
    const cx = 960, cy = 540;
    c.fillStyle = '#050403'; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(cx, cy + 60, 30, cx, cy, 560); g.addColorStop(0, '#f6cf86'); g.addColorStop(.45, '#b98544'); g.addColorStop(1, '#1a120a'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 540, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(cx, cy, 540, 0, TAU); c.clip();
    c.save(); c.translate(cx, cy - 40); c.rotate(T * .02); c.fillStyle = 'rgba(255,230,170,.13)'; for (let k = 0; k < 24; k++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 700, k * TAU / 24, k * TAU / 24 + TAU / 48); c.closePath(); c.fill(); } c.restore();
    drawNox(c, { x: cx, y: cy - 10 + 664 * 3.0, s: 3.0, T: 2.0, noShadow: true, glow: 2.6 });
    c.restore();
    c.lineWidth = 14; c.strokeStyle = '#d8b273'; c.beginPath(); c.arc(cx, cy, 532, 0, TAU); c.stroke();
  }
  c.setTransform(1, 0, 0, 1, 0, 0); return cv.toDataURL('image/png');
};
document.fonts.load('700 40px Oswald').then(() => document.fonts.load('600 40px Oswald')).then(() => { window.__ready = true; });
