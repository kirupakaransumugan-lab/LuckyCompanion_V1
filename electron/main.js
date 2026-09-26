const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createTray } = require('./tray/tray');
const { registerSettingsIpc } = require('./ipc/settings');
const { registerAppIpc } = require('./ipc/app');
const { getDisplayById, getDefaultPosition, isPositionVisible, WINDOW_WIDTH, WINDOW_HEIGHT } = require('./displays');

const store = new Store();
let mainWindow;

// the website opens the app with links like luckycompanion://open?character=uki
const PROTOCOL = 'luckycompanion';

// in dev electron runs as `electron .`, so windows needs the script path too
if (process.defaultApp) {
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// only one charm at a time: a second launch (e.g. clicking the website button
// again) hands its link to the running app and exits
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

// on windows the link arrives as a command line argument
function findProtocolUrl(argv) {
  return argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
}

// shows the charm and switches to the character the website asked for, if any
function handleProtocolUrl(url) {
  if (!mainWindow) return;
  mainWindow.show();
  if (!url) return;

  let characterId = null;
  try {
    characterId = new URL(url).searchParams.get('character');
  } catch {
    return; // malformed link, just showing the charm is enough
  }
  if (characterId) {
    store.set('settings.characterId', characterId);
    mainWindow.webContents.send('set-character', characterId);
  }
}

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

app.on('second-instance', (event, argv) => {
  handleProtocolUrl(findProtocolUrl(argv));
});

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) return; // quitting, don't flash a second window
  createWindow();
  createTray(mainWindow, store, app);
  registerSettingsIpc(mainWindow, store);
  registerAppIpc(mainWindow, app);

  // first launch came from a website link: apply it once the page is ready
  const startUrl = findProtocolUrl(process.argv);
  if (startUrl) {
    mainWindow.webContents.once('did-finish-load', () => handleProtocolUrl(startUrl));
  }
});

// keep running in the tray even if every window is closed
app.on('window-all-closed', (event) => {
  event.preventDefault();
});
