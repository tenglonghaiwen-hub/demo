const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { SessionStore, parseState } = require('../dist/main/electron/store.js');

const folder = path.resolve('.local', 'tests', randomUUID());
fs.mkdirSync(folder, { recursive: true });
const makeStore = () => new SessionStore(path.join(folder, `${randomUUID()}.json`));

test('草稿创建、重命名与重载保留 Unicode、项目路径和原始换行', () => {
  const file = path.join(folder, 'roundtrip.json');
  const store = new SessionStore(file);
  assert.deepEqual(store.read().sessions, []);
  const created = store.create('D:\\中文项目');
  store.update(created.id, 'title', '  第一个任务  ');
  store.update(created.id, 'draft', '你好\n第二行🙂');
  const restored = new SessionStore(file).read().sessions[0];
  assert.equal(restored.title, '第一个任务');
  assert.equal(restored.draft, '你好\n第二行🙂');
  assert.equal(restored.projectPath, 'D:\\中文项目');
});

test('拒绝无效输入与未知会话，现有数据保持不变', () => {
  const store = makeStore();
  const created = store.create(null);
  const original = store.read();
  for (const [field, value] of [['title', ' '], ['title', '字'.repeat(81)], ['draft', 'a'.repeat(20001)], ['draft', null]]) {
    assert.throws(() => store.update(created.id, field, value));
  }
  assert.throws(() => store.update('missing', 'draft', 'text'));
  assert.deepEqual(store.read(), original);
});

test('损坏文件与未知 schema 不被初始化或覆盖', () => {
  const file = path.join(folder, 'corrupt.json');
  const raw = '{broken';
  fs.writeFileSync(file, raw);
  const store = new SessionStore(file);
  assert.throws(() => store.read());
  assert.throws(() => store.create(null));
  assert.equal(fs.readFileSync(file, 'utf8'), raw);
  assert.throws(() => parseState('{"schemaVersion":2,"sessions":[]}'));
});

test('重复 ID 与结构错误拒绝加载', () => {
  const store = makeStore();
  const s = store.create(null);
  assert.throws(() => parseState(JSON.stringify({ schemaVersion: 1, sessions: [s, s] })));
  assert.throws(() => parseState(JSON.stringify({ schemaVersion: 1, sessions: [{ ...s, draft: 42 }] })));
});

test('磁盘写入失败时不能报告保存成功', () => {
  const blocked = path.join(folder, 'not-a-directory');
  fs.writeFileSync(blocked, '保留');
  const store = new SessionStore(path.join(blocked, 'sessions.json'));
  assert.throws(() => store.create(null));
  assert.equal(fs.readFileSync(blocked, 'utf8'), '保留');
});

test('200会话上限拒绝创建，完整保留已有会话', () => {
  const file = path.join(folder, 'limit.json');
  const state = { schemaVersion: 1, sessions: Array.from({ length: 200 }, (_, i) => ({
    id: randomUUID(), title: `任务 ${i}`, draft: '', projectPath: null, updatedAt: new Date().toISOString(),
  })) };
  fs.writeFileSync(file, JSON.stringify(state));
  const store = new SessionStore(file);
  assert.throws(() => store.create(null), /200/);
  assert.deepEqual(store.read(), state);
});
