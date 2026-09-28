import { copy } from "../../i18n/zh-CN";
import { useEffect, useState } from "react";
import { LIMITS, type LocalSession } from "../../../shared/contracts";

const api = window.desktop;
export function useConversation() {
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

  const disabled = !api || !ready || pending;

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.fallbackError);
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
      setNotice(copy.sessionCreated);
    });
  }
  function save() {
    if (!active || !api || disabled) return;
    void run(async () => {
      update(await api.saveDraft(active.id, draft));
      setNotice(copy.draftSaved);
    });
  }
  function rename() {
    if (!active || !api || !title.trim() || disabled) return;
    void run(async () => {
      update(await api.renameSession(active.id, title.trim()));
      setRenaming(false);
      setNotice(copy.titleUpdated);
    });
  }

  function chooseProject() {
    if (!api || disabled) return;
    void run(async () => {
      const chosen = await api.chooseProject();
      if (chosen) {
        setProject(chosen);
        setNotice(copy.projectChosen);
      } else setNotice(copy.projectCancelled);
    });
  }
  return {
    api,
    sessions,
    active,
    moduleId,
    setModuleId,
    draft,
    setDraft,
    project,
    pending,
    ready,
    error,
    notice,
    renaming,
    setRenaming,
    title,
    setTitle,
    dirty,
    disabled,
    load,
    selectSession,
    createSession,
    save,
    rename,
    chooseProject,
  };
}
