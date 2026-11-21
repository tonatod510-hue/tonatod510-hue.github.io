// Planche de personnages (test)
initCore();
async function boot() {
  await document.fonts.load('700 40px Oswald');
  const c = OX; c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  c.fillStyle = vGrad(c, 0, H, [[0, '#2a1f13'], [1, '#0e0a07']]); c.fillRect(0, 0, W, H);
  const T = 1.3;
  const row = [['aya', 'Aya', 'smile', {pendant:true}], ['nina', 'Nina', 'happy', {}], ['vic', 'Victoria', 'cold', {}], ['mom', 'Maman', 'smile', {}], ['timi', 'Timi', 'laugh', {}], ['morel', 'M. Morel', 'neutral', {}]];
  row.forEach(([id, name, ex, extra], i) => {
    const x = 150 + i * 250, y = 760;
    drawPerson(c, id, { x, y, s: .92, T, expr: ex, seed: i + 1, armL: i === 1 ? 'wave' : i === 2 ? 'hips' : 'down', armR: i === 2 ? 'hips' : i === 0 ? 'strap' : i === 3 ? 'offer' : 'down', ...extra });
    txt(c, name.toUpperCase(), x, 830, 34, { fill: '#e2c08a' });
  });
  drawNox(c, { x: 1700, y: 760, s: .92, T }); txt(c, 'NOX', 1700, 830, 34, { fill: '#e2c08a' });
  const ex = ['neutral', 'smile', 'happy', 'laugh', 'sad', 'worried', 'nervous', 'scared', 'surprised', 'annoyed', 'cold', 'smirk', 'shy', 'moved', 'deadpan', 'determined'];
  ex.forEach((e, i) => {
    const x = 70 + i * 113, y = 1030;
    c.save(); c.beginPath(); c.rect(x - 56, 860, 112, 200); c.clip();
    drawPerson(c, 'aya', { x, y: y + 620 * .26, s: .26 * 1.0 + .0, T: 2.0 + i * .37, expr: e, seed: 3 + i, noShadow: true, tears: e === 'moved' ? .6 : 0, talk: 0 });
    c.restore();
  });
  ex.forEach((e, i) => txt(c, e, 70 + i * 113, 1072, 16, { fill: '#bfae8f', weight: 600 }));
  window.__ready = true;
}
boot();
