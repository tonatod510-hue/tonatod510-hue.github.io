// Affiche / miniature de l'épisode 2 « N. » : le soleil couchant derrière l'anneau de la Centrale (une éclipse)
initCore();
window.show = () => {
  const c = OX, T = 2.2; c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  skyGrad(c, -M, 980, 'dusk'); stars(c, 110, [0, 0, W, 420], T, .9);
  glow(c, 1250, 330, 520, 'rgba(255,190,110,A)', .55); sun(c, 1250, 330, 150, 1);
  skyline(c, 880, .9, 'night', T, 61, 2);
  centrale(c, 1250, 905, .88, T, 1);
  skyline(c, 960, 1.25, 'night', T, 67, 1);
  c.fillStyle = vGrad(c, 940, H, [[0, '#0c0907'], [1, '#040302']]); c.fillRect(-M, 940, W + 2 * M, 400);
  drawNox(c, { x: 1660, y: 1075, s: .98, T, noShadow: true, glow: 2.4, turn: -.3, armL: 'pocket', armR: { tx: -170, ty: -470, b: 1, item: badgeItem } });
  drawPerson(c, 'aya', { x: 420, y: 1520, s: 1.5, T, expr: 'determined', turn: .35, look: 1, pendant: true, armL: 'strap', armR: 'pendant', noShadow: true });
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(.32, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const gt = c.createLinearGradient(0, 110, 0, 270); gt.addColorStop(0, '#fbe6b8'); gt.addColorStop(.5, '#dcb172'); gt.addColorStop(1, '#a87a42');
  txt(c, 'AURUM', 560, 270, 190, { fill: gt, ls: 30, shadow: 'rgba(0,0,0,.85)', blur: 30, sy: 6 });
  txt(c, 'ÉPISODE 2 « N. »', 560, 345, 42, { fill: '#efe3cb', ls: 9, weight: 600, shadow: 'rgba(0,0,0,.8)', blur: 10 });
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(VIGN, 0, 0);
  return cv.toDataURL('image/jpeg', .95);
};
document.fonts.load('700 40px Oswald').then(() => document.fonts.load('600 40px Oswald')).then(() => { window.__ready = true; });
