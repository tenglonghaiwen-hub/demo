import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/contracts';

const api: DesktopApi = {
  getState: () => ipcRenderer.invoke('state:get'),
  chooseProject: () => ipcRenderer.invoke('project:choose'),
  createSession: projectPath => ipcRenderer.invoke('session:create', projectPath),
  renameSession: (id, title) => ipcRenderer.invoke('session:rename', id, title),
  saveDraft: (id, draft) => ipcRenderer.invoke('session:save', id, draft),
};
contextBridge.exposeInMainWorld('desktop', api);
