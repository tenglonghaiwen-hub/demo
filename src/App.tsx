import { useEffect, useRef, useState } from "react";
import {
  ChatBubbleIcon,
  DesktopIcon,
  VideoIcon,
  GearIcon,
  PlusIcon,
  ArchiveIcon,
  PinLeftIcon,
  PinRightIcon,
  Component1Icon,
} from "@radix-ui/react-icons";
import { LIMITS } from "../shared/contracts";
import { modules } from "./modules";
import { copy } from "./i18n/zh-CN";
import { IconButton } from "./components/ui/IconButton";
import { AuxiliaryPanel } from "./components/layout/AuxiliaryPanel";
import { ConversationView } from "./features/conversation/ConversationView";
import { useConversation } from "./features/conversation/useConversation";
import { SettingsView } from "./features/settings/SettingsView";
import { usePreferences } from "./features/settings/usePreferences";

export default function App() {
  const c = useConversation();
  const appearance = usePreferences();
  const [sidebar, setSidebar] = useState(true);
  const [auxiliary, setAuxiliary] = useState(false);
  const [narrow, setNarrow] = useState(
    () => matchMedia("(max-width: 980px)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(max-width: 980px)");
    const update = () => setNarrow(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const sidebarVisible = sidebar && !(narrow && auxiliary);
  const auxiliaryTrigger = useRef<HTMLButtonElement>(null);
  const module = modules.find((m) => m.id === c.moduleId);
  const navigation = [
    { id: "code", name: copy.workbench, icon: ChatBubbleIcon },
    { id: "computer", name: copy.computer, icon: DesktopIcon },
    { id: "video", name: copy.videoMaterials, icon: VideoIcon },
  ];
  return (
    <div className="app-shell" aria-busy={c.pending}>
      <nav className="activity-bar glass" aria-label={copy.navigationLabel}>
        <div className="brand-mark" title={copy.brand}>
          <Component1Icon width={23} height={23} />
        </div>
        {navigation.map((n) => (
          <IconButton
            key={n.id}
            label={n.name}
            aria-current={c.moduleId === n.id ? "page" : undefined}
            onClick={() => c.setModuleId(n.id)}
          >
            <n.icon width={20} height={20} />
          </IconButton>
        ))}
        <IconButton
          label={copy.settings}
          className="settings-button"
          aria-current={c.moduleId === "settings" ? "page" : undefined}
          onClick={() => c.setModuleId("settings")}
        >
          <GearIcon width={20} height={20} />
        </IconButton>
      </nav>
      {sidebarVisible && (
        <aside className="sidebar glass" aria-label={copy.sidebarLabel}>
          <div className="brand">
            <strong>{copy.brand}</strong>
            <span>{copy.temporaryName}</span>
          </div>
          <button
            className="new-session"
            onClick={c.createSession}
            disabled={c.disabled || c.sessions.length >= LIMITS.sessions}
          >
            <PlusIcon />
            {copy.newSession}
          </button>
          <div className="project-picker">
            <button
              className="text-button"
              disabled={c.disabled}
              onClick={c.chooseProject}
            >
              <ArchiveIcon />
              {copy.chooseProject}
            </button>
            <p className="path" title={c.project ?? undefined}>
              {c.project ?? copy.noProject}
            </p>
            <p className="hint">{copy.projectHint}</p>
          </div>
          <div className="session-heading">
            <h2>{copy.sessions}</h2>
            <span>{c.sessions.length}</span>
          </div>
          <div className="session-list">
            {c.sessions.length ? (
              c.sessions.map((s) => (
                <button
                  key={s.id}
                  disabled={c.disabled}
                  className={`session-item ${c.active?.id === s.id ? "active" : ""}`}
                  aria-pressed={c.active?.id === s.id}
                  onClick={() => c.selectSession(s)}
                  title={s.title}
                >
                  <span>{s.title}</span>
                  <small>
                    {s.projectPath
                      ? copy.projectSession
                      : copy.noProjectSession}
                    {c.active?.id === s.id && c.dirty ? copy.unsavedSuffix : ""}
                  </small>
                </button>
              ))
            ) : (
              <p className="muted empty-list">
                {c.pending ? copy.loadingSessions : copy.emptySessions}
              </p>
            )}
          </div>
          <div className="sidebar-footer">
            {copy.localDrafts}
            <span>UI-001</span>
          </div>
        </aside>
      )}
      <div className="workspace">
        <header className="topbar glass">
          <IconButton
            label={sidebarVisible ? copy.collapseSidebar : copy.expandSidebar}
            aria-expanded={sidebarVisible}
            onClick={() => {
              if (!sidebarVisible && narrow) setAuxiliary(false);
              setSidebar(!sidebarVisible);
            }}
          >
            <PinLeftIcon />
          </IconButton>
          <span className="workspace-title">
            {c.moduleId === "settings" ? copy.settings : module?.name}
          </span>
          <span className="mode-label">
            {c.api ? copy.desktopMode : copy.browserMode}
          </span>
          <button
            ref={auxiliaryTrigger}
            className="icon-button"
            aria-label={auxiliary ? copy.closeAuxiliary : copy.openAuxiliary}
            title={auxiliary ? copy.closeAuxiliary : copy.openAuxiliary}
            aria-expanded={auxiliary}
            onClick={() => setAuxiliary(!auxiliary)}
          >
            <PinRightIcon />
          </button>
        </header>
        {!c.api && <div className="banner">{copy.preview}</div>}
        {c.error && (
          <div className="error" role="alert">
            <span>
              {copy.operationFailed}
              {c.error}
            </span>
            {!c.ready && c.api && (
              <button disabled={c.pending} onClick={() => void c.load()}>
                {copy.retryRead}
              </button>
            )}
          </div>
        )}
        <div className="feedback" role="status" aria-live="polite">
          {c.pending ? copy.processing : c.notice}
        </div>
        <main id="main-content">
          {c.moduleId === "code" ? (
            <ConversationView conversation={c} />
          ) : c.moduleId === "settings" ? (
            <SettingsView
              preferences={appearance.preferences}
              error={appearance.preferenceError}
              onChange={appearance.changePreferences}
            />
          ) : (
            module && (
              <section className="module-detail">
                <h1>{module.name}</h1>
                <p>{module.description}</p>
                <h2>{copy.noIntegration}</h2>
                <p>{module.next}</p>
                <ul className="scope-list">
                  {module.scope.map((s) => (
                    <li key={s}>
                      {s}
                      <span>{copy.notConnected}</span>
                    </li>
                  ))}
                </ul>
                <p className="hint">{copy.noExecution}</p>
              </section>
            )
          )}
        </main>
        <footer className="workspace-footer">
          {copy.externalNotConnected}
          <span>{copy.baselinePending}</span>
        </footer>
      </div>
      {auxiliary && (
        <AuxiliaryPanel
          onClose={() => {
            setAuxiliary(false);
            auxiliaryTrigger.current?.focus();
          }}
        />
      )}
    </div>
  );
}
