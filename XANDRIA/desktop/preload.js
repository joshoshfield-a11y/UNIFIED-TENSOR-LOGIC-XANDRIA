const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  generate: (intent, solo) => ipcRenderer.invoke('generate:start', { intent, solo }),
  onLog: (cb) => ipcRenderer.on('generate:log', (_, msg) => cb(msg)),
  onDone: (cb) => ipcRenderer.on('generate:done', (_, data) => cb(data)),
  openDist: () => ipcRenderer.invoke('open:path'),
  exportApp: () => ipcRenderer.invoke('export:start', { kind: 'app' }),
  exportGame: () => ipcRenderer.invoke('export:start', { kind: 'game' }),
  onExportLog: (cb) => ipcRenderer.on('export:log', (_, msg) => cb(msg)),
  onExportDone: (cb) => ipcRenderer.on('export:done', (_, data) => cb(data))
})
