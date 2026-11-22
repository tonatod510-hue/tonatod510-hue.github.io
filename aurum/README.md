# AURUM — série animée (noir & or)

Saison 1, épisode 1 : **« Le premier jour »** (≈ 4 min, 16:9, 4K 3840×2160, 24 i/s).
Scénario et bible des personnages : [`episode-01/SCENARIO.md`](episode-01/SCENARIO.md).

Tout est dessiné en code (canvas 2D vectoriel), donc l'image reste nette en 4K.
Les voix viennent d'ElevenLabs. La musique et les bruitages sont synthétisés exprès pour l'épisode.

## Le moteur (`engine/`)

| Fichier | Rôle |
|---|---|
| `core.js` | Base : rendu à n'importe quelle échelle, caméra, trames de points, chaleur qui ondule, textes. |
| `people.js` | Personnages : corps, coiffures, tenues, **20 expressions**, gestes (bras en cinématique inverse), bouche animée par la voix, Nox « l'Éclipse » (masque noir cerclé d'or). |
| `sets.js` | Décors : chambre, miroir, cuisine, entrée, rues d'Aurum, portail, cour, classe, cantine, mot, titre et carton « À suivre ». |
| `ep01.js` | **Le découpage** : 47 plans. Chaque plan liste ses répliques et ses pauses (ça fixe sa durée), sa caméra, ses personnages et leurs émotions au fil du temps. |
| `prep_vo.py` | Prépare les voix (silences, volume) et calcule l'animation de la bouche → `vo.js`. |
| `audio.py` | Musique originale (12 ambiances), 45 bruitages, mixage avec la musique qui baisse sous les dialogues. |
| `make_subs.py` | Sous-titres `.srt` et `.ass` à partir de la timeline. |
| `render_ep.js` | Rendu image par image (Playwright + ffmpeg). |
| `build.py` | Assemble une page HTML autonome à partir des fichiers ci-dessus. |
| `shorts.js` + `render_short.js` | **Shorts verticaux** 1080×1920 tirés de l'épisode : recadrage automatique sur le personnage qui parle, gros sous-titres, accroche, carte de fin. |

## Fabriquer l'épisode

```bash
python3 engine/prep_vo.py voix_mp3/ voix_wav/ engine/vo.js           # 1. voix
python3 engine/build.py ep01.html core.js,people.js,sets.js,vo.js,ep01.js,main.js polices/
node tools/probe.js ep01.html probe/ -                                # 2. timeline.json
python3 engine/audio.py probe/timeline.json voix_wav/ mix.wav        # 3. son
node engine/render_ep.js ep01.html video.mp4 2 24 4                   # 4. image 4K
ffmpeg -i video.mp4 -i mix.wav -c:v copy -c:a aac -af loudnorm=I=-16:TP=-1.5 episode.mp4   # 5. assemblage
```

Shorts (après l'étape 3) :

```bash
python3 engine/build.py shorts.html core.js,people.js,sets.js,vo.js,ep01.js,main.js,shorts.js polices/
node engine/render_short.js shorts.html s1 short1.mp4 4   # s1, s2, s3 : voir SHORTS dans shorts.js
```

Pour un nouvel épisode : écrire `ep02.js` sur le modèle de `ep01.js`. Les personnages et les décors se réutilisent tels quels.
