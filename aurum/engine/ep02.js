'use strict';
/* =====================================================================
   AURUM — Épisode 2 « N. » : découpage plan par plan.
   Suite directe de l'épisode 1 : le mot signé « N. », la Centrale,
   la Grande Panne, et Nox qui la mène jusqu'à un badge d'accès.
   ===================================================================== */

const LINES = {
  n01: ['N', "N. Une seule lettre. Et toute la nuit, je n'ai pensé qu'à ça."],
  n02: ['N', "Le toit d'en face était vide. Mais j'aurais juré qu'il me regardait encore."],
  t01: ['timi', "T'as dormi dans une machine à laver ?"],
  a01: ['aya', "Presque."],
  m01: ['mom', "Tout va bien, ma chérie ?"],
  a02: ['aya', "Oui. Juste… le lycée."],
  a03: ['aya', "Maman… Papa travaillait où, exactement ?"],
  m02: ['mom', "À la Centrale. Celle qui s'est éteinte… pendant la Grande Panne."],
  m03: ['mom', "Mange. Tu vas être en retard."],
  n03: ['N', "Maman ne parlait jamais de la Centrale. Jamais."],
  i01: ['nina', "Tu cherches quelqu'un ?"],
  a04: ['aya', "Nox. Il est là, aujourd'hui ?"],
  i02: ['nina', "Nox ? Personne ne sait jamais s'il est là."],
  i03: ['nina', "Pendant la Grande Panne, la ville est restée trois jours dans le noir. Ma grand-mère dit qu'on entendait des pas… sur les toits."],
  o01: ['morel', "Aujourd'hui : l'histoire d'Aurum. Ses arches, ses places… et sa Centrale."],
  a05: ['aya', "Monsieur ? Qu'est-ce qui s'est passé, pendant la Grande Panne ?"],
  o02: ['morel', "Ce sujet n'est pas au programme, mademoiselle."],
  v01: ['vic', "Ici, on n'en parle pas, la nouvelle. Tu devrais faire pareil."],
  n04: ['N', "Si personne ne voulait parler… les archives, elles, n'avaient pas le choix."],
  a06: ['aya', "« Aurum plongée dans le noir. La Centrale s'éteint sans explication. »"],
  n05: ['N', "Sur la photo, toute l'équipe de la Centrale. Et quelqu'un avait découpé un visage."],
  a07: ['aya', "Papa…"],
  a08: ['aya', "Et lui… ces cheveux…"],
  n06: ['N', "À la sortie, je l'ai vu. Alors, je l'ai suivi."],
  a09: ['aya', "Nox ?"],
  a10: ['aya', "C'est toi, N. ? C'est toi qui m'as écrit ?"],
  a11: ['aya', "Attends !"],
  a12: ['aya', "« Minuit. Porte Est. »"],
  n07: ['N', "Ne fais confiance à personne, disait le mot."],
  n08: ['N', "Alors pourquoi… est-ce que j'avais envie de lui faire confiance, à lui ?"],
  n09: ['N', "Au bout de chaque rue d'Aurum, on la voyait : la Centrale. Éteinte depuis trois ans."],
  a13: ['aya', "« Un ingénieur est porté disparu. »"],
  a14: ['aya', "Il y a quelqu'un ?"],
  i04: ['nina', "Alors ? T'as trouvé ton fantôme ?"],
  a15: ['aya', "Pas encore."],
  i05: ['nina', "Fais attention, Aya. Ici, ceux qui posent trop de questions… finissent par avoir des problèmes."],
  n10: ['N', "Cette nuit-là, pour la première fois de ma vie… j'ai désobéi à maman."],
};
const PH = {};

// positions utiles dans l'insert du journal (voir insertNewspaper)
const NEWS_DAD = { x: 660, y: 622 }, NEWS_KID = { x: 735, y: 736 };
const ROOF = { x: 1590, y: 440 }; // le toit d'en face, vu par la fenêtre de la chambre

