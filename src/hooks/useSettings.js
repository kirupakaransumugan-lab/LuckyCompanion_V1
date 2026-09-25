import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '../utils/storage.js';

const DEFAULT_SETTINGS = {
  characterId: 'lucky-eye',
  characterSize: 'medium',
  soundOn: true,
  animationsOn: true,
  alwaysOnTop: true,
  startWithWindows: false,
  monitorId: null // null means "primary display"
};

// this hook loads settings on startup and saves changes
export default function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((saved) => {
      setSettings({ ...DEFAULT_SETTINGS, ...saved });
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback((changes) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings, loaded };
}
