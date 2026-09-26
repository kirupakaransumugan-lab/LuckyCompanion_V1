import { useState, useCallback, useRef, useEffect } from 'react';

// the installer electron-builder makes, published on github releases.
// "latest/download" always points at the newest release, so this never needs updating
export const DOWNLOAD_URL =
  'https://github.com/kirupakaransumugan-lab/LuckyCompanion_V1/releases/latest/download/LuckyCompanion-Setup.exe';

// how long to wait for the desktop app to take focus before assuming it isn't installed
const LAUNCH_TIMEOUT_MS = 1500;

// tries to open the installed desktop app from the website with a
// luckycompanion:// link. browsers can't tell a page whether that worked,
// so we watch for the page losing focus (the app opening steals it)
export default function useDesktopLaunch() {
  // 'idle' | 'launching' | 'launched' | 'notInstalled'
  const [status, setStatus] = useState('idle');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const launch = useCallback((characterId) => {
    clearTimeout(timerRef.current);
    setStatus('launching');

    let appOpened = false;
    const onBlur = () => { appOpened = true; };
    window.addEventListener('blur', onBlur, { once: true });

    window.location.href = `luckycompanion://open?character=${encodeURIComponent(characterId)}`;

    timerRef.current = setTimeout(() => {
      window.removeEventListener('blur', onBlur);
      // TODO(human): decide what the page should do after the wait.
      // `appOpened` is true if the page lost focus (the app, or Windows'
      // "Open Lucky Companion?" prompt, probably appeared).
      // Call setStatus('launched') or setStatus('notInstalled').
    }, LAUNCH_TIMEOUT_MS);
  }, []);

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, launch, reset };
}
