import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import electron from 'electron';
const root = fileURLToPath(new URL('..', import.meta.url));
const env = { ...process.env };
// 某些终端由 Electron 宿主启动；子应用必须以桌面模式运行。
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(electron, ['.'], { cwd: root, env, stdio: 'inherit', windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
