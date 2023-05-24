const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Send
  openSettingsWindow: () => ipcRenderer.send('show:settingsWindow'),
  handleSettingsWindowClosed: (callback) => ipcRenderer.on(
      'closed:settingsWindow', callback),
  parseData: () => ipcRenderer.invoke('start:parsing'),
  stopParsing: () => ipcRenderer.send('stop:parsing'),
  saveData: (data) => ipcRenderer.invoke('save:data', data),
  getData: () => ipcRenderer.invoke('get:data'),
  openExternal: (link) => ipcRenderer.send('open:externalLink', link),
  // Debug
  readExample: () => ipcRenderer.send()
});
