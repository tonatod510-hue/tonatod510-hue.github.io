// node probe.js page.html outdir t1,t2,... [scale]  → images + timeline.json
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [page, outdir, times, scale = '0.5'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + page + '?scale=' + scale); await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 }).catch(() => errs.push('timeout'));
  const tl = await p.evaluate(() => window.HW.timeline()); fs.writeFileSync(outdir + '/timeline.json', JSON.stringify(tl, null, 1));
  console.log('durée', tl.dur.toFixed(1), 's,', tl.shots.length, 'plans');
  if (times !== '-') {
    let list = times === 'mid' ? tl.shots.map(s => s.start + s.dur * .6) : times.split(',').map(Number);
    let i = 0; for (const t of list) { const d = await p.evaluate(t => window.HW.frame(t, 'image/jpeg', .85), t); fs.writeFileSync(`${outdir}/f${String(i++).padStart(2, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  }
  if (errs.length) console.log('ERR', [...new Set(errs)].slice(0, 8)); await b.close();
})();
