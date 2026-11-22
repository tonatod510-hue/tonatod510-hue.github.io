// Affiche de l'épisode (key art)
initCore();
window.show = () => {
  const c = OX, T = 2.2; c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  skyGrad(c, -M, 900, 'dusk'); stars(c, 120, [0, 0, W, 500], T, .9); sun(c, 1380, 760, 260, 1);
  skyline(c, 860, 1.1, 'day', T, 61, 2); skyline(c, 980, 1.6, 'night', T, 67, 1);
  c.fillStyle = '#0a0a0c'; c.fillRect(-M, 900, W + 2 * M, 400);
  drawNox(c, { x: 1390, y: 905, s: .44, T, noShadow: true, glow: 2.4, turn: -.1 });
  drawPerson(c, 'aya', { x: 560, y: 1500, s: 1.6, T, expr: 'determined', turn: .3, look: .8, pendant: true, armL: 'strap', armR: 'pendant', noShadow: true });
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.35, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const gt = c.createLinearGradient(0, 120, 0, 290); gt.addColorStop(0, '#fbe6b8'); gt.addColorStop(.5, '#dcb172'); gt.addColorStop(1, '#a87a42');
  txt(c, 'AURUM', 1330, 300, 210, { fill: gt, ls: 34, shadow: 'rgba(0,0,0,.85)', blur: 30, sy: 6 });
  txt(c, 'ÉPISODE 1 LE PREMIER JOUR', 1330, 380, 40, { fill: '#efe3cb', ls: 9, weight: 600, shadow: 'rgba(0,0,0,.8)', blur: 10 });
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(VIGN, 0, 0);
  return cv.toDataURL('image/jpeg', .95);
};
document.fonts.load('700 40px Oswald').then(() => document.fonts.load('600 40px Oswald')).then(() => { window.__ready = true; });
