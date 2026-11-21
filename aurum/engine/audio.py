"""AURUM — bande-son de l'épisode : musique originale synthétisée, bruitages,
voix placées sur la timeline, ducking de la musique sous les dialogues.
usage : python3 audio.py timeline.json vo_dir out.wav"""
import json, sys, os, subprocess, numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
SR = 48000
rng = np.random.default_rng(7)
TL = json.load(open(sys.argv[1])); VODIR = sys.argv[2]; OUT = sys.argv[3]
DUR = TL['dur'] + 1.0; N = int(DUR * SR)

def t_(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a=.01, d=.1, s=.7, r=.3):
    e = np.ones(n) * s; A, D, R = int(a * SR), int(d * SR), int(r * SR)
    e[:A] = np.linspace(0, 1, max(A, 1))[:len(e[:A])]; e[A:A + D] = np.linspace(1, s, max(D, 1))[:len(e[A:A + D])]
    if R and n > R: e[-R:] *= np.linspace(1, 0, R)
    return e
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def place(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR);
    if i >= len(buf): return
    x = x[:max(0, len(buf) - i)]
    if x.ndim == 1: x = np.stack([x * (1 - max(0, pan)), x * (1 + min(0, pan))], 1)
    buf[i:i + len(x)] += x * g
IR = None
def reverb(x, wet=.35, length=2.6):
    global IR
    if IR is None:
        n = int(length * SR); tt = np.arange(n) / SR
        IR = np.stack([rng.standard_normal(n) * np.exp(-tt * 3.2), rng.standard_normal(n) * np.exp(-tt * 3.2)], 1); IR = lp(IR.T, 6000).T; IR /= np.sqrt((IR ** 2).sum(0))
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = np.stack([fftconvolve(x[:, k], IR[:, k])[:len(x)] for k in range(2)], 1)
    return x * (1 - wet) + y * wet * 1.4

# ---------- instruments ----------
def piano(f, d, v=.5):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * (1 + .0004 * k * k) * t) * (.6 / k ** 1.3) * np.exp(-t * (1.2 + k * .9)) for k in range(1, 7))
    x *= np.minimum(1, t / .004); return x * v
def pad(freqs, d, v=.2, att=1.2):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * dt * t + ph) for f in freqs for dt, ph in ((1, 0), (1.004, 1.1), (.996, 2.3))) / (3 * len(freqs))
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / min(att, d / 2)); return lp(x * e, 2500) * v
def pluck(f, d, v=.4):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (3.5 + k * 2.2)) / k for k in range(1, 9))
    return x * np.minimum(1, t / .002) * v
def bell(f, d, v=.3):
    t = t_(d); m = np.sin(2 * np.pi * f * 1.4 * t) * 2.2 * np.exp(-t * 2.5)
    return np.sin(2 * np.pi * f * t + m) * np.exp(-t * 1.6) * v
def bass(f, d, v=.35):
    t = t_(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 1.5) * np.minimum(1, t / .01) * v
def drone(f, d, v=.25):
    t = t_(d); x = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.501 * t) + .3 * lp(rng.standard_normal(len(t)), 300)
    return x * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 1.5) * v
def boom(d=3, v=.8):
    t = t_(d); return (np.sin(2 * np.pi * (55 - 25 * t / d) * t) * np.exp(-t * 2) + lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 4) * .5) * v

