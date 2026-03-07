/**
 * sounds.js
 * Manifest of audio files: music (loop/resume rules in audio.js and scenes) and SFX.
 * All paths relative to project root; files live in assets/sounds.
 */

const SOUNDS_MUSIC = [
  { key: 'game-music', path: 'assets/sounds/game-music.mp3' },
  { key: 'boss-music', path: 'assets/sounds/boss-music.mp3' },
  { key: 'generic-bossfight-music', path: 'assets/sounds/generic-bossfight-music.mp3' },
  { key: 'game-over', path: 'assets/sounds/game-over.wav' },
  { key: 'reaper-appears', path: 'assets/sounds/reaper-appears.mp3' },
];

const SOUNDS_SFX = [
  { key: 'damage-dealt-and-received', path: 'assets/sounds/damage-dealt-and-received.mp3' },
  { key: 'level-up', path: 'assets/sounds/level-up.wav' },
  { key: 'level-won', path: 'assets/sounds/level-won.wav' },
];

function getAllSoundEntries() {
  return SOUNDS_MUSIC.concat(SOUNDS_SFX);
}
