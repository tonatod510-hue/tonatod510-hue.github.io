// Rendu d'un Short vertical 1080×1920 (sans son).
// usage : node render_short.js page.html id sortie.mp4 [jobs=4] [plan.json]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const [page, id, out, jobs = '4', planOut = ''] = process.argv.slice(2);
  const J = +jobs, b = await chromium.launch(), errs = [];
  const open = async (scale) => { const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + page + '?scale=' + scale); await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 }); return p; };
  const t0 = Date.now();
  const lo = await open(0.25); const plan = await lo.evaluate(id => window.SH.prepare(id), id); await lo.close();
  if (planOut) fs.writeFileSync(planOut, JSON.stringify(plan));
  const total = plan.n + plan.end; console.log(`${id} : ${total} images (${(total / 24).toFixed(1)} s), trajectoire en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const pages = []; for (let k = 0; k < J; k++) { const p = await open(1080 / 607.5); await p.evaluate(([id, plan]) => window.SH.setPlan(id, plan), [id, plan]); pages.push(p); }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '24', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i += J) {
    const batch = await Promise.all(pages.map((p, k) => i + k < total ? p.evaluate(f => window.SH.frame(f), i + k) : null));
    for (const d of batch) if (d) { if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    if (i % 240 < J) console.log(`  ${(i / 24).toFixed(0)} / ${(total / 24).toFixed(0)} s — ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  if (errs.length) console.log('ERR', [...new Set(errs)].slice(0, 5));
  console.log('✓', out, ((Date.now() - t0) / 60000).toFixed(1), 'min');
})();
