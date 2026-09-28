import { app, BrowserWindow, dialog, ipcMain, net, protocol, session } from 'electron';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SessionStore } from './store';

const projectRoot = path.resolve(__dirname, '../../..');
const localRoot = path.join(projectRoot, '.local');
// 测试与日常数据隔离，覆盖路径仍必须留在本项目 .local 内。
const dataRoot = path.resolve(process.env.UI001_DATA_DIR || path.join(localRoot, 'app'));
if (!dataRoot.startsWith(localRoot + path.sep)) throw new Error('数据目录必须位于项目 .local 子目录。');
mkdirSync(dataRoot, { recursive: true });
app.setPath('userData', dataRoot);
app.setPath('sessionData', path.join(dataRoot, 'chromium'));
app.setPath('logs', path.join(dataRoot, 'logs'));
app.setPath('crashDumps', path.join(dataRoot, 'crashes'));
const store = new SessionStore(path.join(dataRoot, 'sessions.json'));
const selectedProjects = new Set<string>();
const entry = 'app://desktop/index.html';
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win?.isMinimized()) win.restore();
    win?.focus();
  });
  app.whenReady().then(async () => {
    const rendererRoot = path.join(projectRoot, 'dist/renderer');
    protocol.handle('app', request => {
      const url = new URL(request.url);
      if (url.host !== 'desktop' || request.method !== 'GET') return new Response('Forbidden', { status: 403 });
      const file = path.resolve(rendererRoot, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(rendererRoot + path.sep)) return new Response('Forbidden', { status: 403 });
      return net.fetch(pathToFileURL(file).toString());
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    const win = new BrowserWindow({
      width: 1360, height: 900, minWidth: 960, minHeight: 640,
      title: 'AI Desktop Assistant · 候选骨架', backgroundColor: '#f6f7f4',
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true },
    });
    win.removeMenu();
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    win.webContents.on('will-prevent-unload', event => {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'warning', title: '草稿尚未保存',
        message: '有未保存内容或正在保存的操作。',
        detail: '建议返回并保存。继续关闭可能丢失最新输入。',
        buttons: ['返回编辑', '仍然关闭'], defaultId: 0, cancelId: 0, noLink: true,
      });
      if (choice === 1) event.preventDefault();
    });
    const handle = (channel: string, action: (...args: unknown[]) => unknown) => {
      ipcMain.handle(channel, (event, ...args: unknown[]) => {
        if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame
          || event.senderFrame.url !== entry) throw new Error('拒绝非主界面的请求。');
        return action(...args);
      });
    };
    handle('state:get', () => store.read());
    handle('project:choose', async () => {
      const result = await dialog.showOpenDialog(win, { title: '选择项目目录（仅保存路径）', properties: ['openDirectory'] });
      if (result.canceled || !result.filePaths[0]) return null;
      selectedProjects.add(result.filePaths[0]);
      return result.filePaths[0];
    });
    handle('session:create', project => {
      if (project !== null && (typeof project !== 'string' || !selectedProjects.has(project))) {
        throw new Error('请先通过目录选择器选择项目。');
      }
      return store.create(project as string | null);
    });
    handle('session:rename', (id, title) => store.update(id, 'title', title));
    handle('session:save', (id, draft) => store.update(id, 'draft', draft));
    await win.loadURL(entry);
  }).catch(error => {
    dialog.showErrorBox('启动失败', String(error));
    app.exit(1);
  });
  app.on('window-all-closed', () => app.quit());
}
