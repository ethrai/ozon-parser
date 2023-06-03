const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
  sendParsingRequest: () => ipcRenderer.send('start:parsing'),
  listenForParsedData: (data) => ipcRenderer.on('retrieve:data', data),
  sendStopParsingRequest: () => ipcRenderer.send('stop:parsing'),
  saveProducts: (data) => ipcRenderer.send('save:products', data),
  listenForDataSaved: (selection) =>
    ipcRenderer.on('save:products:ok', selection),
  openExternal: (link) => ipcRenderer.send('open:externalLink', link),
  sendShowDialogRequest: (opts) => ipcRenderer.invoke('show:dialog', opts),
  listenForAllDataParsed: (msg) => ipcRenderer.on('parse:stopped', msg),
  getLatestSelection: () => ipcRenderer.invoke('get:latestSelection'),
  getSelections: () => ipcRenderer.invoke('get:selections'),
  deleteSelection: (id) => ipcRenderer.send('delete:selection', id),
  getProducts: (selectionId) => ipcRenderer.invoke('get:products', selectionId),
  exportData: (data) => ipcRenderer.invoke('export:products', data)
})
