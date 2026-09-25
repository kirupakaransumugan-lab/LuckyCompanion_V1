const { ipcMain } = require('electron');

// this is the general app ipc, show/hide/quit
function registerAppIpc(mainWindow, app) {
  ipcMain.on('hide-companion', () => mainWindow.hide());
  ipcMain.on('show-companion', () => mainWindow.show());
  ipcMain.on('quit-app', () => {
    app.isQuitting = true;
    app.quit();
  });
}

module.exports = { registerAppIpc };
