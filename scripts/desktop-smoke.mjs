import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(root, 'outputs', `desktop-${runId}`);
const data = path.join(root, '.local', `qa-${runId}`);
await mkdir(output, { recursive: true });
const env = { ...process.env, UI001_DATA_DIR: data };
delete env.ELECTRON_RUN_AS_NODE;
const checks = [];
const errors = [];
let application;
async function start() {
  application = await electron.launch({ args: [root], cwd: root, env });
  const page = await application.firstWindow();
  // Electron 自己处理 beforeunload；阻止 Playwright 再自动处理同一对话框。
  page.on('dialog', () => {});
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: '新建本地会话' }).waitFor();
  return page;
}
async function check(name, action) { await action(); checks.push({ name, passed: true }); }

try {
  let page = await start();
  await check('真实 Electron 启动、隔离和受限桥', async () => {
    assert.equal(page.url(), 'app://desktop/index.html');
    assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
    const prefs = await application.evaluate(({ BrowserWindow }) => {
      const p = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
      return { sandbox: p.sandbox, contextIsolation: p.contextIsolation, nodeIntegration: p.nodeIntegration };
    });
    assert.deepEqual(prefs, { sandbox: true, contextIsolation: true, nodeIntegration: false });
    assert.deepEqual(await page.evaluate(() => Object.keys(window.desktop).sort()),
      ['chooseProject', 'createSession', 'getState', 'renameSession', 'saveDraft']);
  });
  await page.screenshot({ path: path.join(output, 'empty.png'), fullPage: true });
  await check('创建、输入、保存和重命名', async () => {
    await page.getByRole('button', { name: '新建本地会话' }).click();
    await page.getByLabel('任务草稿', { exact: true }).fill('搭建独立的 Windows AI 助手。\n先明确功能、权限和验收，再连接真实服务。');
    await page.getByRole('button', { name: '保存草稿', exact: true }).click();
    await page.getByText('草稿已保存到本机。', { exact: true }).waitFor();
    await page.getByRole('button', { name: '重命名', exact: true }).click();
    await page.getByLabel('会话名称').fill('骨架验收 · 中文草稿');
    await page.getByRole('button', { name: '确认名称' }).click();
    await page.getByRole('heading', { name: '骨架验收 · 中文草稿', exact: true }).waitFor();
  });
  await check('新建及切换前自动保存，IPC拒绝非法输入', async () => {
    await page.getByLabel('任务草稿', { exact: true }).fill('未点击保存的内容，切换前必须保留。');
    await page.getByRole('button', { name: '新建本地会话' }).click();
    await page.getByRole('button', { name: '骨架验收 · 中文草稿 无项目' }).click();
    assert.equal(await page.getByLabel('任务草稿', { exact: true }).inputValue(), '未点击保存的内容，切换前必须保留。');
    assert.equal(await page.evaluate(async () => {
      try { await window.desktop.createSession('C:\\not-selected'); return false; } catch { return true; }
    }), true);
    assert.equal(await page.evaluate(async () => {
      try { await window.desktop.renameSession((await window.desktop.getState()).sessions[0].id, ' '); return false; } catch { return true; }
    }), true);
  });
  await check('选择目录取消与成功（原生对话框使用测试替身）', async () => {
    await application.evaluate(({ dialog }) => {
      dialog.showOpenDialog = async () => ({ canceled: true, filePaths: [] });
    });
    await page.getByRole('button', { name: '选择项目目录' }).click();
    await page.getByText('已取消选择，原目录保持不变。', { exact: true }).waitFor();
    await application.evaluate(({ dialog }, project) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [project] });
    }, root);
    await page.getByRole('button', { name: '选择项目目录' }).click();
    await page.getByText('已选择目录，将用于下一次新建会话。', { exact: true }).waitFor();
    await page.getByRole('button', { name: '新建本地会话' }).click();
    const state = await page.evaluate(() => window.desktop.getState());
    assert.equal(state.sessions[0].projectPath, root.replace(/[\\/]$/, ''));
    await page.getByLabel('任务草稿', { exact: true }).fill('本地项目草稿；没有向模型发送请求。');
    await page.getByRole('button', { name: '保存草稿', exact: true }).click();
    await page.getByText('草稿已保存到本机。', { exact: true }).waitFor();
  });
  await check('五个未接入模块可导航且无伪成功状态', async () => {
    for (const name of ['电脑与浏览器', '视频与素材', '模型中转', 'MCP 服务', '插件与技能']) {
      await page.getByRole('navigation', { name: '功能模块' }).getByRole('button', { name, exact: true }).click();
      await page.getByRole('heading', { name: '此模块尚未接入' }).waitFor();
    }
    await page.getByRole('navigation', { name: '功能模块' }).getByRole('button', { name: '编程工作台' }).click();
  });
  await check('未保存离开保护（刷新触发，确认对话框使用测试替身）', async () => {
    await page.getByLabel('任务草稿', { exact: true }).fill('退出保护测试，不应悄悄丢失。');
    await application.evaluate(({ dialog, BrowserWindow }) => {
      dialog.showMessageBoxSync = () => 0;
      BrowserWindow.getAllWindows()[0].webContents.reload();
    });
    assert.equal(await page.getByLabel('任务草稿', { exact: true }).inputValue(), '退出保护测试，不应悄悄丢失。');
    await application.evaluate(({ dialog, BrowserWindow }) => {
      dialog.showMessageBoxSync = () => 1;
      BrowserWindow.getAllWindows()[0].webContents.reload();
    });
    await page.getByRole('button', { name: '新会话 3 项目会话' }).waitFor();
    await page.waitForFunction(() => document.querySelector('textarea')?.value === '本地项目草稿；没有向模型发送请求。');
    assert.equal(await page.getByLabel('任务草稿', { exact: true }).inputValue(), '本地项目草稿；没有向模型发送请求。');
  });
  await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
  await check('最小窗口无横向溢出、草稿按钮可见', async () => {
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(960, 640));
    await page.getByRole('button', { name: '保存草稿', exact: true }).scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.getByLabel('任务草稿', { exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.tagName !== 'BODY'), true);
    await page.screenshot({ path: path.join(output, 'minimum.png'), fullPage: true });
  });
  await application.close();
  application = undefined;
  page = await start();
  await check('真实进程重启恢复会话、项目和草稿', async () => {
    await page.getByRole('button', { name: '新会话 3 项目会话' }).waitFor();
    assert.equal(await page.getByLabel('任务草稿', { exact: true }).inputValue(), '本地项目草稿；没有向模型发送请求。');
    const state = await page.evaluate(() => window.desktop.getState());
    assert.equal(state.sessions.length, 3);
    assert.equal(state.sessions.find(s => s.title === '骨架验收 · 中文草稿').draft, '未点击保存的内容，切换前必须保留。');
  });
  await check('无桥浏览器内容明确预览并禁用保存', async () => {
    const popup = application.waitForEvent('window');
    await application.evaluate(({ BrowserWindow }) => {
      const preview = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
      void preview.loadURL('app://desktop/index.html');
    });
    const preview = await popup;
    await preview.getByText('当前为浏览器预览，无法创建或保存本地会话。请启动桌面版使用这些功能。', { exact: true }).waitFor();
    assert.equal(await preview.getByRole('button', { name: '新建本地会话' }).isDisabled(), true);
    assert.equal(await preview.getByRole('button', { name: '选择项目目录' }).isDisabled(), true);
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[1].destroy());
  });
  assert.deepEqual(errors, []);
  await application.close();
  application = undefined;
  await writeFile(path.join(output, 'result.json'), JSON.stringify({ runId, passed: true, checks, pageErrors: errors, limits: ['原生目录与关闭确认对话框为测试替身；未进行人工点选', '无桥预览通过无preload的Chromium窗口验证', '未接入外部服务，未验证安装包或跨版本 Windows'] }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, output }, null, 2));
} catch (error) {
  await writeFile(path.join(output, 'result.json'), JSON.stringify({ runId, passed: false, checks, pageErrors: errors, error: String(error) }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  // 只结束本次启动的测试实例，失败时也不留下受阻的未保存确认框。
  if (application) await application.evaluate(({ app }) => app.exit(0)).catch(() => {});
}
