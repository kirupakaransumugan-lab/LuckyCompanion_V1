const { ipcMain, screen } = require('electron');
const { listDisplays, getDisplayById, getDefaultPosition } = require('../displays');

// this is the settings ipc, saves and loads settings with electron-store
function registerSettingsIpc(mainWindow, store) {
  ipcMain.handle('get-settings', () => {
    return store.get('settings', {});
  });

  ipcMain.handle('get-displays', () => listDisplays());

  ipcMain.handle('save-settings', (event, settings) => {
    const previous = store.get('settings', {});
    store.set('settings', settings);

    if (typeof settings.alwaysOnTop === 'boolean') {
      mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
    }

    // switching monitors moves the window there right away, near the same
    // top-right spot it starts at on a fresh install
    if (settings.monitorId != null && settings.monitorId !== previous.monitorId) {
      const display = getDisplayById(settings.monitorId);
      const position = getDefaultPosition(display);
      mainWindow.setPosition(position.x, position.y);
      store.set('position', position);
    }

    return true;
  });

  ipcMain.handle('reset-position', () => {
    const settings = store.get('settings', {});
    const display = settings.monitorId != null ? getDisplayById(settings.monitorId) : screen.getPrimaryDisplay();
    const defaultPosition = getDefaultPosition(display);
    mainWindow.setPosition(defaultPosition.x, defaultPosition.y);
    store.set('position', defaultPosition);
    return defaultPosition;
  });
}

module.exports = { registerSettingsIpc };
