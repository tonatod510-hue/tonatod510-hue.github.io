# Assemble une page HTML autonome : polices + scripts du moteur + scène demandée.
import base64, pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
FONT = pathlib.Path(sys.argv[3]) if len(sys.argv) > 3 else None
def b64(p): return base64.b64encode(p.read_bytes()).decode()
fonts = ''
if FONT:
    fonts = f"""@font-face{{font-family:'Oswald';font-weight:700;src:url(data:font/woff2;base64,{b64(FONT/'oswald-latin-700-normal.woff2')}) format('woff2');}}
@font-face{{font-family:'Oswald';font-weight:600;src:url(data:font/woff2;base64,{b64(FONT/'oswald-latin-600-normal.woff2')}) format('woff2');}}"""
scripts = sys.argv[2].split(',')
js = '\n'.join((HERE / s).read_text() for s in scripts)
html = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>AURUM</title>
<style>{fonts} html,body{{margin:0;background:#000}} canvas{{display:block;max-width:100vw;height:auto}}</style></head>
<body><canvas id="cv"></canvas><script>{js}</script></body></html>"""
out = pathlib.Path(sys.argv[1]); out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html); print('built', out, len(html))
