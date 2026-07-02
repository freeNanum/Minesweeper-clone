const BEST_TIME_PREFIX = 'minesweeper-best-';
const DARK_MODE_KEY = 'minesweeper-dark-mode';

export function getBestTime(difficultyKey) {
  const value = localStorage.getItem(BEST_TIME_PREFIX + difficultyKey);
  return value === null ? null : Number(value);
}

export function setBestTime(difficultyKey, seconds) {
  localStorage.setItem(BEST_TIME_PREFIX + difficultyKey, String(seconds));
}

export function getDarkMode() {
  return localStorage.getItem(DARK_MODE_KEY) === 'true';
}

export function setDarkMode(isDark) {
  localStorage.setItem(DARK_MODE_KEY, String(isDark));
}
