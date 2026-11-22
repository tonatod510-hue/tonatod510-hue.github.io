// point d'entrée : prépare les textures, expose l'API de rendu
initCore();
window.HW = {
  duration: () => EPI.dur,
  frame(t, type = 'image/jpeg', q = .93) { renderAt(t); return cv.toDataURL(type, q); },
  timeline: () => ({ dur: EPI.dur, shots: EPI.shots.map(s => ({ name: s.name, start: s.start, dur: s.dur, music: s.music || null })), lines: EPI.lines, cues: EPI.cues, sfx: EPI.sfx }),
};
document.fonts.load('700 40px Oswald').then(() => document.fonts.load('600 40px Oswald')).then(() => { window.__ready = true; });
