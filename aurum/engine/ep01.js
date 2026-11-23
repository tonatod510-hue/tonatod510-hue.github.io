'use strict';
/* =====================================================================
   AURUM — Épisode 1 « Le premier jour » : découpage plan par plan.
   Chaque plan = une liste d'événements (répliques, pauses) qui fixe sa
   durée, + une fonction de dessin qui place caméra, décor, personnages,
   expressions et gestes en fonction du temps local et des répliques.
   ===================================================================== */

// ---------- répliques (texte des sous-titres, sans indications de jeu) ----------
const LINES = {
  n01: ['N', "On dit que le jour de la rentrée, tout le monde te regarde."],
  n02: ['N', "Moi, j'avais surtout peur que personne ne me voie."],
  n03: ['N', "Je m'appelle Aya. J'ai seize ans. Il y a deux semaines, on a emménagé à Aurum… la ville où même le soleil a l'air de briller plus fort."],
  a01: ['aya', "Salut… moi, c'est Aya. Non. Trop bizarre."],
  a02: ['aya', "Salut ! Je suis la nouvelle ! … Évidemment que t'es la nouvelle."],
  m01: ['mom', "Aya ! Ton petit-déjeuner va refroidir !"],
  t01: ['timi', "Wouah ! T'as l'air d'une hôtesse de l'air !"],
  a03: ['aya', "Merci, Timi. Toujours un plaisir."],
  m02: ['mom', "Tu es prête, ma chérie ?"],
  a04: ['aya', "Non."],
  m03: ['mom', "Parfait. C'est quand on n'est pas prêt qu'on apprend le plus."],
  m04: ['mom', "Tiens. Ton père voulait que tu l'aies, aujourd'hui."],
  a05: ['aya', "Il aurait dû être là."],
  m05: ['mom', "Je sais."],
  n04: ['N', "Il y a trois ans, papa est parti travailler à Aurum. Un soir, il a arrêté de répondre. Maman dit qu'on est venus pour un nouveau départ… Moi, je crois qu'on est venus pour le retrouver."],
  a06: ['aya', "J'y vais !"], m06: ['mom', "Sois toi-même !"], t02: ['timi', "Mais pas trop !"],
  n05: ['N', "Aurum, c'est une ville étrange. Tout brille… mais tout le monde a l'air de cacher quelque chose."],
  n06: ['N', "Lycée d'Aurum. Mille deux cents élèves. Et moi, la seule qui ne connaissait personne."],
  v01: ['vic', "Tu regardes où tu marches, la nouvelle ?"], a07: ['aya', "Pardon, je…"],
  v02: ['vic', "Joli pendentif. Dommage pour le reste."],
  i01: ['nina', "Laisse tomber, c'est Victoria. Elle est comme ça avec tout le monde. Enfin… surtout avec ceux qui l'inquiètent."],
  i02: ['nina', "Moi, c'est Nina ! Et toi, t'es la nouvelle de la seconde B, c'est ça ?"],
  a08: ['aya', "Aya. Euh… oui. Comment tu sais ?"],
  i03: ['nina', "Ici, tout se sait ! Allez, viens, on va être en retard !"],
  o01: ['morel', "Silence, s'il vous plaît. Nous accueillons une nouvelle élève. Mademoiselle… présentez-vous."],
  a09: ['aya', "Je… je m'appelle Aya. Je viens d'arriver à Aurum, avec ma mère et mon petit frère. Et… j'aime dessiner."],
  o02: ['morel', "Merci, Aya. Installez-vous près de la fenêtre. La place est libre."],
  o03: ['morel', "En retard, Nox. Encore."],
  n07: ['N', "Personne ne m'avait parlé de lui."],
  i04: ['nina', "Attends, attends… Nox s'est assis à côté de toi ?"],
  a10: ['aya', "C'est qui, au juste ?"],
  i05: ['nina', "Personne ne sait vraiment. Personne n'a jamais vu son visage. Il ne parle à personne."],
  i06: ['nina', "Il paraît qu'il est arrivé à Aurum la nuit de la Grande Panne… il y a trois ans."],
  a11: ['aya', "Il y a trois ans…"],
  i07: ['nina', "Je te raconterai !"],
  n08: ['N', "Ce soir-là, j'ai trouvé un mot dans mon sac."],
  a12: ['aya', "« Ton père n'est pas parti. Ne fais confiance à personne. »"],
  n09: ['N', "Je pensais que le plus dur, ce serait le premier jour."],
  n10: ['N', "Je me trompais."],
};
// durées estimées des répliques pas encore enregistrées (quota ElevenLabs épuisé)
const PH = { o02: 4.2, i04: 3.3, a10: 1.6, i05: 5.4, i06: 5.8, i07: 1.4, n08: 3.1, a12: 4.4, n09: 3.6, n10: 1.8 };
// =====================================================================
//  LES PLANS
// =====================================================================
const SHOTS = [
  // ---------------- COLD OPEN ----------------
  { name: 'Nuit blanche', fadeIn: 1.2, music: 'night', items: [['w', 1.4], ['l', 'n01'], ['w', .5]], sfx: [['tick', 0, { dur: 12 }]],
    cam: S => ({ x: 450, y: 600, z: lerp(1.05, 1.32, ease(S.lt / S.d)) }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', clock: '05:58' }); bedScene(c, { T: S.T, e: exprParams('worried'), lookY: -.75, look: Math.sin(S.T * .4) * .3, breath: Math.sin(S.T * 1.3) * 3 }); } },
  { name: 'Ses yeux', items: [['l', 'n02'], ['w', .6]],
    cam: S => ({ x: 442, y: 600, z: lerp(3.1, 3.35, S.lt / S.d) }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', clock: '05:59' }); bedScene(c, { T: S.T, e: ex(S.lt, [[0, 'sad'], [1.6, 'worried']]), lookY: -.6, look: S.lt > 2.2 ? 1 : 0 }); } },
  { name: 'Le réveil', items: [['w', 2.6]], sfx: [['alarm', 1.0, { dur: 1.6 }]],
    cam: S => ({ x: 795, y: 585, z: 4.2, shake: S.lt > 1 ? 6 : 0 }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', clock: S.lt < 1 ? '05:59' : '06:00', ring: S.lt > 1 }); bedScene(c, { T: S.T, e: exprParams('worried') }); } },
  { name: 'Elle éteint le réveil', items: [['w', 2.8]], sfx: [['click', 1.15], ['sigh', 1.6]],
    cam: S => ({ x: 560, y: 620, z: 1.7 }),
    draw(c, S) {
      setBedroom(c, { T: S.T, time: 'night', clock: S.lt < 1.15 ? '06:00' : '06:00', ring: S.lt < 1.15 });
      bedScene(c, { T: S.T, e: ex(S.lt, [[0, 'scared'], [1.3, 'tired']]), lookY: -.2, look: S.lt < 1.3 ? 1 : 0, tilt: S.lt < 1.2 ? .08 : 0 });
      if (S.lt > .3 && S.lt < 1.5) { const k = S.k(.3, 1.0) * (1 - S.k(1.2, 1.5)); const hx = lerp(560, 790, k), hy = lerp(700, 575, k); c.save(); c.strokeStyle = '#000'; c.lineWidth = 32; c.lineCap = 'round'; c.beginPath(); c.moveTo(520, 690); c.lineTo(hx, hy); c.stroke(); c.strokeStyle = '#4a4846'; c.lineWidth = 26; c.stroke(); const h = new Path2D(); h.ellipse(hx, hy, 15, 12, 0, 0, TAU); paint(c, h, { fill: SKIN.aya, stroke: '#000', lw: 2.4 }); c.restore(); }
    } },
  { name: 'Générique', items: [['w', 6.5]], music: 'title', fadeOut: .8,
    draw(c, S) { titleCard(c, { T: S.T, k: clamp(S.lt / 3) }); } },

  // ---------------- ACTE 1 : LA MAISON ----------------
  { name: 'Les rideaux', fadeIn: .6, music: 'home', items: [['w', 1.6], ['l', 'n03', { adv: 4.0 }]], sfx: [['swish', .3]],
    cam: S => ({ x: lerp(960, 1300, ease(S.lt / S.d)), y: 520, z: lerp(1.0, 1.25, ease(S.lt / S.d)) }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'dawn', curtain: ease(S.k(.2, 1.5)), clock: '06:04' }); drawPerson(c, 'ayaPJ', { x: 1440, y: 1000, s: .95, T: S.T, back: true, armL: S.lt < 1.5 ? { tx: -150, ty: -600 } : 'down', armR: S.lt < 1.5 ? { tx: 150, ty: -600 } : 'down' }); } },
  { name: 'Aurum au lever du soleil', items: [['w', lineDur('n03') - 4.0 + .6]],
    heat: 3, cam: S => ({ x: 960 + S.lt * 12, y: 540, z: 1.0 }),
    bg(c, S) { skyGrad(c, -M, 860, 'dawn'); sun(c, 1150, lerp(640, 520, S.lt / S.d), 130, 1); skyline(c, 820, .62, 'day', S.T, 41, 1); skyline(c, 940, .9, 'day', S.T, 47, 2); c.fillStyle = vGrad(c, 930, H + M, [[0, '#3a2a18'], [1, '#0e0a07']]); c.fillRect(-M, 930, W + 2 * M, H); },
    fg(c, S) { dust(c, S.T, 50, 4); } },
  { name: 'Miroir — essai 1', music: null, items: [['w', .7], ['l', 'a01'], ['w', .5]],
    cam: S => ({ x: 900, y: 520, z: lerp(1.0, 1.08, S.lt / S.d) }),
    draw(c, S) {
      const l = S.L('a01'), lt = S.lt - l.t0;
      setMirror(c, { T: S.T }, (x, mx, my, rx, ry) => drawPerson(x, 'aya', { x: mx + 10, y: my + ry + 60, s: 1.15, T: S.T, flip: true, e: ex(lt, [[-1, 'nervous'], [.2, 'smile'], [2.6, 'deadpan']]), talk: S.talk('a01'), armL: lt > .2 && lt < 2.4 ? 'wave' : 'down', armR: 'down', tilt: lt > 2.6 ? -.06 : 0 }));
      drawPerson(c, 'aya', { x: 300, y: 1560, s: 1.65, T: S.T, back: true, noShadow: true });
    } },
  { name: 'Miroir — essai 2', items: [['w', .3], ['l', 'a02'], ['w', .9]], sfx: [['sigh', S => 0, {}]],
    cam: S => ({ x: 960, y: 330, z: 2.0 }),
    draw(c, S) {
      const l = S.L('a02'), lt = S.lt - l.t0;
      setMirror(c, { T: S.T }, (x, mx, my, rx, ry) => drawPerson(x, 'aya', { x: mx, y: my + ry + 60, s: 1.15, T: S.T, flip: true, e: ex(lt, [[-1, 'excited'], [1.7, 'deadpan'], [3.4, 'tired']]), talk: S.talk('a02'), armL: lt < 1.6 ? 'wave' : 'down', armR: lt < 1.6 ? 'hips' : 'down', slump: lt > 1.7 ? .6 : 0 }));
    } },
  { name: 'Cuisine — maman appelle', music: 'home', items: [['w', .4], ['l', 'm01'], ['w', .4]], sfx: [['pot', 0]],
    cam: S => ({ x: 1000, y: 560, z: 1.05 }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      drawPerson(c, 'timi', { x: 760, y: 968, s: 1.0, T: S.T, expr: 'neutral', noLegs: true, armL: 'hold', armR: { tx: 30, ty: -380 + Math.sin(S.T * 6) * 15, b: -1 }, lookY: .5 });
      kitchenTable(c, 800, 790, 700, S.T);
      drawPerson(c, 'mom', { x: 1600, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'neutral'], [.3, 'happy']]), talk: S.talk('m01'), turn: -.7, look: -1, armL: 'hold', armR: 'down', tilt: -.05 });
    } },
  { name: 'Aya entre', items: [['w', 1.4], ['l', 't01'], ['w', .3]], sfx: [['steps', 0, { dur: 1.3 }], ['laughKid', S => S.t01?.t0 ?? 1.4]],
    cam: S => ({ x: 860, y: 560, z: 1.08 }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const w = walkTo(S.lt, 0, 1.3, -120, 380);
      drawPerson(c, 'aya', { x: w.x, y: 1010, s: .95, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'neutral'], [1.8, 'annoyed']]), armL: 'strap', armR: 'strap', turn: .3 });
      const tl = S.lt - S.L('t01').t0;
      drawPerson(c, 'timi', { x: 760, y: 968, s: 1.0, T: S.T, e: ex(tl, [[-9, 'neutral'], [-.4, 'surprised'], [0, 'laugh']]), talk: S.talk('t01'), noLegs: true, turn: -.5, look: -1, armL: tl > 0 ? { tx: -200, ty: -440, b: 1 } : 'hold', armR: tl > 0 ? 'chest' : 'hold', hop: tl > 0 && tl < 2.5 ? Math.abs(Math.sin(tl * 9)) * 8 : 0 });
      kitchenTable(c, 800, 790, 700, S.T);
      drawPerson(c, 'mom', { x: 1600, y: 1010, s: .95, T: S.T, expr: 'smile', turn: -.6, look: -1, armL: 'hold', armR: 'down' });
    } },
  { name: 'Aya, pince-sans-rire', items: [['w', .2], ['l', 'a03'], ['w', .5]],
    cam: S => ({ x: 380, y: 430, z: 2.1 }),
    draw(c, S) { setKitchen(c, { T: S.T }); drawPerson(c, 'aya', { x: 380, y: 1010, s: .95, T: S.T, expr: 'deadpan', talk: S.talk('a03'), armL: 'strap', armR: 'strap', turn: .4, look: 1 }); } },
  { name: 'Tu es prête ?', items: [['w', 1.4], ['l', 'm02'], ['w', .4], ['l', 'a04'], ['w', .5], ['l', 'm03'], ['w', .6]], sfx: [['steps', 0, { dur: 1.3 }]],
    cam: S => ({ x: lerp(800, 600, ease(S.k(0, 1.6))), y: 520, z: lerp(1.25, 1.55, ease(S.k(0, 1.6))) }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const w = walkTo(S.lt, 0, 1.3, 1350, 720);
      const lm3 = S.L('m03');
      drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'neutral'], [1.3, 'worried'], [S.L('a04').t0, 'sad'], [lm3.t0 + 1.8, 'smile']]), talk: S.talk('a04'), armL: 'strap', armR: 'strap', turn: .45, look: 1, slump: S.lt > S.L('a04').t0 && S.lt < lm3.t0 + 1.5 ? .5 : 0 });
      drawPerson(c, 'mom', { x: w.x, y: 1012, s: .95, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'smile'], [lm3.t0, 'happy'], [lm3.t0 + 1.2, 'smile']]), talk: S.talk('m02', 'm03'), turn: -.55, look: -1, armL: S.lt > 1.4 ? { wx: 470, wy: 535, b: -1 } : 'swing', armR: 'down', tilt: -.06 });
    } },
  { name: 'Le pendentif', items: [['w', .5], ['l', 'm04'], ['w', 1.6]], sfx: [['shimmer', S => (S.m04?.t1 ?? 3) + .3]],
    cam: S => ({ x: 560, y: 470, z: 2.0 }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const tp = S.L('m04').t1 + .4, placed = S.lt > tp + .5;
      drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'curious'], [S.L('m04').t0 + 1.0, 'moved']]), armL: 'strap', armR: placed ? 'pendant' : 'strap', turn: .45, look: placed ? 0 : 1, lookY: placed ? .5 : 0, pendant: placed });
      const off = S.lt < tp ? { tx: -150, ty: -470, item: pendantItem, b: 1 } : S.lt < tp + .6 ? { wx: 400, wy: 560, item: pendantItem } : 'down';
      drawPerson(c, 'mom', { x: 700, y: 1012, s: .95, T: S.T, e: ex(S.lt, [[0, 'smile'], [S.L('m04').t1, 'moved']]), talk: S.talk('m04'), turn: -.55, look: -1, armL: off, armR: 'down', tilt: -.05 });
    } },
  { name: 'Il aurait dû être là', items: [['w', .5], ['l', 'a05'], ['w', .7]],
    cam: S => ({ x: 400, y: 410, z: lerp(2.6, 2.75, S.lt / S.d) }),
    draw(c, S) { setKitchen(c, { T: S.T }); drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: exprParams('moved'), talk: S.talk('a05'), armL: 'strap', armR: 'pendant', turn: .2, lookY: .6, pendant: true, tears: S.k(.8, 1.8) * .5 }); } },
  { name: 'Je sais', items: [['w', .3], ['l', 'm05'], ['w', .8]],
    cam: S => ({ x: 700, y: 420, z: 2.6 }),
    draw(c, S) { setKitchen(c, { T: S.T }); drawPerson(c, 'mom', { x: 700, y: 1012, s: .95, T: S.T, e: exprParams('sad'), talk: S.talk('m05'), turn: -.4, look: -1, armL: 'down', armR: 'down', tilt: -.08 }); } },
  { name: 'La photo de famille', music: 'sad', items: [['l', 'n04', { adv: 6.2 }]],
    cam: S => ({ x: 200, y: 400, z: lerp(3.4, 3.9, S.lt / S.d) }),
    draw(c, S) { setKitchen(c, { T: S.T, photoGlint: .3 + .2 * Math.sin(S.T) }); } },
  { name: 'Pour le retrouver', items: [['w', lineDur('n04') - 6.2 + .8]],
    cam: S => ({ x: 400, y: 420, z: lerp(2.3, 2.6, S.lt / S.d) }),
    draw(c, S) { setKitchen(c, { T: S.T }); drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'sad'], [2.0, 'determined']]), armL: 'strap', armR: S.lt < 2 ? 'pendant' : 'strap', turn: .05, lookY: S.lt < 2 ? .5 : 0, pendant: true }); } },
  { name: 'Le départ', music: 'home', items: [['w', .5], ['l', 'a06'], ['w', .3], ['l', 'm06'], ['w', .15], ['l', 't02'], ['w', 1.3], ['w', 1.8]], sfx: [['door', S => (S.t02?.t1 ?? 3) + 1.4], ['ambCity', S => (S.t02?.t1 ?? 3) + 1.5, { dur: 2 }]],
    cam: S => ({ x: 960, y: 560, z: 1.12 }),
    draw(c, S) {
      const tEnd = S.L('t02').t1, tOpen = tEnd + 1.3;
      setEntrance(c, { T: S.T, open: ease(S.k(tOpen, tOpen + .8)) });
      const back = S.lt > tEnd + 1.1; const w = walkTo(S.lt, tOpen + .6, tOpen + 1.8, 960, 960);
      drawPerson(c, 'aya', { x: 960, y: lerp(1030, 960, S.k(tOpen + .6, tOpen + 1.8)), s: lerp(.95, .8, S.k(tOpen + .6, tOpen + 1.8)), T: S.T, back, walk: back && S.lt > tOpen + .6 ? S.lt * 7 : null, e: ex(S.lt, [[0, 'happy'], [S.L('m06').t1, 'deadpan'], [tEnd + .2, 'smile']]), talk: S.talk('a06'), armL: back ? 'strap' : 'strap', armR: back ? 'strap' : (S.lt < S.L('a06').t1 + .2 ? 'wave' : 'strap'), pendant: true, turn: -.2, alpha: 1 - S.k(tOpen + 1.4, tOpen + 1.8) });
    } },

  // ---------------- ACTE 2 : LE TRAJET ----------------
  { name: 'Les rues d\'Aurum', fadeIn: .5, music: 'city', items: [['w', .6], ['l', 'n05'], ['w', 1.0]], sfx: [['ambCity', 0, { dur: 8 }], ['steps', 0, { dur: 8 }]],
    heat: 2, cam: S => ({ x: 960, y: 560, z: 1.0 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: S.lt * 170 }); crowd(c, S.T, [{ x: 200 - S.lt * 120, y: 905, s: .55, k: 1, vx: 60 }, { x: 1700 - S.lt * 120, y: 905, s: .55, k: 2, vx: -40 }, { x: 1300 - S.lt * 120, y: 900, s: .5, k: 5 }], .18); },
    fg(c, S) { const t = S.lt - S.L('n05').t0; drawPerson(c, 'aya', { x: 960, y: 1010, s: .82, T: S.T, walk: S.lt * 6.5, e: ex(t, [[-9, 'worried'], [4.2, 'curious']]), turn: t > 4.2 ? .6 : 0, look: t > 4.2 ? 1 : 0, armL: 'strap', armR: 'strap', pendant: true }); } },
  { name: 'Le graffiti', music: 'mystery', items: [['w', 2.4]], sfx: [['sting', .1]],
    heat: 4, cam: S => ({ x: 5 * 420 + 300 - 7.9 * 170 * .7, y: 470, z: lerp(2.6, 3.0, S.lt / S.d) }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 7.9 * 170 }); } },
  { name: 'Le portail', music: 'city', items: [['l', 'n06', { adv: lineDur('n06') + .4 }]], sfx: [['crowd', 0, { dur: 6 }]],
    cam: S => ({ x: 960, y: lerp(560, 470, ease(S.lt / S.d)), z: lerp(1.0, 1.12, ease(S.lt / S.d)) }),
    draw(c, S) { setGate(c, { T: S.T }); crowd(c, S.T, [{ x: 760 + S.lt * 8, y: 880 - S.lt * 4, s: .42, k: 3, back: true, walk: 1 }, { x: 1080, y: 885 - S.lt * 5, s: .42, k: 4, back: true }, { x: 640, y: 905 - S.lt * 6, s: .5, k: 5, back: true }, { x: 1300, y: 905 - S.lt * 5, s: .5, k: 6, back: true }, { x: 900, y: 940 - S.lt * 10, s: .6, k: 7, back: true }], .12); drawPerson(c, 'aya', { x: 960, y: 1200, s: 1.0, T: S.T, back: true, armL: 'strap', armR: 'strap', noShadow: true }); } },
  { name: 'Respirer', items: [['w', 3.6]], sfx: [['breath', 1.2]],
    bgBlur: 5, cam: S => ({ x: 960, y: 520, z: 1.9 }),
    bg(c, S) { setGate(c, { T: S.T }); },
    fg(c, S) { drawPerson(c, 'aya', { x: 960, y: 1060, s: .92, T: S.T, e: ex(S.lt, [[0, 'nervous'], [1.2, 'tired'], [2.3, 'determined']]), closedEyes: S.lt > 1.2 && S.lt < 2.2, armL: 'strap', armR: S.lt < 2.6 ? 'pendant' : 'strap', pendant: true, slump: S.lt > 1.2 && S.lt < 2.2 ? -.3 : 0 }); } },

  // ---------------- ACTE 3 : LE LYCÉE ----------------
  { name: 'La collision', music: 'school', items: [['w', 2.2], ['l', 'v01'], ['w', .2], ['l', 'a07'], ['w', .4]], sfx: [['crowd', 0, { dur: 7 }], ['bump', 1.55], ['paper', 1.6]],
    cam: S => ({ x: 900, y: 580, z: 1.15, shake: S.lt > 1.55 && S.lt < 1.8 ? 10 : 0 }),
    draw(c, S) {
      setCourtyard(c, { T: S.T }); crowd(c, S.T, [{ x: 330, y: 760, s: .45, k: 1, talk: 1, turn: .4 }, { x: 400, y: 762, s: .45, k: 2, turn: -.4 }, { x: 1230, y: 770, s: .45, k: 3 }], .2);
      const hit = 1.55, wa = walkTo(S.lt, 0, hit, 300, 760), wv = walkTo(S.lt, 0, hit, 1500, 1010);
      const back = S.k(hit, hit + .25) * 40;
      drawPerson(c, 'fol1', { x: wv.x + 230, y: 1000, s: .84, T: S.T, walk: wv.walk, expr: S.lt > hit ? 'smirk' : 'neutral', turn: -.5, armL: 'swing', armR: 'swing' });
      drawPerson(c, 'fol2', { x: wv.x + 410, y: 1000, s: .84, T: S.T + 1, walk: wv.walk, expr: S.lt > hit ? 'smirk' : 'neutral', turn: -.5 });
      drawPerson(c, 'vic', { x: wv.x, y: 1020, s: .9, T: S.T, walk: wv.walk, e: ex(S.lt, [[0, 'cold'], [hit, 'annoyed']]), talk: S.talk('v01'), turn: -.45, look: -1, armL: S.lt > hit + .3 ? 'hips' : 'swing', armR: 'swing' });
      drawPerson(c, 'aya', { x: wa.x - back, y: 1030, s: .9, T: S.T, walk: wa.walk, e: ex(S.lt, [[0, 'focus'], [hit, 'scared'], [S.L('a07').t0, 'nervous']]), talk: S.talk('a07'), turn: S.lt > hit ? .5 : .2, look: S.lt > hit ? 1 : 0, lookY: S.lt < hit ? .6 : 0, armL: S.lt < hit ? { tx: -20, ty: -420, b: 1, item: paperItem } : 'chest', armR: S.lt < hit ? { tx: 20, ty: -420, b: -1, item: paperItem } : 'down', pendant: true, lean: S.lt > hit && S.lt < hit + .4 ? -.08 : 0 });
      if (S.lt > hit) for (let k = 0; k < 6; k++) { const u = clamp((S.lt - hit) / 1.2), x = 760 + (k - 2.5) * 70 * u + Math.sin(k * 3 + S.lt * 4) * 20, y = 640 + u * u * 380 - Math.sin(u * PI) * 120 * (1 + k % 2 * .3); c.save(); c.translate(x, Math.min(y, 1040 - k * 3)); c.rotate(u * (k - 2.5) * 2); const p = rect(-34, -24, 68, 48, 2); paint(c, p, { fill: '#e6dcc6', stroke: '#140d06', lw: 2 }); c.restore(); }
    } },
  { name: 'Joli pendentif', items: [['w', 1.0], ['l', 'v02'], ['w', 1.4]], sfx: [['giggle', S => (S.v02?.t1 ?? 3) + .1]],
    cam: S => ({ x: lerp(1060, 1120, S.lt / S.d), y: 440, z: 1.9 }),
    draw(c, S) {
      setCourtyard(c, { T: S.T });
      const lv = S.L('v02'), leave = lv.t1 + .3, wv = walkTo(S.lt, leave, leave + 1.2, 1060, 1500);
      drawPerson(c, 'fol1', { x: 1290 + (wv.x - 1060), y: 1000, s: .84, T: S.T, walk: wv.walk, expr: S.lt > lv.t1 ? 'laugh' : 'smirk', turn: -.5 });
      drawPerson(c, 'vic', { x: wv.x, y: 1020, s: .9, T: S.T, walk: wv.walk, e: ex(S.lt, [[0, 'cold'], [lv.t0, 'smirk']]), talk: S.talk('v02'), turn: S.lt > leave ? .3 : -.45, look: -1, lookY: S.lt < .9 ? lerp(.7, -.2, S.k(0, .9)) : 0, armL: 'hips', armR: S.lt > lv.t0 && S.lt < lv.t1 ? { tx: -60, ty: -470, b: -1, hand: 'point' } : 'down' });
    } },
  { name: 'Ramasser ses feuilles', music: 'tender', items: [['w', 1.6], ['l', 'i01'], ['w', .4]], sfx: [['paper', .3]],
    cam: S => ({ x: lerp(700, 760, S.lt / S.d), y: 640, z: 1.45 }),
    draw(c, S) {
      setCourtyard(c, { T: S.T, fountain: false });
      for (let k = 0; k < 4; k++) { c.save(); c.translate(560 + k * 110, 1020 + (k % 2) * 14); c.rotate((k - 1.5) * .4); const p = rect(-34, -24, 68, 48, 2); paint(c, p, { fill: '#e6dcc6', stroke: '#140d06', lw: 2 }); c.restore(); }
      drawPerson(c, 'aya', { x: 640, y: 1190, s: .9, T: S.T, noLegs: true, e: ex(S.lt, [[0, 'sad'], [S.L('i01').t0 + 1.0, 'curious']]), turn: .3, look: 1, lookY: S.lt < 1.2 ? .8 : 0, armL: { tx: -60, ty: -230 }, armR: S.lt > 1.0 ? { wx: 820, wy: 830 } : { tx: 60, ty: -230 }, slump: .6, pendant: true });
      const w = walkTo(S.lt, 0, 1.1, 1300, 960);
      drawPerson(c, 'nina', { x: w.x, y: 1030, s: .9, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'neutral'], [1.2, 'smile']]), talk: S.talk('i01'), turn: -.5, look: -1, lookY: .4, armL: S.lt > 1.0 ? { wx: 830, wy: 820, item: paperItem } : 'swing', armR: 'down', lean: -.08 });
    } },
  { name: 'Nina', items: [['w', .3], ['l', 'i02'], ['w', .3], ['l', 'a08'], ['w', .3], ['l', 'i03'], ['w', 1.4]], sfx: [['bell', S => (S.i03?.t0 ?? 6) + 1.8, { dur: 2.4 }], ['steps', S => (S.i03?.t1 ?? 9) + .2, { dur: 1.2 }]],
    cam: S => ({ x: lerp(900, 1000, S.k(S.d - 1.4, S.d)), y: 470, z: 1.6 }),
    draw(c, S) {
      setCourtyard(c, { T: S.T });
      const run = S.L('i03').t1 + .1, wr = walkTo(S.lt, run, run + 1.3, 0, 900);
      drawPerson(c, 'aya', { x: 760 + wr.x, y: 1030, s: .9, T: S.T, walk: wr.walk, e: ex(S.lt, [[0, 'shy'], [S.L('a08').t1, 'surprised'], [S.L('i03').t0 + 1.0, 'smile']]), talk: S.talk('a08'), turn: .45, look: 1, armL: 'down', armR: S.lt > run - .3 ? { wx: 1000 + wr.x, wy: 640 } : 'chest', pendant: true });
      drawPerson(c, 'nina', { x: 1080 + wr.x, y: 1030, s: .9, T: S.T, walk: wr.walk, e: ex(S.lt, [[0, 'happy'], [S.L('a08').t0, 'smile'], [S.L('i03').t0, 'laugh'], [S.L('i03').t0 + 1.2, 'excited']]), talk: S.talk('i02', 'i03'), turn: -.45, look: -1, armL: S.lt < S.L('i02').t0 + 1.3 ? 'chest' : S.lt > run - .3 ? { wx: 870 + wr.x, wy: 660 } : 'down', armR: S.lt > S.L('i03').t0 + 1.6 && S.lt < run ? 'point' : 'down', hop: S.lt > S.L('i02').t0 && S.lt < S.L('i02').t0 + .5 ? Math.sin(S.k(S.L('i02').t0, S.L('i02').t0 + .5) * PI) * 14 : 0 });
    } },
  { name: 'La classe — M. Morel', music: 'tension', fadeIn: .3, items: [['w', .5], ['l', 'o01'], ['w', .5]], sfx: [['chalk', 0]],
    cam: S => ({ x: 1180, y: 520, z: 1.25 }),
    draw(c, S) {
      setClassFront(c, { T: S.T });
      drawPerson(c, 'morel', { x: 1420, y: 960, s: .82, T: S.T, e: ex(S.lt, [[0, 'focus'], [S.L('o01').t0 + 3.5, 'neutral']]), talk: S.talk('o01'), turn: -.35, look: -1, armL: S.lt > S.L('o01').t0 + 3.4 ? { tx: -230, ty: -500, b: 1, hand: 'open' } : 'hips', armR: 'down' });
      drawPerson(c, 'aya', { x: 900, y: 960, s: .85, T: S.T, expr: 'nervous', armL: 'strap', armR: 'strap', pendant: true, look: S.lt > 2 ? 1 : 0 });
      studentBacks(c, S.T, 980, 6, 80);
    } },
  { name: 'Tous les regards', items: [['w', 2.4]], sfx: [['heart', 0, { dur: 2.4 }]],
    cam: S => ({ x: 960, y: 520, z: lerp(1.0, 1.12, S.lt / S.d) }),
    draw(c, S) { classRows(c, S, { aya: false, nox: false, stare: true }); } },
  { name: 'Aya se présente', items: [['w', .4], ['l', 'a09'], ['w', .6]], sfx: [['heart', 0, { dur: 2 }]],
    bgBlur: 4, cam: S => ({ x: 900, y: 380, z: lerp(2.0, 2.5, S.lt / S.d) }),
    bg(c, S) { setClassFront(c, { T: S.T }); },
    fg(c, S) { const l = S.L('a09'); drawPerson(c, 'aya', { x: 900, y: 960, s: .85, T: S.T, e: ex(S.lt, [[0, 'scared'], [l.t0 + .8, 'nervous'], [l.t0 + 5.6, 'shy']]), talk: S.talk('a09'), armL: 'strap', armR: S.lt > l.t0 + 5.6 ? 'chest' : 'strap', pendant: true, lookY: S.lt > l.t0 + 5.6 ? .4 : 0, look: Math.sin(S.T * .9) * .4 }); } },
  { name: 'Réactions', items: [['w', 2.6]], sfx: [['whisper', .3]],
    cam: S => ({ x: lerp(760, 700, S.lt / S.d), y: 470, z: 1.7 }),
    draw(c, S) { classRows(c, S, { aya: false, nox: false, react: true }); } },
  { name: 'Installez-vous', items: [['l', 'o02'], ['w', .4]],
    cam: S => ({ x: 1250, y: 520, z: 1.35 }),
    draw(c, S) {
      setClassFront(c, { T: S.T });
      drawPerson(c, 'morel', { x: 1420, y: 960, s: .82, T: S.T, expr: 'neutral', talk: S.talk('o02'), turn: -.2, armL: 'down', armR: S.lt > 1.6 ? 'point' : 'down' });
      drawPerson(c, 'aya', { x: 900, y: 960, s: .85, T: S.T, e: ex(S.lt, [[0, 'shy'], [2, 'smile']]), armL: 'strap', armR: 'strap', pendant: true, look: 1 });
      studentBacks(c, S.T, 980, 6, 80);
    } },
  { name: 'Elle s\'assoit', items: [['w', 2.6]], sfx: [['steps', 0, { dur: 1.4 }], ['chair', 1.6]],
    cam: S => ({ x: 1100, y: 560, z: 1.25 }),
    draw(c, S) { classRows(c, S, { aya: true, ayaWalk: S.k(0, 1.6), nox: false }); } },
  { name: 'Nox entre', music: 'nox', items: [['w', 6.0]], sfx: [['doorCreak', .2], ['steps', 1.2, { dur: 3.2, heavy: true }], ['chair', 4.6]],
    cam: S => ({ x: lerp(560, 1100, ease(S.k(1.0, 4.8))), y: 560, z: lerp(1.35, 1.25, S.lt / S.d) }),
    draw(c, S) { classRows(c, S, { aya: true, nox: true, noxT: S.lt, door: ease(S.k(0, .9)) * (1 - S.k(5, 5.8)), turnToDoor: S.k(.3, .8) * (1 - S.k(5, 5.6)) }); } },
  { name: 'En retard, Nox', items: [['w', .3], ['l', 'o03'], ['w', .5]],
    cam: S => ({ x: 1420, y: 440, z: 2.2 }),
    draw(c, S) { setClassFront(c, { T: S.T }); drawPerson(c, 'morel', { x: 1420, y: 960, s: .82, T: S.T, e: ex(S.lt, [[0, 'tired'], [1.2, 'annoyed']]), talk: S.talk('o03'), turn: .2, look: .6, armL: 'hips', armR: 'down', tilt: .05 }); } },
  { name: 'Personne ne m\'avait parlé de lui', items: [['w', .6], ['l', 'n07'], ['w', 1.8]], sfx: [['hum', .2]],
    cam: S => ({ x: 1270, y: 600, z: lerp(2.0, 2.3, S.lt / S.d) }),
    draw(c, S) { classRows(c, S, { aya: true, nox: true, noxT: 99, ayaLook: true, glow: 1 + .8 * S.k(1.2, 2.4) }); } },

  // ---------------- ACTE 4 : LA PAUSE ----------------
  { name: 'Midi', music: 'light', fadeIn: .4, items: [['w', .5], ['l', 'i04'], ['w', .2], ['l', 'a10'], ['w', .3]], sfx: [['crowd', 0, { dur: 6 }]],
    cam: S => ({ x: 960, y: 600, z: 1.12 }),
    draw(c, S) { lunchScene(c, S, { nina: ex(S.lt, [[0, 'excited']]), aya: ex(S.lt, [[0, 'neutral'], [S.L('a10').t0, 'curious']]), ninaArm: 'point' }); } },
  { name: 'Personne ne sait', items: [['l', 'i05'], ['w', .3]],
    cam: S => ({ x: 800, y: 470, z: 2.1 }),
    draw(c, S) { lunchScene(c, S, { nina: ex(S.lt, [[0, 'worried'], [2.5, 'curious']]), aya: exprParams('curious'), ninaArm: 'shrug' }); } },
  { name: 'La Grande Panne', music: 'mystery', items: [['w', .4], ['l', 'i06'], ['w', .3]], sfx: [['whoosh', 0]],
    cam: S => ({ x: 960, y: 500, z: lerp(1.9, 2.2, S.lt / S.d) }),
    draw(c, S) { lunchScene(c, S, { nina: exprParams('worried'), aya: ex(S.lt, [[0, 'curious'], [S.L('i06').t1 - 1.2, 'surprised']]), lean: .14, ninaArm: 'mouth', whisper: true }); } },
  { name: 'Il y a trois ans', items: [['w', .3], ['l', 'a11'], ['w', 1.2]], sfx: [['heart', 0, { dur: 1.8 }]],
    cam: S => ({ x: 1140, y: 460, z: lerp(2.6, 2.9, S.lt / S.d) }),
    draw(c, S) { lunchScene(c, S, { nina: exprParams('worried'), aya: exprParams('scared'), ayaArm: 'pendant' }); } },
  { name: 'La sonnerie', music: 'light', items: [['w', .6], ['l', 'i07'], ['w', 1.6]], sfx: [['bell', 0, { dur: 2.2 }]],
    cam: S => ({ x: 960, y: 600, z: 1.12 }),
    draw(c, S) { lunchScene(c, S, { nina: ex(S.lt, [[0, 'surprised'], [.6, 'happy']]), aya: exprParams('worried'), ninaLeave: S.k(S.L('i07').t1 - .2, S.d), ayaArm: 'pendant' }); } },

  // ---------------- FIN ----------------
  { name: 'Le soir', music: 'night', fadeIn: .8, items: [['w', .8], ['l', 'n08'], ['w', .9]], sfx: [['zip', .6], ['paper', 2.2]],
    cam: S => ({ x: 640, y: 560, z: 1.25 }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '21:47', curtain: 1, rooftop: 0 }); drawPerson(c, 'aya', { x: 620, y: 1000, s: .95, T: S.T, e: ex(S.lt, [[0, 'tired'], [2.2, 'curious']]), armL: S.lt > 2.2 ? { tx: -20, ty: -440, b: 1, item: noteItem } : { tx: -60, ty: -330 }, armR: S.lt > 2.2 ? 'hold' : { tx: 60, ty: -330 }, lookY: .6, pendant: true, turn: .1 }); const bag = rect(400, 860, 150, 120, 30); paint(c, bag, { fill: '#2e2a26', stroke: '#000', lw: 3 }); } },
  { name: 'Le mot', music: 'reveal', items: [['w', .5], ['l', 'a12'], ['w', 1.6]], sfx: [['sting', S => (S.a12?.t1 ?? 4) + .2]],
    cam: S => ({ x: 960, y: 540, z: lerp(1.0, 1.12, S.lt / S.d) }),
    draw(c, S) { const l = S.L('a12'); insertNote(c, { T: S.T, write1: S.k(l.t0, l.t0 + l.dur * .45), write2: S.k(l.t0 + l.dur * .5, l.t1), sign: S.lt > l.t1 + .3 ? 1 : 0 }); } },
  { name: 'À la fenêtre', music: 'nox', items: [['w', 4.4]], sfx: [['steps', .1, { dur: .8 }], ['wind', 1, { dur: 3 }]],
    cam: S => ({ x: lerp(1200, 1440, ease(S.k(0, 1.2))), y: 470, z: lerp(1.3, 2.2, ease(S.k(.6, 3.5))) }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '21:48', curtain: 1, rooftop: 1 - S.k(3.4, 3.9) }); const w = walkTo(S.lt, 0, .9, 900, 1440); drawPerson(c, 'aya', { x: w.x, y: 1000, s: .95, T: S.T, walk: w.walk, back: true, armL: S.lt > 1.2 ? { tx: -130, ty: -620 } : 'down', armR: 'down' }); } },
  { name: 'Je me trompais', items: [['w', .5], ['l', 'n09'], ['w', .7], ['l', 'n10'], ['w', 1.4]], sfx: [['hit', S => (S.n10?.t1 ?? 7) + .1]], fadeOut: .2,
    cam: S => ({ x: 1440, y: 400, z: lerp(2.2, 2.6, S.lt / S.d) }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '21:48', curtain: 1, rooftop: 0 }); drawPerson(c, 'aya', { x: 1440, y: 1000, s: .95, T: S.T, e: ex(S.lt, [[0, 'worried'], [S.L('n10').t0, 'determined']]), armL: 'down', armR: 'pendant', pendant: true, turn: -.25, look: -.6 }); } },
  { name: 'À suivre', music: 'end', items: [['w', 4.6]],
    draw(c, S) { endCard(c, { T: S.T, k: clamp(S.lt / 2.4) }); } },
];

buildEpisode(SHOTS);
