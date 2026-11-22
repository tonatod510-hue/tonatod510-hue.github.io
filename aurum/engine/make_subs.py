"""Sous-titres de l'épisode depuis la timeline : .srt (fichier à part) et .ass (incrustation 4K)."""
import json, sys, textwrap
tl = json.load(open(sys.argv[1])); base = sys.argv[2]
def ts_srt(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
def ts_ass(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h)}:{int(m):02d}:{s:05.2f}"
def wrap(s):
    if len(s) <= 44: return [s]
    words = s.split(' '); best = None
    for i in range(1, len(words)):
        a, b = ' '.join(words[:i]), ' '.join(words[i:]); score = abs(len(a) - len(b)) + (0 if a[-1] in ',.…?!' else 6)
        if best is None or score < best[0]: best = (score, [a, b])
    return best[1]
import re
def chunks(text):
    parts = [p for p in re.split(r'(?<=[.…?!])\s+', text) if p]; out = []
    for p in parts:
        if out and len(out[-1]) + 1 + len(p) <= 84: out[-1] += ' ' + p
        else: out.append(p)
    return out
raw = sorted(tl['lines'], key=lambda l: l['t0']); lines = []
for l in raw:
    cs = chunks(l['text']); tot = sum(len(c) for c in cs); t = l['t0']
    for c in cs: d = (l['t1'] - l['t0']) * len(c) / tot; lines.append({**l, 't0': t, 't1': t + d, 'text': c}); t += d
srt, ev = [], []
for i, l in enumerate(lines):
    t0, t1 = l['t0'] - .05, l['t1'] + .35
    if i + 1 < len(lines): t1 = min(t1, lines[i + 1]['t0'] - .08)
    t1 = max(t1, t0 + 1.0)
    rows = wrap(l['text'])
    srt.append(f"{i + 1}\n{ts_srt(t0)} --> {ts_srt(t1)}\n" + ("\n".join(f"<i>{r}</i>" for r in rows) if l['who'] == 'N' else "\n".join(rows)) + "\n")
    txt = "\\N".join(rows)
    ev.append(f"Dialogue: 0,{ts_ass(t0)},{ts_ass(t1)},{'Narr' if l['who'] == 'N' else 'Dial'},,0,0,0,,{txt}")
open(base + '.srt', 'w').write("\n".join(srt))
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 3840
PlayResY: 2160
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Dial,Inter,88,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4.5,2.5,2,240,240,150,1
Style: Narr,Inter,88,&H00E6F2FF,&H000000FF,&H00000000,&H80000000,-1,-1,0,0,100,100,0,0,1,4.5,2.5,2,240,240,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(base + '.ass', 'w').write(head + "\n".join(ev) + "\n")
print(len(lines), 'sous-titres ->', base + '.srt / .ass')
