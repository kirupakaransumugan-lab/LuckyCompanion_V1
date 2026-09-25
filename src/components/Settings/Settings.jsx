import React, { useEffect, useState } from 'react';
import { getDisplays } from '../../utils/storage.js';
import { isElectron } from '../../utils/platform.js';
import './Settings.css';

const SIZES = ['small', 'medium', 'large'];

// this is the settings panel
export default function Settings({ settings, onChange, onClose }) {
  const [displays, setDisplays] = useState([]);

  useEffect(() => {
    getDisplays().then(setDisplays);
  }, []);

  function handleReset() {
    if (window.electronAPI) window.electronAPI.resetPosition();
  }

  return (
    <div className="settingsPanel">
      <div className="settingsHeader">
        <span>Settings</span>
        <button className="settingsCloseBtn" onClick={onClose}>×</button>
      </div>

      <div className="settingsRow">
        <label>Character size</label>
        <select
          value={settings.characterSize || 'medium'}
          onChange={(e) => onChange({ characterSize: e.target.value })}
        >
          {SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {displays.length > 1 && (
        <div className="settingsRow">
          <label>Show on monitor</label>
          <select
            value={settings.monitorId ?? displays.find((d) => d.isPrimary)?.id ?? ''}
            onChange={(e) => onChange({ monitorId: Number(e.target.value) })}
          >
            {displays.map((display) => (
              <option key={display.id} value={display.id}>
                Monitor {display.index + 1}{display.isPrimary ? ' (primary)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="settingsRow">
        <label>Sound</label>
        <input
          type="checkbox"
          checked={settings.soundOn !== false}
          onChange={(e) => onChange({ soundOn: e.target.checked })}
        />
      </div>

      <div className="settingsRow">
        <label>Animations</label>
        <input
          type="checkbox"
          checked={settings.animationsOn !== false}
          onChange={(e) => onChange({ animationsOn: e.target.checked })}
        />
      </div>

      {/* window placement only exists in the desktop app */}
      {isElectron && (
        <>
          <div className="settingsRow">
            <label>Always on top</label>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop !== false}
              onChange={(e) => onChange({ alwaysOnTop: e.target.checked })}
            />
          </div>

          <div className="settingsRow">
            <label>Start with Windows</label>
            <input
              type="checkbox"
              checked={settings.startWithWindows === true}
              onChange={(e) => onChange({ startWithWindows: e.target.checked })}
            />
          </div>

          <button className="settingsResetBtn" onClick={handleReset}>Reset position</button>
        </>
      )}
    </div>
  );
}
