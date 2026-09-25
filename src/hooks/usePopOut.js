import { useState, useCallback, useEffect } from 'react';
import { canPopOut } from '../utils/platform.js';

const POP_WIDTH = 280;
const POP_HEIGHT = 420;

// copies every stylesheet from the tab into the new window, since a
// picture-in-picture document starts out completely unstyled
function copyStyles(targetDocument) {
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

// opens an always-on-top window the companion can be portaled into
export default function usePopOut() {
  const [popOut, setPopOut] = useState(null); // { window, container }

  const open = useCallback(async () => {
    if (!canPopOut || popOut) return;
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: POP_WIDTH,
      height: POP_HEIGHT
    });
    copyStyles(pipWindow.document);
    pipWindow.document.title = 'Lucky Companion';
    pipWindow.document.body.classList.add('popOutBody');

    const container = pipWindow.document.createElement('div');
    container.id = 'root';
    pipWindow.document.body.appendChild(container);

    pipWindow.addEventListener('pagehide', () => setPopOut(null));
    setPopOut({ window: pipWindow, container });
  }, [popOut]);

  const close = useCallback(() => {
    if (popOut) popOut.window.close();
  }, [popOut]);

  // closing the tab takes the pop-out down with it anyway, this just
  // covers hot reloads in dev
  useEffect(() => () => popOut?.window.close(), [popOut]);

  return { popOut, open, close, supported: canPopOut };
}
