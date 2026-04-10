import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, MenuAction, OpenFileResult, DiagramFile } from '../src/types/electronAPI'

const api: ElectronAPI = {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (content, filePath) => ipcRenderer.invoke('file:save', { content, filePath }),
  exportPNG: (dataUrl, outputPath) => ipcRenderer.invoke('export:png', { dataUrl, outputPath }),
  exportRawFile: (base64, outputPath) => ipcRenderer.invoke('export:raw', { base64, outputPath }),
  getSavePNGPath: () => ipcRenderer.invoke('dialog:save-png'),
  getSavePDFPath: () => ipcRenderer.invoke('dialog:save-pdf'),
  loadCustomIcons: () => ipcRenderer.invoke('icons:load-custom'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),
  pickIconsDir: () => ipcRenderer.invoke('settings:pick-icons-dir'),
  onMenuAction: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, action: MenuAction) => callback(action)
    ipcRenderer.on('menu:action', listener)
    return () => ipcRenderer.off('menu:action', listener)
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)
