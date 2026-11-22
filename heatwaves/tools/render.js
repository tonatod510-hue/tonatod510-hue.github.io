// Rendu image par image de la vidéo en MP4 (sans perte de fluidité).
// Usage :  node tools/render.js [sortie.mp4] [--song] [--audio son.mp3] [--lyrics paroles.txt] [--no-title] [--stills 1,7,13] [--fps 30] [--from 0 --to 30]
// Prérequis : Node.js, `npm i playwright` (+ `npx playwright install chromium`) et ffmpeg dans le PATH.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const out = args[0] && !args[0].startsWith('--') ? args[0] : 'heatwaves.mp4';
const fps = +opt('--fps', 30);
const stills = opt('--stills', null);
const lyricsFile = opt('--lyrics', null);
const noTitle = args.includes('--no-title');
const song = args.includes('--song');
const audioFile = opt('--audio', null);
const from = parseFloat(opt('--from', '0')), to = opt('--to', null);
const JOBS = 4;

(async () => {
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?render=1';
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const pages = [];
  for (let k = 0; k < (stills ? 1 : JOBS); k++) {
    const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.error('page error:', e.message));
    await p.goto(url); await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
    const lyr = lyricsFile ? fs.readFileSync(lyricsFile, 'utf8') : '';
    if (song) await p.evaluate(() => window.HW.setMode('song'));
    await p.evaluate(([l, t]) => window.HW.setLyrics(l, t), [lyr, !noTitle]);
    pages.push(p);
  }
  const dur = await pages[0].evaluate(() => window.HW.duration());
  if (stills) {
    for (const s of stills.split(',')) {
      const t = parseFloat(s);
      const b64 = await pages[0].evaluate(t => window.HW.frame(t, 'image/png'), t);
      const f = out.replace(/\.mp4$/, '') + `_t${t.toFixed(2)}.png`;
      fs.writeFileSync(f, Buffer.from(b64.split(',')[1], 'base64')); console.log('still', f);
    }
    await browser.close(); return;
  }
  const end = to ? Math.min(dur, parseFloat(to)) : dur;
  const first = Math.round(from * fps), total = Math.round(end * fps);
  console.log(`durée ${dur.toFixed(2)} s — images ${first} → ${total}`);
  const len = (total - first) / fps;
  const audioIn = audioFile ? ['-ss', String(from), '-t', String(len), '-i', audioFile] : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'];
  const afade = audioFile ? ['-af', `afade=t=out:st=${Math.max(0, len - 2.5).toFixed(2)}:d=2.5`] : [];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...audioIn, '-shortest', ...afade,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps),
    '-c:a', 'aac', '-b:a', audioFile ? '192k' : '128k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = first; i < total; i += JOBS) {
    const batch = await Promise.all(pages.map((p, k) => i + k < total ? p.evaluate(t => window.HW.frame(t, 'image/jpeg', .95), (i + k) / fps) : null));
    for (const b64 of batch) if (b64) { if (!ff.stdin.write(Buffer.from(b64.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    if ((i - first) % 300 < JOBS) console.log(`  ${i}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close(); console.log('✓', out);
})();
