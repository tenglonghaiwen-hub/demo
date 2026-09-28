export interface LocalSession {
  id: string;
  title: string;
  draft: string;
  projectPath: string | null;
  updatedAt: string;
}

export interface AppState {
  schemaVersion: 1;
  sessions: LocalSession[];
}

// 仅暴露当前骨架需要的能力；后续执行能力必须单独设计审批契约。
export interface DesktopApi {
  getState(): Promise<AppState>;
  chooseProject(): Promise<string | null>;
  createSession(projectPath: string | null): Promise<LocalSession>;
  renameSession(id: string, title: string): Promise<LocalSession>;
  saveDraft(id: string, draft: string): Promise<LocalSession>;
}

export const LIMITS = { title: 80, draft: 20000, sessions: 200 } as const;
