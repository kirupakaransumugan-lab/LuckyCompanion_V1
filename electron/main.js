const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createTray } = require('./tray/tray');
const { registerSettingsIpc } = require('./ipc/settings');
const { registerAppIpc } = require('./ipc/app');
const { getDisplayById, getDefaultPosition, isPositionVisible, WINDOW_WIDTH, WINDOW_HEIGHT } = require('./displays');

const store = new Store();
let mainWindow;

// default spot for the companion: near the top right corner of whichever
// monitor is selected in settings (falls back to the primary display)
function getStartPosition() {
  const saved = store.get('position');
  if (saved && isPositionVisible(saved)) return saved;

  // either nothing saved yet, or the display it was saved on is gone (e.g.
  // a second monitor got unplugged) -- fall back to the configured monitor,
  // which itself falls back to the primary display if that's gone too
  const monitorId = store.get('settings.monitorId');
  const display = monitorId != null ? getDisplayById(monitorId) : screen.getPrimaryDisplay();
  return getDefaultPosition(display);
}

function createWindow() {
  const position = getStartPosition();

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: position.x,
    y: position.y,
    transparent: true,
    frame: false,
    alwaysOnTop: store.get('settings.alwaysOnTop', true),
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // remember position whenever the window is moved
  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    store.set('position', { x, y });
  });

  // hide instead of close, so the app keeps living in the tray
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray(mainWindow, store, app);
  registerSettingsIpc(mainWindow, store);
  registerAppIpc(mainWindow, app);
});

// keep running in the tray even if every window is closed
app.on('window-all-closed', (event) => {
  event.preventDefault();
});