# ---------- musique : une fonction par ambiance ----------
CH = {'Dm': [50, 53, 57, 62], 'Bb': [46, 50, 53, 58], 'F': [53, 57, 60, 65], 'C': [48, 52, 55, 60], 'Gm': [55, 58, 62, 67], 'A': [45, 49, 52, 57], 'Am': [45, 48, 52, 57]}
def cue(name, d):
    out = np.zeros((int(d * SR) + SR * 3, 2)); bpm = 76; beat = 60 / bpm
    def add(x, t, g=1, pan=0): place(out, x, t, g, pan)
    if name in ('night', 'sad'):
        prog = ['Dm', 'Bb', 'F', 'A'] if name == 'night' else ['Dm', 'Gm', 'Bb', 'A']
        for b in range(int(d / (beat * 4)) + 1):
            c = CH[prog[b % 4]]; t0 = b * beat * 4
            add(pad([midi(n) for n in c[:3]], beat * 4 + .5, .12), t0)
            for k, n in enumerate([c[0] + 12, c[2] + 12, c[3] + 12, c[2] + 12] if name == 'night' else [c[3] + 12, c[2] + 12, c[1] + 12, c[2] + 12]):
                add(piano(midi(n), 2.5, .16), t0 + k * beat, 1, -.2 + k * .13)
    elif name == 'title':
        add(pad([midi(n) for n in [38, 50, 57, 62, 65]], d, .22, att=2.5), 0); add(boom(4, .9), 2.6)
        for k, n in enumerate([74, 77, 81, 86]): add(bell(midi(n), 3, .18), 2.6 + k * .18, 1, -.3 + k * .2)
    elif name in ('home', 'tender', 'light', 'school'):
        prog = {'home': ['F', 'C', 'Dm', 'Bb'], 'tender': ['Bb', 'F', 'Gm', 'F'], 'light': ['C', 'Am', 'F', 'C'], 'school': ['F', 'Dm', 'Bb', 'C']}[name]
        mel = {'home': [77, 76, 74, 72, 74, 72, 69, 72], 'tender': [74, 72, 70, 69, 70, 72, 74, 77], 'light': [72, 76, 79, 76, 77, 74, 72, 71], 'school': [72, 74, 77, 74, 72, 70, 69, 72]}[name]
        for b in range(int(d / (beat * 4)) + 1):
            c = CH[prog[b % 4]]; t0 = b * beat * 4
            add(bass(midi(c[0] - 12), beat * 2, .22), t0); add(bass(midi(c[0] - 12), beat * 2, .16), t0 + beat * 2)
            for k in range(8):
                n = c[k % 3] + 12; add(pluck(midi(n), .9, .1 if name != 'light' else .13), t0 + k * beat / 2, 1, (-.4, .4)[k % 2])
            if name in ('home', 'tender'): add(pad([midi(n) for n in c[:3]], beat * 4 + .4, .07), t0)
            m = mel[(b * 2) % len(mel)], mel[(b * 2 + 1) % len(mel)]
            if b % 2 == 0 or name != 'school': add(piano(midi(m[0]), 1.8, .14), t0); add(piano(midi(m[1]), 1.8, .12), t0 + beat * 2)
            if name == 'school' or name == 'light':
                for k in range(8): sh = hp(rng.standard_normal(int(.05 * SR)), 6000) * np.exp(-t_(.05) * 60); add(sh, t0 + k * beat / 2, .05)
    elif name == 'city':
        for b in range(int(d / (beat * 2)) + 1):
            t0 = b * beat * 2; c = CH[['Dm', 'C', 'Bb', 'C'][b % 4]]
            for k, n in enumerate([c[0] + 12, c[2] + 12, c[1] + 24, c[2] + 12]): add(pluck(midi(n), 1.0, .11), t0 + k * beat / 2, 1, (-.5, .5)[k % 2])
            add(bass(midi(c[0] - 12), beat * 2, .2), t0)
            for k in range(4): sh = hp(rng.standard_normal(int(.06 * SR)), 5000) * np.exp(-t_(.06) * 50); add(sh, t0 + k * beat / 2 + beat / 4, .04)
        add(pad([midi(n) for n in [50, 57, 62]], d, .06), 0)
    elif name in ('mystery', 'nox'):
        add(drone(midi(38), d + 1, .22), 0); add(drone(midi(45), d + 1, .08), 0)
        motif = [62, 69, 68] if name == 'nox' else [74, 68, 73]
        for r in range(int(d / 3.2) + 1):
            for k, n in enumerate(motif): add(bell(midi(n), 3.5, .14), r * 3.2 + k * .55, 1, (-.4, 0, .4)[k])
        if name == 'nox': add(boom(4, .6), .2)
    elif name == 'tension':
        add(drone(midi(40), d + 1, .16), 0); add(pad([midi(76)], d, .04, att=2), 0)
        for b in range(int(d / beat) + 1): add(bass(midi(28), .5, .3), b * beat)
    elif name == 'reveal':
        t = t_(d); sw = np.sin(2 * np.pi * (220 + 220 * t / d) * t) * .05 * (t / d) ** 2; add(sw, 0)
        add(drone(midi(37), d + 1, .2), 0)
        for k in range(int(d / .5)): add(bell(midi(80 + (k % 3)), 1.5, .05 * (k / (d / .5))), k * .5)
    elif name == 'end':
        add(boom(5, 1.0), 0); add(bell(midi(62), 5, .22), 0); add(bell(midi(69), 5, .16), .6); add(bell(midi(68), 6, .18), 1.2)
        add(pad([midi(n) for n in [38, 50, 57]], d + 2, .12, att=1), .2)
    return out

