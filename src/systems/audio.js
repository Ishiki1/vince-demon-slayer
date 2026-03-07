/**
 * audio.js
 * Volume persistence (music / SFX), animation-speed settings, and playback helpers.
 * Game-music loops; other music resumes game-music when done or when leaving the scene.
 */

const AUDIO_STORAGE_MUSIC = 'vince_musicVolume';
const AUDIO_STORAGE_SFX = 'vince_sfxVolume';
const SETTINGS_STORAGE_ANIMATION_SPEED = 'vince_animationSpeed';
const DEFAULT_MUSIC_VOLUME = 0.7;
const DEFAULT_SFX_VOLUME = 0.8;
const DEFAULT_ANIMATION_SPEED = 1;
const ANIMATION_SPEED_OPTIONS = [1, 1.5, 2];

function getMusicVolume() {
  try {
    const v = parseFloat(localStorage.getItem(AUDIO_STORAGE_MUSIC));
    if (Number.isFinite(v) && v >= 0 && v <= 1) return v;
  } catch (_) {}
  return DEFAULT_MUSIC_VOLUME;
}

function getSfxVolume() {
  try {
    const v = parseFloat(localStorage.getItem(AUDIO_STORAGE_SFX));
    if (Number.isFinite(v) && v >= 0 && v <= 1) return v;
  } catch (_) {}
  return DEFAULT_SFX_VOLUME;
}

function setMusicVolume(value) {
  const v = Math.max(0, Math.min(1, Number(value)));
  try {
    localStorage.setItem(AUDIO_STORAGE_MUSIC, String(v));
  } catch (_) {}
  return v;
}

function setSfxVolume(value) {
  const v = Math.max(0, Math.min(1, Number(value)));
  try {
    localStorage.setItem(AUDIO_STORAGE_SFX, String(v));
  } catch (_) {}
  return v;
}

function sanitizeAnimationSpeed(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_ANIMATION_SPEED;
  let best = ANIMATION_SPEED_OPTIONS[0];
  let bestDistance = Math.abs(numeric - best);
  ANIMATION_SPEED_OPTIONS.forEach((option) => {
    const distance = Math.abs(numeric - option);
    if (distance < bestDistance) {
      best = option;
      bestDistance = distance;
    }
  });
  return best;
}

function getAnimationSpeed() {
  try {
    return sanitizeAnimationSpeed(localStorage.getItem(SETTINGS_STORAGE_ANIMATION_SPEED));
  } catch (_) {
    return DEFAULT_ANIMATION_SPEED;
  }
}

function setAnimationSpeed(value) {
  const speed = sanitizeAnimationSpeed(value);
  try {
    localStorage.setItem(SETTINGS_STORAGE_ANIMATION_SPEED, String(speed));
  } catch (_) {}
  return speed;
}

function getAnimationSpeedLabel(value) {
  return Math.round(sanitizeAnimationSpeed(value) * 100) + '%';
}

function getAnimationSpeedOptions() {
  return ANIMATION_SPEED_OPTIONS.slice();
}

function applyAnimationSettings(scene) {
  const speed = getAnimationSpeed();
  if (scene && scene.anims) scene.anims.globalTimeScale = speed;
  if (scene && scene.tweens) scene.tweens.timeScale = speed;
  if (scene && scene.time) scene.time.timeScale = speed;
  return speed;
}

/** Apply current music volume to all currently playing music (for Settings live update). */
function updateMusicVolume(scene) {
  if (!scene || !scene.sound || typeof getAllSoundEntries !== 'function') return;
  const vol = getMusicVolume();
  const musicKeys = (SOUNDS_MUSIC || []).map(m => m.key);
  try {
    scene.sound.getAllPlaying().forEach(s => {
      if (s.key && musicKeys.indexOf(s.key) !== -1) s.setVolume(vol);
    });
  } catch (_) {}
}

/** Stop any currently playing music (by key or all). */
function stopAllMusic(scene) {
  if (!scene || !scene.sound) return;
  try {
    scene.sound.getAllPlaying().forEach(s => {
      if (s.key && SOUNDS_MUSIC && SOUNDS_MUSIC.some(m => m.key === s.key)) s.stop();
    });
  } catch (_) {}
}

function audioKeyCached(scene, key) {
  return scene && scene.cache && scene.cache.audio && scene.cache.audio.exists(key);
}

/** Start game-music loop. Call when entering Menu or when leaving combat/run-ended to resume default music. */
function playGameMusicLoop(scene) {
  if (!scene || !scene.sound || !audioKeyCached(scene, 'game-music')) return;
  stopAllMusic(scene);
  const vol = typeof getMusicVolume === 'function' ? getMusicVolume() : DEFAULT_MUSIC_VOLUME;
  scene.sound.play('game-music', { volume: vol, loop: true });
}

/** Play a music track once (e.g. game-over, reaper-appears). Optional onComplete. */
function playMusicOnce(scene, key, onComplete) {
  if (!scene || !scene.sound || !audioKeyCached(scene, key)) return;
  stopAllMusic(scene);
  const vol = typeof getMusicVolume === 'function' ? getMusicVolume() : DEFAULT_MUSIC_VOLUME;
  const s = scene.sound.add(key, { volume: vol });
  s.once('complete', () => {
    if (typeof onComplete === 'function') onComplete();
  });
  s.play();
}

/** Play a looping music track (e.g. boss-music, generic-bossfight-music). Stops current music first. */
function playMusicLoop(scene, key) {
  if (!scene || !scene.sound || !audioKeyCached(scene, key)) return;
  stopAllMusic(scene);
  const vol = typeof getMusicVolume === 'function' ? getMusicVolume() : DEFAULT_MUSIC_VOLUME;
  scene.sound.play(key, { volume: vol, loop: true });
}

/** Play SFX once. Skips if the key failed to load (e.g. 404). */
function playSfx(scene, key) {
  if (!scene || !scene.sound || !audioKeyCached(scene, key)) return;
  const vol = typeof getSfxVolume === 'function' ? getSfxVolume() : DEFAULT_SFX_VOLUME;
  scene.sound.play(key, { volume: vol });
}
