// Rendu de l'épisode image par image → vidéo H.264 (sans son).
// usage : node render_ep.js page.html sortie.mp4 [scale=2] [fps=24] [jobs=4] [from] [to]
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [page, out, scale = '2', fps = '24', jobs = '4', from = '0', to = ''] = process.argv.slice(2);
  const J = +jobs, F = +fps, url = 'file://' + page + '?scale=' + scale;
  const b = await chromium.launch(); const pages = [];
  for (let k = 0; k < J; k++) { const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', e => console.error('ERR', e.message)); await p.goto(url); await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 }); pages.push(p); }
  const dur = await pages[0].evaluate(() => window.HW.duration());
  const first = Math.round(+from * F), last = Math.round((to ? Math.min(+to, dur) : dur) * F);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(F), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(F), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); console.log(`rendu ${first}→${last} images (${((last - first) / F).toFixed(1)} s) en ${scale}x`);
  for (let i = first; i < last; i += J) {
    const batch = await Promise.all(pages.map((p, k) => i + k < last ? p.evaluate(t => window.HW.frame(t, 'image/jpeg', .92), (i + k) / F) : null));
    for (const d of batch) if (d) { if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    if ((i - first) % (F * 10) < J) { const el = (Date.now() - t0) / 1000, done = i - first + J, eta = el / done * (last - first - done); console.log(`  ${(i / F).toFixed(0)} s / ${(last / F).toFixed(0)} s — ${el.toFixed(0)} s écoulées, reste ~${(eta / 60).toFixed(1)} min`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('✓', out, ((Date.now() - t0) / 60000).toFixed(1), 'min');
})();