const SHOTS = [
  // ---------------- COLD OPEN ----------------
  { name: 'Minuit passé', fadeIn: 1.2, music: 'night', items: [['w', 1.0], ['l', 'n01'], ['w', .6]], sfx: [['tick', 0, { dur: 6 }]],
    cam: S => ({ x: lerp(1000, 1120, ease(S.lt / S.d)), y: 470, z: lerp(1.35, 1.55, ease(S.lt / S.d)) }),
    draw(c, S) {
      setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '00:47', curtain: 1, rooftop: 0 });
      drawPerson(c, 'aya', { x: 1060, y: 1000, s: .95, T: S.T, e: ex(S.lt, [[0, 'worried'], [S.L('n01').t0 + 1.2, 'curious']]), armL: { tx: -20, ty: -440, b: 1, item: noteItem }, armR: 'hold', lookY: .55, pendant: true, turn: .15 });
    } },
  { name: 'Le toit vide', items: [['w', .4], ['l', 'n02'], ['w', 1.0]], sfx: [['wind', 0, { dur: 5 }], ['hum', S => (S.n02?.t1 ?? 4) - .4]],
    cam: S => ({ x: lerp(1380, 1460, S.lt / S.d), y: 440, z: lerp(2.1, 2.4, S.lt / S.d) }),
    draw(c, S) {
      setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '00:48', curtain: 1, rooftop: 0 });
      const g = S.k(S.L('n02').t1 - .5, S.L('n02').t1) * (1 - S.k(S.L('n02').t1 + .2, S.L('n02').t1 + .6));
      if (g > 0) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, ROOF.x, ROOF.y, 60, 'rgba(255,205,130,A)', .9 * g); c.restore(); }
      drawPerson(c, 'aya', { x: 1440, y: 1000, s: .95, T: S.T, back: true, armL: { tx: -130, ty: -620 }, armR: 'down' });
    } },
  { name: 'Générique', items: [['w', 6.0]], music: 'title', fadeOut: .8,
    draw(c, S) { titleCard(c, { T: S.T, k: clamp(S.lt / 3), sub: 'ÉPISODE 2 — N.' }); } },

  // ---------------- ACTE 1 : LA MAISON ----------------
  { name: 'Les cernes', fadeIn: .5, music: 'home', items: [['w', 1.3], ['l', 't01'], ['w', .25], ['l', 'a01'], ['w', .7]], sfx: [['pot', 0], ['steps', 0, { dur: 1.2 }], ['laughKid', S => (S.t01?.t1 ?? 3) - .2]],
    cam: S => ({ x: 860, y: 560, z: 1.08 }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const w = walkTo(S.lt, 0, 1.2, -120, 380), lt1 = S.L('t01');
      drawPerson(c, 'aya', { x: w.x, y: 1010, s: .95, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'tired'], [lt1.t1, 'deadpan']]), talk: S.talk('a01'), armL: 'strap', armR: 'strap', turn: .3, look: S.lt > 1.3 ? 1 : 0, slump: .3 });
      const tl = S.lt - lt1.t0;
      drawPerson(c, 'timi', { x: 760, y: 968, s: 1.0, T: S.T, e: ex(tl, [[-9, 'neutral'], [-.3, 'surprised'], [.2, 'laugh']]), talk: S.talk('t01'), noLegs: true, turn: -.5, look: -1, armL: tl > 0 ? { tx: -200, ty: -440, b: 1, hand: 'point' } : 'hold', armR: 'hold', hop: tl > 1 && tl < 3 ? Math.abs(Math.sin(tl * 9)) * 7 : 0 });
      kitchenTable(c, 800, 790, 700, S.T);
      drawPerson(c, 'mom', { x: 1600, y: 1010, s: .95, T: S.T, expr: 'smile', turn: -.6, look: -1, armL: 'hold', armR: 'down' });
    } },
  { name: 'Tout va bien ?', items: [['w', .3], ['l', 'm01'], ['w', .3], ['l', 'a02'], ['w', .5]],
    cam: S => ({ x: 560, y: 480, z: 1.65 }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const la = S.L('a02');
      drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'nervous'], [la.t0, 'shy'], [la.t1, 'nervous']]), talk: S.talk('a02'), armL: 'strap', armR: 'down', turn: .45, look: S.lt < la.t0 + .8 ? 1 : 0, lookY: S.lt > la.t0 + .8 ? .5 : 0, pendant: true });
      drawPerson(c, 'mom', { x: 720, y: 1012, s: .95, T: S.T, e: ex(S.lt, [[0, 'worried'], [la.t1, 'sad']]), talk: S.talk('m01'), turn: -.55, look: -1, armL: 'chest', armR: 'down', tilt: -.06 });
    } },
  { name: 'La question', items: [['w', .5], ['l', 'a03'], ['w', .6], ['l', 'm02'], ['w', .8]], music: 'mystery', musicAt: 4.1, sfx: [['heart', S => (S.m02?.t0 ?? 4) + 1.5, { dur: 2 }]],
    cam: S => ({ x: lerp(560, 600, S.lt / S.d), y: 450, z: lerp(1.75, 2.0, ease(S.lt / S.d)) }),
    draw(c, S) {
      setKitchen(c, { T: S.T });
      const l3 = S.L('a03'), lm = S.L('m02');
      drawPerson(c, 'aya', { x: 400, y: 1010, s: .95, T: S.T, e: ex(S.lt, [[0, 'curious'], [lm.t0 + 1.2, 'surprised'], [lm.t1, 'worried']]), talk: S.talk('a03'), armL: 'strap', armR: S.lt > lm.t1 ? 'pendant' : 'down', turn: .45, look: 1, pendant: true });
      drawPerson(c, 'mom', { x: 720, y: 1012, s: .95, T: S.T, e: ex(S.lt, [[0, 'smile'], [l3.t0 + 1.4, 'worried'], [lm.t0, 'sad']]), talk: S.talk('m02'), turn: -.55, look: S.lt > lm.t0 + 1 ? 0 : -1, lookY: S.lt > lm.t0 + 1 ? .45 : 0, armL: 'down', armR: 'down', tilt: S.lt > lm.t0 ? -.1 : -.04 });
    } },
  { name: 'Mange', items: [['w', .25], ['l', 'm03'], ['w', .5]], sfx: [['pot', S => (S.m03?.t1 ?? 2) + .1]],
    cam: S => ({ x: 720, y: 420, z: 2.5 }),
    draw(c, S) { setKitchen(c, { T: S.T }); drawPerson(c, 'mom', { x: 720, y: 1012, s: .95, T: S.T, e: ex(S.lt, [[0, 'annoyed'], [S.L('m03').t1, 'sad']]), talk: S.talk('m03'), turn: lerp(-.4, -.9, S.k(S.L('m03').t1 - .4, S.d)), look: -1, armL: 'down', armR: 'down', tilt: -.04 }); } },
  { name: 'Jamais', music: 'sad', items: [['w', .3], ['l', 'n03'], ['w', 1.0]],
    cam: S => ({ x: 200, y: 400, z: lerp(3.4, 3.8, S.lt / S.d) }),
    draw(c, S) { setKitchen(c, { T: S.T, photoGlint: .3 + .2 * Math.sin(S.T) }); } },

  { name: 'Sur le chemin', fadeIn: .5, music: 'city', items: [['w', .8], ['l', 'n09'], ['w', 1.4]], sfx: [['ambCity', 0, { dur: 8 }], ['steps', 0, { dur: 3.2 }]],
    heat: 2, cam: S => ({ x: lerp(900, 1020, S.lt / S.d), y: 540, z: 1.0 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 0, centrale: 1, centraleX: 1560, gap: [1260, 1900] }); crowd(c, S.T, [{ x: 250 + S.lt * 40, y: 905, s: .55, k: 1, vx: 40 }, { x: 1120 - S.lt * 30, y: 905, s: .55, k: 3, vx: -30 }], .18); },
    fg(c, S) { const w = walkTo(S.lt, 0, 3.2, 380, 900), l = S.L('n09'); drawPerson(c, 'aya', { x: w.x, y: 1010, s: .82, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'neutral'], [l.t0 + 2.5, 'worried']]), turn: .6, look: 1, lookY: S.lt > 3.2 ? -.4 : 0, armL: 'strap', armR: 'strap', pendant: true }); } },

  // ---------------- ACTE 2 : LE LYCÉE ----------------
  { name: 'Elle le cherche', fadeIn: .4, music: 'school', items: [['w', 1.5], ['l', 'i01'], ['w', .2], ['l', 'a04'], ['w', .3], ['l', 'i02'], ['w', .6]], sfx: [['crowd', 0, { dur: 11 }]],
    cam: S => ({ x: 920, y: 520, z: 1.3 }),
    draw(c, S) {
      setCourtyard(c, { T: S.T }); crowd(c, S.T, [{ x: 300, y: 760, s: .45, k: 1, talk: 1, turn: .4 }, { x: 380, y: 762, s: .45, k: 2, turn: -.4 }, { x: 1300, y: 770, s: .45, k: 3 }, { x: 1420, y: 768, s: .45, k: 4, turn: -.3 }], .2);
      const w = walkTo(S.lt, 0, 1.4, 1550, 1080), l2 = S.L('i02');
      drawPerson(c, 'aya', { x: 760, y: 1030, s: .9, T: S.T, e: ex(S.lt, [[0, 'worried'], [S.L('a04').t0, 'nervous'], [l2.t0 + 1.2, 'deadpan']]), talk: S.talk('a04'), turn: S.lt < 1.5 ? Math.sin(S.lt * 2.4) * .6 : .45, look: S.lt < 1.5 ? Math.sin(S.lt * 2.4) : 1, armL: 'strap', armR: 'strap', pendant: true });
      drawPerson(c, 'nina', { x: w.x, y: 1030, s: .9, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'happy'], [S.L('i01').t1, 'curious'], [l2.t0, 'laugh'], [l2.t0 + 1.4, 'smile']]), talk: S.talk('i01', 'i02'), turn: -.45, look: -1, armL: 'down', armR: S.lt > l2.t0 && S.lt < l2.t1 ? 'shrug' : 'down' });
    } },
  { name: 'Des pas sur les toits', music: 'mystery', items: [['w', .3], ['l', 'i03'], ['w', .9]], sfx: [['whoosh', 0], ['steps', S => (S.i03?.t1 ?? 7) - 1.2, { dur: 1.2, heavy: true }]],
    cam: S => ({ x: lerp(980, 900, S.lt / S.d), y: 450, z: lerp(1.85, 2.05, S.lt / S.d) }),
    draw(c, S) {
      setCourtyard(c, { T: S.T, fountain: false });
      const l = S.L('i03');
      drawPerson(c, 'aya', { x: 760, y: 1030, s: .9, T: S.T, e: ex(S.lt, [[0, 'curious'], [l.t1 - 2.0, 'scared']]), turn: .45, look: 1, armL: 'strap', armR: S.lt > l.t1 - 2 ? 'pendant' : 'strap', pendant: true, lean: .05 });
      drawPerson(c, 'nina', { x: 1040, y: 1030, s: .9, T: S.T, e: ex(S.lt, [[0, 'worried'], [l.t0 + 4.5, 'scared']]), talk: S.talk('i03'), turn: -.45, look: -1, armL: 'mouth', armR: 'down', lean: -.1 });
    } },
  { name: 'Le cours', music: 'tension', fadeIn: .3, items: [['w', .4], ['l', 'o01'], ['w', .3]], sfx: [['chalk', 0]],
    cam: S => ({ x: 1180, y: 520, z: 1.25 }),
    draw(c, S) {
      setClassFront(c, { T: S.T });
      drawPerson(c, 'morel', { x: 1420, y: 960, s: .82, T: S.T, e: ex(S.lt, [[0, 'focus'], [S.L('o01').t0 + 3.5, 'neutral']]), talk: S.talk('o01'), turn: -.35, look: -1, armL: S.lt > S.L('o01').t0 + 1.5 ? { tx: -230, ty: -520, b: 1, hand: 'point' } : 'hips', armR: 'down' });
      studentBacks(c, S.T, 980, 6, 80);
    } },
  { name: 'Aya lève la main', items: [['w', .7], ['l', 'a05'], ['w', .4]], sfx: [['heart', 0, { dur: 2 }]],
    cam: S => ({ x: 1290, y: 600, z: lerp(1.6, 1.85, S.lt / S.d) }),
    draw(c, S) { classRows(c, S, { aya: true, nox: false, ayaE: ex(S.lt, [[0, 'nervous'], [S.L('a05').t0, 'determined']]), ayaArmR: S.lt > .3 ? 'raise' : 'hold', ayaTalk: S.talk('a05') }); } },
  { name: 'Pas au programme', items: [['w', .35], ['l', 'o02'], ['w', .6]],
    cam: S => ({ x: 1420, y: 440, z: 2.2 }),
    draw(c, S) { setClassFront(c, { T: S.T }); drawPerson(c, 'morel', { x: 1420, y: 960, s: .82, T: S.T, e: ex(S.lt, [[0, 'surprised'], [.3, 'cold']]), talk: S.talk('o02'), turn: .2, look: .6, armL: 'hips', armR: 'down', tilt: .04 }); } },
  { name: 'Victoria', items: [['w', .3], ['l', 'v01'], ['w', .9]], sfx: [['giggle', S => (S.v01?.t1 ?? 3) + .1], ['whisper', .1]],
    cam: S => ({ x: lerp(760, 720, S.lt / S.d), y: 470, z: 1.8 }),
    draw(c, S) { classRows(c, S, { aya: true, nox: false, stareAya: true, ayaE: exprParams('nervous'), who: { vic: { expr: 'smirk', talk: S.talk('v01'), turn: .6, look: 1 }, fol1: { expr: S.lt > S.L('v01').t1 ? 'laugh' : 'smirk', turn: .5, look: 1 } } }); } },
  { name: 'La place vide', music: 'nox', items: [['w', 2.6]], sfx: [['hum', .2]],
    cam: S => ({ x: lerp(1300, 1230, S.lt / S.d), y: 600, z: lerp(2.0, 2.25, S.lt / S.d) }),
    draw(c, S) { classRows(c, S, { aya: true, nox: false, ayaE: ex(S.lt, [[0, 'worried'], [1.6, 'sad']]), ayaTurn: -.8, ayaLookX: -1, ayaLookY: .3 }); } },

  { name: 'Midi', music: 'light', fadeIn: .4, items: [['w', .5], ['l', 'i04'], ['w', .3], ['l', 'a15'], ['w', .6]], sfx: [['crowd', 0, { dur: 5 }]],
    cam: S => ({ x: 960, y: 600, z: 1.12 }),
    draw(c, S) { lunchScene(c, S, { nina: ex(S.lt, [[0, 'excited'], [S.L('i04').t1, 'smile']]), aya: ex(S.lt, [[0, 'tired'], [S.L('a15').t0, 'deadpan']]), ninaArm: 'point', ninaTalk: S.talk('i04'), ayaTalk: S.talk('a15') }); } },
  { name: 'Fais attention', music: 'tension', items: [['w', .4], ['l', 'i05'], ['w', 1.0]], sfx: [['heart', S => (S.i05?.t1 ?? 5) - 1, { dur: 2 }]],
    cam: S => ({ x: lerp(820, 860, S.lt / S.d), y: 470, z: lerp(2.0, 2.2, S.lt / S.d) }),
    draw(c, S) { lunchScene(c, S, { nina: ex(S.lt, [[0, 'worried'], [S.L('i05').t0 + 2.5, 'focus']]), aya: exprParams('worried'), lean: .12, ninaArm: 'hold', ninaTalk: S.talk('i05'), ayaTalk: 0 }); } },

  // ---------------- ACTE 3 : LES ARCHIVES ----------------
  { name: 'La bibliothèque', fadeIn: .5, music: 'mystery', items: [['w', .6], ['l', 'n04'], ['w', .9]], sfx: [['steps', .3, { dur: 4 }]],
    cam: S => ({ x: lerp(900, 1050, S.lt / S.d), y: 540, z: lerp(1.0, 1.08, S.lt / S.d) }),
    draw(c, S) {
      setLibrary(c, { T: S.T });
      const w = walkTo(S.lt, .3, S.d - .4, 300, 1420);
      drawPerson(c, 'aya', { x: w.x, y: 1040, s: .92, T: S.T, walk: w.walk, e: ex(S.lt, [[0, 'curious'], [S.L('n04').t0 + 2, 'determined']]), armL: 'strap', armR: 'strap', turn: .45, look: .6, pendant: true });
    } },
  { name: 'Le tiroir', items: [['w', 2.2]], sfx: [['click', .6], ['paper', 1.3]],
    cam: S => ({ x: 1560, y: 600, z: 1.85 }),
    draw(c, S) {
      setLibrary(c, { T: S.T, drawer: ease(S.k(.5, 1.0)) });
      const got = S.lt > 1.35;
      drawPerson(c, 'aya', { x: 1420, y: 1040, s: .92, T: S.T, e: ex(S.lt, [[0, 'focus'], [1.35, 'surprised']]), armL: 'strap', armR: got ? { tx: 40, ty: -430, b: -1, item: paperItem } : S.lt > .3 ? { wx: 1690, wy: 640 } : 'strap', turn: got ? .2 : .6, look: got ? 0 : 1, lookY: got ? .6 : 0, pendant: true });
    } },
  { name: 'Le journal', music: 'reveal', items: [['w', .5], ['l', 'a06'], ['w', .5], ['l', 'a13'], ['w', .9]], sfx: [['paper', .1]],
    cam: S => ({ x: 960, y: 540, z: lerp(1.0, 1.06, S.lt / S.d) }),
    draw(c, S) { insertNewspaper(c, { T: S.T }); } },
  { name: 'La photo', items: [['w', .3], ['l', 'n05'], ['w', .3], ['l', 'a07'], ['w', .9]], sfx: [['sting', S => (S.n05?.t0 ?? 0) + 3.2], ['heart', S => (S.a07?.t0 ?? 6), { dur: 2 }]],
    cam: S => { const l = S.L('n05'), u = ease(S.k(0, 1.6)), v = ease(S.k(l.t0 + 3.0, l.t1 + .4)); return { x: lerp(lerp(960, 720, u), NEWS_DAD.x, v), y: lerp(lerp(540, 680, u), NEWS_DAD.y + 30, v), z: lerp(lerp(1.0, 2.0, u), 3.4, v) }; },
    draw(c, S) { insertNewspaper(c, { T: S.T }); } },
  { name: 'Ces cheveux', items: [['w', .3], ['l', 'a08'], ['w', 1.0]], sfx: [['hum', .2]],
    cam: S => { const u = ease(S.k(0, 1.2)); return { x: lerp(NEWS_DAD.x, NEWS_KID.x, u), y: lerp(NEWS_DAD.y + 30, NEWS_KID.y, u), z: lerp(3.4, 4.2, u) }; },
    draw(c, S) { insertNewspaper(c, { T: S.T, kidGlow: S.k(.6, 1.6) }); } },
  { name: 'Un livre tombe', items: [['w', 2.0]], sfx: [['bump', .05], ['steps', .5, { dur: .9 }]],
    cam: S => ({ x: 1100, y: 560, z: 1.15, shake: S.lt < .3 ? 8 : 0 }),
    draw(c, S) {
      setLibrary(c, { T: S.T, drawer: 1 });
      const b = rect(560, 990, 70, 26, 3); paint(c, b, { fill: '#7a5a34', stroke: '#0c0804', lw: 2 });
      const a = S.k(.35, .6) * (1 - S.k(1.1, 1.4));
      if (a > 0) drawNox(c, { x: lerp(820, 420, S.k(.35, 1.4)), y: 930, s: .62, T: S.T, walk: S.T * 6, turn: -.4, alpha: a * .85, noShadow: true });
      drawPerson(c, 'aya', { x: 1420, y: 1040, s: .92, T: S.T, e: exprParams(S.lt < .15 ? 'focus' : 'scared'), armL: 'chest', armR: { tx: 40, ty: -430, b: -1, item: paperItem }, turn: S.lt < .2 ? .4 : -.8, look: S.lt < .2 ? 0 : -1, pendant: true });
    } },

  { name: 'Il y a quelqu\'un ?', items: [['w', .3], ['l', 'a14'], ['w', 1.9]], sfx: [['hum', .2]],
    cam: S => ({ x: lerp(1380, 1340, S.lt / S.d), y: 500, z: 1.9 }),
    draw(c, S) { setLibrary(c, { T: S.T, drawer: 1 }); drawPerson(c, 'aya', { x: 1420, y: 1040, s: .92, T: S.T, e: ex(S.lt, [[0, 'scared'], [1.8, 'worried']]), talk: S.talk('a14'), armL: 'chest', armR: { tx: 40, ty: -430, b: -1, item: paperItem }, turn: Math.sin(S.lt * 1.6 + 1) * .7, look: Math.sin(S.lt * 1.6 + 1), pendant: true }); } },

  // ---------------- ACTE 4 : LE SOIR ----------------
  { name: 'La sortie', fadeIn: .5, music: 'city', items: [['w', .5], ['l', 'n06'], ['w', .7]], sfx: [['ambCity', 0, { dur: 5 }], ['steps', 0, { dur: 5 }]],
    cam: S => ({ x: 960, y: 560, z: 1.0 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 600 + S.lt * 150, time: 'dusk' }); crowd(c, S.T, [{ x: 300 - S.lt * 100, y: 905, s: .55, k: 1, vx: 50 }, { x: 1750 - S.lt * 100, y: 905, s: .55, k: 2, vx: -40 }], .22); },
    fg(c, S) {
      drawNox(c, { x: 1460, y: 960, s: .7, T: S.T, back: true, walk: S.T * 5.5, noShadow: false, glow: 1.3 });
      drawPerson(c, 'aya', { x: 760, y: 1010, s: .82, T: S.T, walk: S.lt * 6.5, e: ex(S.lt, [[0, 'curious'], [1.5, 'determined']]), turn: .55, look: 1, armL: 'strap', armR: 'strap', pendant: true });
    } },
  { name: 'La poursuite', music: 'tension', items: [['w', 4.0]], sfx: [['steps', 0, { dur: 4.0 }], ['heart', .4, { dur: 3.4 }]],
    cam: S => ({ x: 960 + S.lt * 20, y: 560, z: 1.12 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 1400 + S.lt * 260, time: 'dusk' }); },
    fg(c, S) {
      drawNox(c, { x: 1500 + S.lt * 120, y: 960, s: .66, T: S.T, back: true, walk: S.T * 6, alpha: 1 - S.k(3.0, 3.6), glow: 1.3 });
      drawPerson(c, 'aya', { x: 820, y: 1010, s: .82, T: S.T, walk: S.lt * 8.5, e: exprParams('determined'), turn: .6, look: 1, armL: 'swing', armR: 'swing', pendant: true, lean: .06 });
    } },
  { name: 'Disparu', items: [['w', .6], ['l', 'a09'], ['w', 1.0]], sfx: [['wind', 0, { dur: 3 }]],
    cam: S => ({ x: 960, y: 520, z: 1.3 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 2250, time: 'dusk', centrale: 1, centraleX: 1560, gap: [1240, 1900] }); },
    fg(c, S) { drawPerson(c, 'aya', { x: 960, y: 1010, s: .86, T: S.T, e: ex(S.lt, [[0, 'worried'], [S.L('a09').t1, 'nervous']]), talk: S.talk('a09'), turn: Math.sin(S.lt * 1.8) * .7, look: Math.sin(S.lt * 1.8), armL: 'strap', armR: 'pendant', pendant: true }); } },
  { name: 'Derrière elle', music: 'nox', items: [['w', 1.1], ['l', 'a10'], ['w', 1.8]], sfx: [['sting', .1], ['heart', .3, { dur: 3 }]],
    cam: S => ({ x: lerp(960, 980, S.lt / S.d), y: 500, z: lerp(1.35, 1.5, S.lt / S.d) }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 2250, time: 'dusk', centrale: 1, centraleX: 1560, gap: [1240, 1900] }); },
    fg(c, S) {
      const la = S.L('a10'), give = la.t1 + .4;
      drawNox(c, { x: 1200, y: 1000, s: .86, T: S.T, alpha: S.k(.05, .3), turn: -.35, glow: 1.4 + .8 * S.k(la.t0, la.t1), armL: 'pocket', armR: S.lt > give ? { tx: -170, ty: -460, b: 1, item: badgeItem } : 'pocket' });
      drawPerson(c, 'aya', { x: 760, y: 1010, s: .86, T: S.T, e: ex(S.lt, [[0, 'worried'], [.35, 'scared'], [give + .3, 'surprised']]), talk: S.talk('a10'), turn: S.lt < .35 ? 0 : .6, look: S.lt < .35 ? 0 : 1, armL: 'chest', armR: 'pendant', pendant: true, lean: S.lt > .35 && S.lt < .8 ? -.07 : 0 });
    } },
  { name: 'Le badge', items: [['w', 2.4]], sfx: [['shimmer', .3]],
    cam: S => ({ x: 960, y: 540, z: lerp(1.0, 1.08, S.lt / S.d) }),
    draw(c, S) { insertBadge(c, { T: S.T, flip: 0 }); } },
  { name: 'Il montre la Centrale', items: [['w', 3.0], ['l', 'a11'], ['w', .9]], sfx: [['whoosh', 2.55], ['wind', 2.6, { dur: 2 }]],
    cam: S => ({ x: lerp(1050, 1150, S.lt / S.d), y: 470, z: 1.0 }),
    bg(c, S) { setStreet(c, { T: S.T, scroll: 2250, time: 'dusk', centrale: 1, centraleX: 1560, gap: [1240, 1900] }); },
    fg(c, S) {
      const gone = S.k(2.5, 2.8);
      if (gone < 1) drawNox(c, { x: 1200, y: 1000, s: .86, T: S.T, alpha: 1 - gone, turn: .3, glow: 1.6, armL: 'pocket', armR: S.lt > .4 ? { tx: 200, ty: -640, b: -1, hand: 'point' } : 'pocket' });
      const la = S.L('a11');
      drawPerson(c, 'aya', { x: 760, y: 1010, s: .86, T: S.T, back: S.lt > .9 && S.lt < 2.6, e: ex(S.lt, [[0, 'surprised'], [2.6, 'scared']]), talk: S.talk('a11'), turn: S.lt < .9 ? .6 : .5, look: 1, armL: 'strap', armR: S.lt > la.t0 - .2 ? { tx: 230, ty: -470, b: -1, hand: 'open' } : 'strap', pendant: true });
    } },
  { name: 'Le dos du badge', music: 'reveal', items: [['w', 1.6], ['l', 'a12'], ['w', 1.2]], sfx: [['swish', .4], ['sting', S => (S.a12?.t1 ?? 3) + .3]],
    cam: S => ({ x: 960, y: 540, z: lerp(1.0, 1.1, S.lt / S.d) }),
    draw(c, S) { const l = S.L('a12'); insertBadge(c, { T: S.T, flip: ease(S.k(.4, 1.3)), write: S.k(l.t0 - .1, l.t1), sign: S.lt > l.t1 + .3 ? 1 : 0 }); } },

  // ---------------- FIN ----------------
  { name: 'La décision', fadeIn: .6, music: 'night', items: [['w', .8], ['l', 'n07'], ['w', .5], ['l', 'n08'], ['w', 1.4]], sfx: [['tick', 0, { dur: 10 }]],
    cam: S => ({ x: lerp(1240, 1320, S.lt / S.d), y: 470, z: lerp(1.5, 1.8, ease(S.lt / S.d)) }),
    draw(c, S) {
      setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: '23:58', curtain: 1, rooftop: 0, centrale: 1 });
      const l8 = S.L('n08');
      drawPerson(c, 'aya', { x: 1150, y: 1000, s: .95, T: S.T, e: ex(S.lt, [[0, 'worried'], [l8.t0, 'sad'], [l8.t1 - .4, 'determined']]), armL: { tx: -20, ty: -440, b: 1, item: badgeItem }, armR: S.lt > l8.t1 ? 'pendant' : 'hold', lookY: S.lt < l8.t0 ? .55 : 0, turn: S.lt > l8.t1 ? .6 : .15, look: S.lt > l8.t1 ? 1 : 0, pendant: true });
    } },
  { name: 'Minuit', items: [['w', 2.4]], sfx: [['click', 1.2], ['hit', 1.25]], fadeOut: .2,
    cam: S => ({ x: 795, y: 585, z: 4.2 }),
    draw(c, S) { setBedroom(c, { T: S.T, time: 'night', lamp: true, clock: S.lt < 1.2 ? '23:59' : '00:00', curtain: 1 }); } },
  { name: 'Elle sort', music: 'nox', items: [['w', .6], ['l', 'n10'], ['w', 1.6]], sfx: [['door', .9], ['steps', 1.4, { dur: 2.5 }], ['wind', 1.2, { dur: 4 }]], fadeOut: .4,
    cam: S => ({ x: 960, y: 560, z: lerp(1.1, 1.2, S.lt / S.d) }),
    draw(c, S) {
      const open = ease(S.k(.8, 1.6));
      setEntrance(c, { T: S.T, open });
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#3a3448'; c.fillRect(-M, -M, W + 2 * M, H + 2 * M); c.restore();
      if (open > 0) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, 960, 620, 420, 'rgba(150,160,200,A)', .35 * open); c.restore(); }
      const k = S.k(1.6, S.d - .2);
      drawPerson(c, 'aya', { x: 960, y: lerp(1040, 960, k), s: lerp(.95, .8, k), T: S.T, back: true, walk: k > 0 && k < 1 ? S.lt * 6 : null, armL: { tx: -20, ty: -440, b: 1, item: badgeItem }, armR: 'strap', alpha: 1 - S.k(S.d - .7, S.d - .2) });
    } },
  { name: 'À suivre', music: 'end', items: [['w', 4.6]],
    draw(c, S) { endCard(c, { T: S.T, k: clamp(S.lt / 2.4), next: 'AURUM — ÉPISODE 3 : « LA PORTE EST »' }); } },
];

buildEpisode(SHOTS);
