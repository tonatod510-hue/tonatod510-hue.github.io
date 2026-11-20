# Heat Waves — vidéo animée style « noir & or »

Vidéo verticale 9:16 (1080×1920, 30 i/s, 45 s) dans le style des edits « zero.lumiere » :
perso à capuche sans visage avec la fente dorée, décor de palais en ruines, trame de points,
ondulations de chaleur, sous-titres blancs avec le mot-clé **en gros et en or**.
Tout est dessiné en code (canvas JavaScript), rien n'est copié de la vidéo d'origine.

## Les fichiers

| Fichier | Quoi |
|---|---|
| `heatwaves.mp4` | La vidéo finie, **sans son et sans paroles** (juste le titre au début). |
| `index.html` | Le « studio » : aperçu, ajout du son + des paroles, export vidéo. Marche hors-ligne. |
| `tools/render.js` | Rendu image par image en MP4 parfait (pour ceux qui ont Node.js). |

## Pourquoi pas de son ni de paroles dans le MP4 ?

La musique et les paroles de *Heat Waves* sont protégées par le droit d'auteur : je ne peux pas les mettre moi-même.
Tu les ajoutes toi-même en 2 minutes, avec l'une de ces deux méthodes :

### Méthode 1 — la plus rapide (TikTok / CapCut)
1. Importe `heatwaves.mp4` dans TikTok (ou CapCut).
2. Ajoute le son officiel « Heat Waves – Glass Animals » depuis la bibliothèque de sons.
3. Cale le son pour que les changements de scène tombent sur le rythme (toutes les ~5,9 s, le morceau est à 81 BPM).

### Méthode 2 — avec les paroles dans le style de la vidéo d'origine
1. Ouvre `index.html` dans **Chrome ou Edge sur ordinateur** (double-clic sur le fichier).
2. **Musique** : choisis ton fichier audio. Si c'est la chanson entière, indique la seconde où commence le passage voulu.
3. **Paroles** : écris tes lignes (une par ligne, sans les temps).
   Mets un mot entre étoiles pour l'afficher en or : `ET UN MOT EN *OR*`.
4. Clique **Synchro au tap**, puis appuie sur **ESPACE** au début de chaque ligne pendant que la musique joue.
   Les temps s'écrivent tout seuls (format `0:12.5 | TEXTE`). Tu peux les corriger à la main.
5. **Exporter la vidéo** : ça enregistre en temps réel (45 s). Garde l'onglet ouvert et au premier plan.
   Si ton PC rame, choisis 720×1280.

## Les 8 scènes (calées sur 81 BPM, 2 mesures chacune)

1. Le palais au coucher du soleil : ils se tiennent la main devant le trône
2. Le mirage : elle apparaît au bout de la route, déformée par la chaleur
3. Les nuits de juin : il regarde son téléphone, les jours se barrent sur le calendrier
4. Le miroir : il la voit dans le reflet, puis le reflet ondule et elle disparaît
5. Les larmes : il lui tend une rose d'or qui fane, elle détourne le regard
6. Le cœur qui fond sous la chaleur
7. L'adieu : elle s'éloigne vers le soleil, il fait signe de la main
8. Fin : il reste seul, tout s'éteint sauf la fente dorée

## Rendu en ligne de commande (optionnel)

```bash
npm i playwright && npx playwright install chromium   # + ffmpeg installé
node tools/render.js heatwaves.mp4                     # vidéo sans paroles
node tools/render.js avec-paroles.mp4 --lyrics paroles.txt
node tools/render.js test.mp4 --stills 2,8,14          # quelques images PNG pour vérifier
```
