const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
  sendParsingRequest: () => ipcRenderer.send("start:parsing"),
  handleParsingData: (data) => ipcRenderer.on('retrieve:data', data)
})