music = np.zeros((N, 2))
cues = sorted(TL['cues'], key=lambda c: c['t'])
for i, c in enumerate(cues):
    if c['cue'] is None: continue
    t0 = c['t']; t1 = cues[i + 1]['t'] if i + 1 < len(cues) else DUR
    d = t1 - t0 + .8
    x = reverb(cue(c['cue'], d), .3)[:int(d * SR)]
    fi, fo = int(.4 * SR), int(.8 * SR); x[:fi] *= np.linspace(0, 1, fi)[:, None]; x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    place(music, x, max(0, t0 - .2), 1.0)
print('musique ok')

# ---------- bruitages ----------
def noise(d): return rng.standard_normal(int(d * SR))
def addat(x, b, i):
    if i >= len(x) or i < 0: return
    n = min(len(b), len(x) - i); x[i:i + n] += b[:n]
def sfx(k, d=1.0, **kw):
    tt = t_(d)
    if k == 'tick':
        x = np.zeros(int(d * SR)); c = hp(noise(.008), 2000) * np.exp(-t_(.008) * 400)
        for s in np.arange(0, d, 1.0): i = int(s * SR); addat(x, c * (1 if int(s) % 2 else .7), i)
        return x * .5
    if k == 'alarm':
        x = np.zeros(int(d * SR))
        for s in np.arange(0, d, .5):
            for q in range(4): i = int((s + q * .08) * SR); b = np.sign(np.sin(2 * np.pi * 2100 * t_(.05))) * .25; addat(x, b, i)
        return lp(x, 6000)
    if k == 'click': return hp(noise(.03), 1500) * np.exp(-t_(.03) * 150) * .8
    if k == 'sigh': n = bp(noise(1.0), 400, 2200); return n * np.sin(np.pi * t_(1.0)) ** 2 * .12
    if k == 'breath': n = bp(noise(2.2), 300, 2000); e = np.concatenate([np.sin(np.pi * t_(1.0)) ** 2, np.zeros(int(.2 * SR)), np.sin(np.pi * t_(1.0)) ** 2 * .7]); return n[:len(e)] * e * .1
    if k == 'swish': n = noise(.9); return bp(n, 600, 5000) * np.sin(np.pi * t_(.9)) ** 2 * .25
    if k == 'pot':
        x = lp(noise(3), 400) * .03
        for s in rng.uniform(0, 2.8, 25): i = int(s * SR); b = np.sin(2 * np.pi * rng.uniform(300, 700) * t_(.04)) * np.exp(-t_(.04) * 90) * .08; addat(x, b, i)
        return x
    if k == 'steps':
        heavy = kw.get('heavy'); x = np.zeros(int(d * SR)); per = .6 if heavy else .45
        for j, s in enumerate(np.arange(0, d, per)):
            i = int(s * SR); st = lp(noise(.09), 900 if heavy else 1800) * np.exp(-t_(.09) * 45) * (.5 if heavy else .3) * (1 if j % 2 else .8); addat(x, st, i)
        return x
    if k == 'shimmer':
        x = np.zeros(int(2.5 * SR))
        for j, n in enumerate([84, 88, 91, 96, 91]): b = bell(midi(n), 1.8, .08); i = int(j * .09 * SR); addat(x, b, i)
        return x
    if k == 'door':
        cr = np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 3 * t_(.8))) / SR) * .08 * np.sin(np.pi * t_(.8))
        th = lp(noise(.25), 300) * np.exp(-t_(.25) * 18) * .6
        return np.concatenate([cr, th])
    if k in ('ambCity',):
        x = lp(noise(d), 500) * .05 + bp(noise(d), 1000, 3000) * .008
        for s in rng.uniform(0, d - .5, int(d / 1.5)): i = int(s * SR); ch = np.sin(2 * np.pi * (3200 + 800 * np.sin(2 * np.pi * 9 * t_(.15))) * t_(.15)) * np.sin(np.pi * t_(.15)) * .02; addat(x, ch, i)
        return x * np.minimum(1, tt / .5) * np.minimum(1, (d - tt) / .5)
    if k == 'crowd':
        x = bp(noise(d), 200, 2500) * .02 * (1 + .5 * np.sin(2 * np.pi * .7 * tt))
        clips = [f for f in os.listdir(VODIR) if f.endswith('.wav')]
        for s in np.arange(0, d, .35):
            y = loadwav(os.path.join(VODIR, clips[rng.integers(len(clips))])); a = rng.integers(0, max(1, len(y) - SR)); seg = y[a:a + int(rng.uniform(.4, 1.0) * SR)]
            seg = lp(seg[::-1], 1400) * np.hanning(len(seg)) * .05; i = int(s * SR); addat(x, seg, i)
        return x * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .6)
    if k == 'bump': return lp(noise(.3), 250) * np.exp(-t_(.3) * 20) * .9
    if k == 'paper':
        x = np.zeros(int(1.2 * SR))
        for s in rng.uniform(0, 1.0, 14): i = int(s * SR); b = hp(noise(.06), 2500) * np.exp(-t_(.06) * 50) * .15; addat(x, b, i)
        return x
    if k == 'bell':
        e = np.minimum(1, tt / .02) * np.minimum(1, (d - tt) / .15)
        return (np.sin(2 * np.pi * 950 * tt) + .6 * np.sin(2 * np.pi * 1900 * tt) + .3 * np.sin(2 * np.pi * 2850 * tt)) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 24 * tt))) * e * .09
    if k == 'chalk':
        x = np.zeros(int(1.0 * SR))
        for s in [0, .18, .4]: i = int(s * SR); b = hp(noise(.05), 3000) * np.exp(-t_(.05) * 70) * .2; addat(x, b, i)
        return x
    if k == 'heart':
        x = np.zeros(int(d * SR))
        for s in np.arange(0, d, .82):
            for o, g in ((0, 1), (.2, .7)): i = int((s + o) * SR); b = np.sin(2 * np.pi * 52 * t_(.18)) * np.exp(-t_(.18) * 22) * .7 * g; addat(x, b, i)
        return x
    if k == 'whisper': n = bp(noise(1.4), 1500, 6000); return n * (.5 + .5 * np.sin(2 * np.pi * 7 * t_(1.4))) * np.sin(np.pi * t_(1.4)) * .05
    if k == 'chair': n = bp(noise(.5), 200, 1200) * (1 + np.sin(2 * np.pi * 40 * t_(.5))) * np.sin(np.pi * t_(.5)) * .12; return n
    if k == 'doorCreak':
        f = 140 + 90 * t_(1.4) + 30 * np.sin(2 * np.pi * 5 * t_(1.4)); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .05
        return lp(x, 2500) * np.abs(np.sin(np.pi * t_(1.4))) ** .5
    if k == 'hum': return drone(midi(38), 3.0, .12)
    if k == 'whoosh': n = noise(1.2); return bp(n, 300, 4000) * (t_(1.2) / 1.2) ** 2 * np.exp(-np.maximum(0, t_(1.2) - 1.0) * 30) * .25
    if k == 'sting': return reverb(boom(2.5, .5) + bell(midi(86), 2.5, .12), .5)
    if k == 'zip':
        x = np.zeros(int(.5 * SR))
        for s in np.arange(0, .45, .012): i = int(s * SR); b = hp(noise(.004), 3000) * .15; addat(x, b, i)
        return x
    if k == 'wind': return bp(noise(d), 200, 900) * (.6 + .4 * np.sin(2 * np.pi * .3 * tt)) * np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .8) * .08
    if k == 'hit': return reverb(boom(4, 1.0), .5)
    return np.zeros(10)
