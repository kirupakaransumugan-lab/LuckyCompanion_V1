import React, { useEffect, useRef } from 'react';
import useHostWindow from '../../hooks/useHostWindow.js';
import { isElectron } from '../../utils/platform.js';
import './ContextMenu.css';

// this is the small right click menu on the companion
export default function ContextMenu({ position, onClose, onOpenSettings, onOpenCharacterPicker, popOut }) {
  const menuRef = useRef(null);
  const hostWindow = useHostWindow();

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    hostWindow.addEventListener('click', handleOutsideClick);
    return () => hostWindow.removeEventListener('click', handleOutsideClick);
  }, [onClose, hostWindow]);

  function handleHide() {
    onClose();
    window.electronAPI.hideCompanion();
  }

  function handleQuit() {
    onClose();
    window.electronAPI.quitApp();
  }

  function handlePopOut() {
    onClose();
    if (popOut.popOut) popOut.close();
    else popOut.open();
  }

  return (
    <div
      ref={menuRef}
      className="contextMenu"
      style={{ top: position.y, left: position.x }}
    >
      <div className="contextMenuItem" onClick={onOpenCharacterPicker}>Change Charm</div>
      <div className="contextMenuItem" onClick={onOpenSettings}>Settings</div>
      {isElectron ? (
        <>
          <div className="contextMenuItem" onClick={handleHide}>Hide</div>
          <div className="contextMenuItem" onClick={handleQuit}>Quit</div>
        </>
      ) : popOut?.supported && (
        <div className="contextMenuItem" onClick={handlePopOut}>
          {popOut.popOut ? 'Back to browser' : 'Pop out to desktop'}
        </div>
      )}
    </div>
  );
}
