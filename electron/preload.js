const { contextBridge, ipcRenderer } = require('electron');

// this exposes a safe, limited api to the react app
contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetPosition: () => ipcRenderer.invoke('reset-position'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  hideCompanion: () => ipcRenderer.send('hide-companion'),
  showCompanion: () => ipcRenderer.send('show-companion'),
  quitApp: () => ipcRenderer.send('quit-app'),
  onToggleSettings: (callback) => ipcRenderer.on('toggle-settings', callback),
  onOpenCharacterPicker: (callback) => ipcRenderer.on('open-character-picker', callback),
  onSetCharacter: (callback) => ipcRenderer.on('set-character', (event, characterId) => callback(characterId))
});
