const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendParsingRequest: () => ipcRenderer.send('start:parsing'),
  listenForParsedData: (data) => ipcRenderer.on('retrieve:data', data),
  sendStopParsingRequest: () => ipcRenderer.send('stop:parsing'),
  sendSaveRequest: (data) => ipcRenderer.send('save:products', data),
  listenForDataSaved: (selection) => ipcRenderer.on('save:products:ok',
      selection),
  openExternal: (link) => ipcRenderer.send('open:externalLink', link),
  sendShowDialogRequest: (title, message, type) => ipcRenderer.send(
      'show:dialog', title, message, type),
  listenForAllDataParsed: (msg) => ipcRenderer.on('parse:stopped', msg),
  getLatestSelection: () => ipcRenderer.invoke('get:latestSelection'),
});