def loadwav(p):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
fx = np.zeros((N, 2))
for s in TL['sfx']:
    x = sfx(s['k'], s.get('dur', 1.0), heavy=s.get('heavy'))
    place(fx, x if x.ndim == 2 else x, s['t'], .9)
print('bruitages ok :', len(TL['sfx']))

# ---------- voix ----------
dlg = np.zeros((N, 2)); active = np.zeros(N)
for l in TL['lines']:
    p = os.path.join(VODIR, l['id'] + '.wav')
    if not os.path.exists(p): continue
    y = loadwav(p)
    if l['who'] == 'N': y = reverb(y, .12, 1.2)[:, 0] if False else y
    place(dlg, y, l['t0'], 1.0)
    a, b = int(l['t0'] * SR), int(l['t1'] * SR); active[a:b] = 1
# ducking : -9 dB sur la musique quand quelqu'un parle (lissé)
k = int(.25 * SR); sm = np.convolve(active, np.ones(k) / k, mode='same'); duck = 1 - .65 * sm
mix = music * duck[:, None] * .55 + fx * .8 + dlg * 1.0
mix = hp(mix.T, 30).T
peak = np.max(np.abs(mix)) + 1e-9; mix *= .89 / peak
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', OUT], input=pcm.tobytes())
print('mix ok', OUT, round(DUR, 1), 's')
