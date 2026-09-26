import { useState, useCallback, useRef, useEffect } from 'react';

// shared google drive folder holding LuckyCompanion-Setup.exe (the installer
// `npm run dist` makes). to ship a new version, replace the file in that folder
export const DOWNLOAD_URL =
  'https://drive.google.com/drive/folders/1rHVOdtnS1uNwDqJzhp_v8G3SFqQ64pXC?usp=sharing';

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
      // the page lost focus and still doesn't have it back: the app (or the
      // browser's "Open Lucky Companion?" prompt) took over. a quick tab
      // switch and back counts as not installed, so the download stays reachable
      setStatus(appOpened && !document.hasFocus() ? 'launched' : 'notInstalled');
    }, LAUNCH_TIMEOUT_MS);
  }, []);

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, launch, reset };
}
