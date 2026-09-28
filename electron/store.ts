import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { LIMITS, type AppState, type LocalSession } from '../shared/contracts';

function isSession(value: unknown): value is LocalSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as LocalSession;
  return typeof s.id === 'string' && /^[0-9a-f-]{36}$/.test(s.id)
    && typeof s.title === 'string' && s.title.trim().length > 0 && s.title.length <= LIMITS.title
    && typeof s.draft === 'string' && s.draft.length <= LIMITS.draft
    && (s.projectPath === null || typeof s.projectPath === 'string' && s.projectPath.length <= 32767)
    && typeof s.updatedAt === 'string' && Number.isFinite(Date.parse(s.updatedAt));
}

export function parseState(raw: string): AppState {
  const value = JSON.parse(raw) as AppState;
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.sessions)
    || value.sessions.length > LIMITS.sessions || !value.sessions.every(isSession)
    || new Set(value.sessions.map(s => s.id)).size !== value.sessions.length) {
    throw new Error('本地会话格式不受支持；原文件已保留，请先备份后检查。');
  }
  return value;
}

export class SessionStore {
  constructor(private readonly file: string) {}

  read(): AppState {
    if (!existsSync(this.file)) return { schemaVersion: 1, sessions: [] };
    try { return parseState(readFileSync(this.file, 'utf8')); }
    catch { throw new Error('无法读取本地会话，未覆盖原数据。请检查 .local 中的文件及访问权限。'); }
  }

  private persist(state: AppState): void {
    mkdirSync(dirname(this.file), { recursive: true });
    // 先完整写入同目录临时文件再替换，写入失败时保留原文件。
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, JSON.stringify(state, null, 2), { encoding: 'utf8', flag: 'wx', flush: true });
      renameSync(temporary, this.file);
    } catch { throw new Error('本地保存失败，原数据及可能的临时文件已保留。请检查磁盘空间和权限。'); }
  }

  create(projectPath: string | null): LocalSession {
    const state = this.read();
    if (state.sessions.length >= LIMITS.sessions) throw new Error('已达到 200 个本地草稿上限。');
    const session: LocalSession = {
      id: randomUUID(), title: `新会话 ${state.sessions.length + 1}`, draft: '',
      projectPath, updatedAt: new Date().toISOString(),
    };
    state.sessions.unshift(session);
    this.persist(state);
    return session;
  }

  update(id: unknown, field: 'title' | 'draft', value: unknown): LocalSession {
    if (typeof id !== 'string' || typeof value !== 'string') throw new Error('会话参数无效。');
    const normalized = field === 'title' ? value.trim() : value;
    if (normalized.length > LIMITS[field] || field === 'title' && normalized.length === 0) {
      throw new Error(field === 'title' ? '会话名称须为 1–80 字符。' : '草稿不能超过 20000 字符。');
    }
    const state = this.read();
    const session = state.sessions.find(s => s.id === id);
    if (!session) throw new Error('找不到该会话，请重新加载。');
    session[field] = normalized;
    session.updatedAt = new Date().toISOString();
    this.persist(state);
    return session;
  }
}
