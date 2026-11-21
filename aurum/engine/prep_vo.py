"""Prépare les voix : coupe les silences, normalise le volume, calcule la durée
et l'enveloppe (100 valeurs/s) qui anime la bouche. Sortie : vo_proc/*.wav + vo.js"""
import subprocess, json, sys, os, numpy as np
SRC, DST, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 44100
def load(p):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
def save(p, y):
    y16 = (np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', p], input=y16)
def trim(y, thr_db=-42, pad=.06):
    hop = int(SR * .01); e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2) + 1e-12) for i in range(0, len(y) - hop, hop)])
    db = 20 * np.log10(e + 1e-9); on = np.where(db > thr_db)[0]
    if not len(on): return y
    a = max(0, on[0] * hop - int(pad * SR)); b = min(len(y), (on[-1] + 1) * hop + int(pad * SR)); return y[a:b]
def env(y):
    hop = int(SR * .01); e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2) + 1e-12) for i in range(0, max(1, len(y) - hop), hop)])
    db = 20 * np.log10(e + 1e-9); v = np.clip((db + 38) / 26, 0, 1)
    v = np.convolve(v, np.ones(3) / 3, mode='same'); return [round(float(x), 2) for x in v]
data = {}
clips = {os.path.splitext(f)[0]: os.path.join(SRC, f) for f in os.listdir(SRC) if f.endswith('.mp3')}
for k, p in sorted(clips.items()):
    y = trim(load(p)); data[k] = y
# réplique réutilisée : « Il y a trois ans... » = début de la narration n04
if 'n04' in data and 'a11' not in data:
    y = data['n04']; hop = int(SR * .01); e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y) - hop, hop)])
    db = 20 * np.log10(e + 1e-9); start = 80; gap = next(i for i in range(start, len(db)) if all(db[i:i + 12] < -40)) if any(db[80:250] < -40) else 125
    cut = y[:gap * hop + int(.05 * SR)].copy(); fade = int(.06 * SR); cut[-fade:] *= np.linspace(1, 0, fade); data['a11'] = cut
out = {}
for k, y in data.items():
    peak = np.max(np.abs(y)) + 1e-9; rms = np.sqrt(np.mean(y ** 2)); g = min(.95 / peak, .12 / (rms + 1e-9)); y = y * g
    save(os.path.join(DST, k + '.wav'), y)
    out[k] = {'dur': round(len(y) / SR, 3), 'env': env(y)}
open(OUT, 'w').write('const VO = ' + json.dumps(out) + ';\n')
print(len(out), 'voix ;', ', '.join(f"{k}:{v['dur']}" for k, v in sorted(out.items())))
