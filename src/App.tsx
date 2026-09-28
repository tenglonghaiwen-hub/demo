import { useEffect, useState } from "react";
import { LIMITS, type LocalSession } from "../shared/contracts";
import { modules } from "./modules";

const api = window.desktop;
export default function App() {
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string>("code");
  const [draft, setDraft] = useState("");
  const [project, setProject] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const active = sessions.find((item) => item.id === activeId);
  const dirty = !!active && draft !== active.draft;
  const module = modules.find((item) => item.id === moduleId)!;
  const disabled = !api || !ready || pending;

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败，请重试。");
    } finally {
      setPending(false);
    }
  }
  async function load() {
    if (!api) return;
    await run(async () => {
      const state = await api.getState();
      setSessions(state.sessions);
      setActiveId(state.sessions[0]?.id ?? null);
      setDraft(state.sessions[0]?.draft ?? "");
      setReady(true);
    });
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    // 关闭与刷新也必须保护未保存的内容；桌面壳负责提供原生确认。
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty || pending) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, pending]);
  function update(session: LocalSession) {
    setSessions((items) =>
      items.map((item) => (item.id === session.id ? session : item)),
    );
  }
  async function protectDraft() {
    // 切换前直接保存，保存失败即停止切换，避免以确认框默许内容丢失。
    if (dirty && active && api) update(await api.saveDraft(active.id, draft));
  }
  function selectSession(session: LocalSession) {
    if (disabled || session.id === activeId) return;
    void run(async () => {
      await protectDraft();
      setActiveId(session.id);
      setDraft(session.draft);
      setRenaming(false);
      setModuleId("code");
    });
  }
  function createSession() {
    if (!api || disabled) return;
    void run(async () => {
      await protectDraft();
      const session = await api.createSession(project);
      setSessions((items) => [session, ...items]);
      setActiveId(session.id);
      setDraft(session.draft);
      setRenaming(false);
      setModuleId("code");
      setNotice("本地会话已创建。");
    });
  }
  function save() {
    if (!active || !api || disabled) return;
    void run(async () => {
      update(await api.saveDraft(active.id, draft));
      setNotice("草稿已保存到本机。");
    });
  }
  function rename() {
    if (!active || !api || !title.trim() || disabled) return;
    void run(async () => {
      update(await api.renameSession(active.id, title.trim()));
      setRenaming(false);
      setNotice("会话名称已更新。");
    });
  }

  return (
    <div className="app-shell" aria-busy={pending}>
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <div>
            <strong>AI 桌面助手</strong>
            <span>本地工作空间</span>
          </div>
        </div>
        <button
          className="new-session"
          onClick={createSession}
          disabled={disabled || sessions.length >= LIMITS.sessions}
        >
          新建本地会话 <span aria-hidden="true">＋</span>
        </button>
        <nav aria-label="功能模块">
          {modules.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${moduleId === item.id ? "selected" : ""}`}
              aria-current={moduleId === item.id ? "page" : undefined}
              onClick={() => setModuleId(item.id)}
            >
              <span>{item.name}</span>
              <span className="nav-dot" aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="session-heading">
          <h2>本地会话</h2>
          <span>{sessions.length}</span>
        </div>
        <div className="session-list">
          {sessions.length ? (
            sessions.map((session) => (
              <button
                key={session.id}
                disabled={disabled}
                className={`session-item ${activeId === session.id ? "active" : ""}`}
                aria-pressed={activeId === session.id}
                onClick={() => selectSession(session)}
                title={session.title}
              >
                <span>{session.title}</span>
                <small>
                  {session.projectPath ? "项目会话" : "无项目"}
                  {activeId === session.id && dirty ? " · 未保存" : ""}
                </small>
              </button>
            ))
          ) : (
            <p className="muted empty-list">
              {pending ? "正在读取会话…" : "暂无本地会话"}
            </p>
          )}
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          候选骨架 <span>UI-001</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>{module.name}</span>
          <span className="badge">{api ? "桌面本地模式" : "浏览器预览"}</span>
        </header>
        {!api && (
          <div className="banner">
            当前为浏览器预览，无法创建或保存本地会话。请启动桌面版使用这些功能。
          </div>
        )}
        {error && (
          <div className="error" role="alert">
            <span>操作未完成：{error}</span>
            {!ready && api && (
              <button disabled={pending} onClick={() => void load()}>
                重试读取
              </button>
            )}
          </div>
        )}
        <div className="feedback" role="status" aria-live="polite">
          {pending ? "正在处理，请稍候…" : notice}
        </div>
        <main id="main-content">
          <div className="page-heading">
            <h1>
              {moduleId === "code" ? "今天，从一个任务开始" : module.name}
            </h1>
            <p>{module.description}</p>
          </div>
          {moduleId === "code" ? (
            <>
              <section className="editor" aria-labelledby="draft-heading">
                <div className="editor-heading">
                  <div>
                    <h2 id="draft-heading">{active?.title ?? "任务草稿"}</h2>
                    <p>
                      {active
                        ? "仅保存在本机，不会发送给模型"
                        : "新建本地会话，整理目标和执行约束"}
                    </p>
                  </div>
                  {active && (
                    <button
                      className="text-button"
                      disabled={disabled}
                      onClick={() => {
                        setTitle(active.title);
                        setRenaming(true);
                      }}
                    >
                      重命名
                    </button>
                  )}
                </div>
                {renaming && (
                  <form
                    className="rename-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      rename();
                    }}
                  >
                    <label htmlFor="session-title">会话名称</label>
                    <input
                      autoFocus
                      id="session-title"
                      maxLength={LIMITS.title}
                      value={title}
                      disabled={pending}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                    <button type="submit" disabled={disabled || !title.trim()}>
                      确认名称
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setRenaming(false)}
                    >
                      取消
                    </button>
                  </form>
                )}
                <label className="sr-only" htmlFor="draft">
                  任务草稿
                </label>
                <textarea
                  id="draft"
                  placeholder={
                    active
                      ? "描述你想完成的任务、涉及的文件，以及需要遵守的约束…"
                      : "点击左侧「新建本地会话」开始。"
                  }
                  value={draft}
                  maxLength={LIMITS.draft}
                  disabled={disabled || !active}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                      event.preventDefault();
                      save();
                    }
                  }}
                />
                <div className="editor-footer">
                  <span className={dirty ? "dirty" : "muted"}>
                    {active
                      ? dirty
                        ? "有未保存的修改"
                        : "已保存"
                      : "尚未创建会话"}{" "}
                    <span className="count">
                      {draft.length.toLocaleString()} / 20,000
                    </span>
                  </span>
                  <button
                    className="primary"
                    disabled={disabled || !active || !dirty}
                    onClick={save}
                  >
                    保存草稿
                  </button>
                </div>
              </section>
              <p className="save-note">
                Ctrl + S 保存 · 切换或新建会话前自动保存当前草稿
              </p>
              <section className="capabilities">
                <h2>执行能力</h2>
                <p>接入后可在这里发起任务、检查结果并审批操作。</p>
                <div className="capability-row">
                  <span>Codex 编程</span>
                  <span>终端</span>
                  <span>代码差异</span>
                  <span>操作审批</span>
                  <strong>均未接入</strong>
                </div>
              </section>
            </>
          ) : (
            <section className="module-detail">
              <div className="module-status">
                <h2>此模块尚未接入</h2>
                <span className="badge">规划中</span>
              </div>
              <p>{module.next}</p>
              <h3>预留能力范围</h3>
              <ul>
                {module.scope.map((item) => (
                  <li key={item}>
                    {item}
                    <span>未接入</span>
                  </li>
                ))}
              </ul>
              <div className="boundary-note">
                当前仅提供模块入口和边界说明，没有后台连接或任务执行。
              </div>
            </section>
          )}
        </main>
        <footer className="workspace-footer">
          所有外部服务均未接入 <span>技术栈与界面基线待确认</span>
        </footer>
      </div>
      <aside className="context-panel" aria-label="项目上下文">
        <h2>上下文</h2>
        <section>
          <h3>新会话项目</h3>
          <p className="path">{project ?? "尚未选择项目目录"}</p>
          <button
            className="outline"
            disabled={disabled}
            onClick={() => {
              if (api)
                void run(async () => {
                  const chosen = await api.chooseProject();
                  if (chosen) {
                    setProject(chosen);
                    setNotice("已选择目录，将用于下一次新建会话。");
                  } else setNotice("已取消选择，原目录保持不变。");
                });
            }}
          >
            选择项目目录
          </button>
          <p className="hint">
            仅记录目录路径，不读取或修改项目文件。选择结果用于下一次新建会话。
          </p>
        </section>
        <section>
          <h3>当前会话项目</h3>
          <p className="path">{active?.projectPath ?? "未关联项目"}</p>
          {active && (
            <p className="hint">
              更新于 {new Date(active.updatedAt).toLocaleString("zh-CN")}
            </p>
          )}
        </section>
        <section>
          <h3>连接状态</h3>
          <dl>
            {["模型中转", "Codex", "电脑控制", "视频供应商", "MCP"].map(
              (name) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>未接入</dd>
                </div>
              ),
            )}
          </dl>
        </section>
        <div className="context-bottom">
          <h3>先明确，再执行</h3>
          <p>删除、付款、注册、发送消息与账号权限变更，均需执行前确认。</p>
        </div>
      </aside>
    </div>
  );
}
