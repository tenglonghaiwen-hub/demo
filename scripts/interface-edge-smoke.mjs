import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(root, 'outputs', `interface-edge-${runId}`);
await mkdir(output, { recursive: true });
const env = { ...process.env, UI001_DATA_DIR: path.join(root, '.local', `qa-edge-${runId}`) };
delete env.ELECTRON_RUN_AS_NODE;
let application;
const checks = [];
async function check(name, action) { await action(); checks.push(name); }
try {
  application = await electron.launch({ args: [root], cwd: root, env });
  const page = await application.firstWindow();
  page.on('dialog', () => {});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: '新建本地会话' }).waitFor();
  await application.evaluate(({ dialog }, project) => {
    // 只替代原生目录选择结果；没有读取或创建这个长路径。
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [project] });
  }, 'D:\\界面验收用路径\\' + '很长的中文目录名称'.repeat(12));
  await page.getByRole('button', { name: '选择项目目录' }).click();
  await page.getByRole('button', { name: '新建本地会话' }).click();
  await check('长会话名称、路径及Ctrl+S真实保存', async () => {
    await page.getByRole('button', { name: '重命名', exact: true }).click();
    await page.getByLabel('会话名称').fill('长标题验收'.repeat(16));
    await page.getByRole('button', { name: '确认名称' }).click();
    await page.getByLabel('任务草稿', { exact: true }).fill('长名称与路径回归：保留内容，按 Ctrl+S 保存。');
    await page.keyboard.press('Control+s');
    await page.getByText('草稿已保存到本机。', { exact: true }).waitFor();
    const state = await page.evaluate(() => window.desktop.getState());
    assert.equal(state.sessions[0].title.length, 80);
    assert.match(state.sessions[0].draft, /Ctrl\+S/);
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(960, 640));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(output, 'long-content.png'), fullPage: true });
  });
  await check('窄屏侧栏与辅助面互斥状态、Esc焦点回归', async () => {
    await page.getByRole('button', { name: '打开辅助面板', exact: true }).click();
    const expand = page.getByRole('button', { name: '展开会话侧栏', exact: true });
    assert.equal(await expand.getAttribute('aria-expanded'), 'false');
    await expand.click();
    assert.equal(await page.getByRole('complementary', { name: '会话侧栏' }).isVisible(), true);
    assert.equal(await page.getByRole('complementary', { name: '辅助面板' }).count(), 0);
    await page.getByRole('button', { name: '打开辅助面板', exact: true }).click();
    await page.getByRole('tab', { name: '终端', exact: true }).focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: '打开辅助面板', exact: true }).evaluate(el => el === document.activeElement), true);
  });
  await check('窄屏设置标签方向与键盘语义一致', async () => {
    await page.getByRole('button', { name: '设置', exact: true }).click();
    const tabs = page.getByRole('tablist', { name: '设置分组' });
    assert.equal(await tabs.getAttribute('aria-orientation'), 'horizontal');
    await page.getByRole('tab', { name: '外观', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.activeElement?.textContent === '模型中转' && document.activeElement?.getAttribute('data-state') === 'active');
    assert.equal(await page.getByRole('tab', { name: '模型中转', exact: true }).getAttribute('data-state'), 'active');
  });
  assert.deepEqual(errors, []);
  await writeFile(path.join(output, 'result.json'), JSON.stringify({ passed: true, checks, errors, limits: ['长目录为dialog返回值替身，未读取或创建该目录'] }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, output }, null, 2));
} catch (error) {
  await writeFile(path.join(output, 'result.json'), JSON.stringify({ passed: false, checks, error: String(error) }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  if (application) await application.evaluate(({ app }) => app.exit(0)).catch(() => {});
}
