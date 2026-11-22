// Planche d'expressions en gros plan (test)
initCore();
async function boot() {
  await document.fonts.load('700 40px Oswald');
  const c = OX; c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  c.fillStyle = '#17110b'; c.fillRect(0, 0, W, H);
  const ex = ['neutral', 'smile', 'happy', 'laugh', 'sad', 'worried', 'nervous', 'scared', 'surprised', 'annoyed', 'cold', 'smirk', 'shy', 'moved', 'deadpan', 'determined'];
  ex.forEach((e, i) => {
    const col = i % 8, row = Math.floor(i / 8), x = 120 + col * 240, y = 120 + row * 470;
    c.save(); c.beginPath(); c.rect(x - 115, y - 110, 230, 330); c.clip();
    const who = row === 0 ? 'aya' : (i % 3 === 0 ? 'nina' : i % 3 === 1 ? 'vic' : 'aya');
    drawPerson(c, who, { x, y: y + 2.1 * 640, s: 2.1, T: 3 + i * .41, expr: e, seed: 5 + i, noShadow: true, tears: e === 'moved' ? .7 : 0, talk: 0 });
    c.restore(); txt(c, e, x, y + 250, 28, { fill: '#e2c08a' });
  });
  // bouche qui parle
  [0, .25, .5, .75, 1].forEach((a, i) => { const x = 1080 + i * 170, y = 1040; c.save(); c.beginPath(); c.rect(x - 80, 960 - 60, 160, 150); c.clip(); drawPerson(c, 'aya', { x, y: y + 1.4 * 600, s: 1.4, T: 1, expr: 'neutral', talk: a, noShadow: true }); c.restore(); });
  window.__ready = true;
}
boot();
