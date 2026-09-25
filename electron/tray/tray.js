const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// this builds the system tray icon and its menu
function createTray(mainWindow, store, app) {
  const iconPath = path.join(__dirname, '../../public/icons/tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 });
  }
  const tray = new Tray(icon);
  tray.setToolTip('Lucky Companion');

  function buildMenu() {
    return Menu.buildFromTemplate([
      { label: 'Lucky Companion', enabled: false },
      { type: 'separator' },
      { label: 'Show Companion', click: () => mainWindow.show() },
      { label: 'Hide Companion', click: () => mainWindow.hide() },
      {
        label: 'Change Character',
        click: () => {
          mainWindow.show();
          mainWindow.webContents.send('open-character-picker');
        }
      },
      {
        label: 'Settings',
        click: () => {
          mainWindow.show();
          mainWindow.webContents.send('toggle-settings');
        }
      },
      {
        label: 'Start With Windows',
        type: 'checkbox',
        checked: store.get('settings.startWithWindows', false),
        click: (menuItem) => {
          store.set('settings.startWithWindows', menuItem.checked);
          app.setLoginItemSettings({ openAtLogin: menuItem.checked });
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
  }

  tray.setContextMenu(buildMenu());
  tray.on('click', () => mainWindow.show());

  return tray;
}

module.exports = { createTray };
