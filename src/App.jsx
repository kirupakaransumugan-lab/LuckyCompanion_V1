import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Companion from './components/Companion/Companion.jsx';
import Settings from './components/Settings/Settings.jsx';
import ContextMenu from './components/Menu/ContextMenu.jsx';
import CharacterPicker from './components/CharacterPicker/CharacterPicker.jsx';
import Landing from './components/Landing/Landing.jsx';
import useSettings from './hooks/useSettings.js';
import usePopOut from './hooks/usePopOut.js';
import { HostWindowContext } from './hooks/useHostWindow.js';
import { isElectron } from './utils/platform.js';
import './App.css';

// this is the app root
export default function App() {
  const { settings, updateSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const popOut = usePopOut();

  // listen for tray menu events
  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.onToggleSettings(() => setSettingsOpen((open) => !open));
    window.electronAPI.onOpenCharacterPicker(() => setCharacterPickerOpen(true));
  }, []);

  function openContextMenu(x, y) {
    setMenuPosition({ x, y });
  }

  function closeContextMenu() {
    setMenuPosition(null);
  }

  function handleSelectCharacter(characterId) {
    updateSettings({ characterId });
    setCharacterPickerOpen(false);
  }

  const popped = popOut.popOut;
  // the charm on the web page's hero is shown big; the pop-out window and
  // the desktop app use whatever size is picked in settings
  const companionSettings = isElectron || popped ? settings : { ...settings, characterSize: 'large' };

  const scene = (
    <div className="appRoot">
      <Companion settings={companionSettings} onRightClick={openContextMenu} />

      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {characterPickerOpen && (
        <CharacterPicker
          selectedId={settings.characterId || 'lucky-eye'}
          onSelect={handleSelectCharacter}
          onClose={() => setCharacterPickerOpen(false)}
        />
      )}

      {menuPosition && (
        <ContextMenu
          position={menuPosition}
          popOut={popOut}
          onClose={closeContextMenu}
          onOpenSettings={() => {
            closeContextMenu();
            setSettingsOpen(true);
          }}
          onOpenCharacterPicker={() => {
            closeContextMenu();
            setCharacterPickerOpen(true);
          }}
        />
      )}
    </div>
  );

  // the desktop app is just the transparent scene, the window is the frame
  if (isElectron) return scene;

  // popped out: the scene lives in the picture-in-picture window, the page
  // just shows a note where the charm used to hang
  const portal = popped && createPortal(
    <HostWindowContext.Provider value={popped.window}>{scene}</HostWindowContext.Provider>,
    popped.container
  );

  return (
    <>
      <Landing
        scene={popped ? null : scene}
        popOut={popOut}
        settings={settings}
        onSelectCharacter={(characterId) => updateSettings({ characterId })}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      {portal}
    </>
  );
}
