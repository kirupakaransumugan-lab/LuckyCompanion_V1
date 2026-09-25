// small wrapper around the electron settings ipc, with a localStorage
// fallback so the same app also runs as a plain web page
import { isElectron } from './platform.js';

const STORAGE_KEY = 'lucky-companion.settings';

export function getSettings() {
  if (isElectron) return window.electronAPI.getSettings();
  try {
    return Promise.resolve(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch (err) {
    return Promise.resolve({});
  }
}

export function saveSettings(settings) {
  if (isElectron) {
    window.electronAPI.saveSettings(settings);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    // private window or blocked storage, settings just won't persist
  }
}

export function getDisplays() {
  if (!isElectron) return Promise.resolve([]);
  return window.electronAPI.getDisplays();
}
