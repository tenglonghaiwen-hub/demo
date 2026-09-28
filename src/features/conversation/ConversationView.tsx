import { Pencil1Icon } from "@radix-ui/react-icons";
import { LIMITS } from "../../../shared/contracts";
import { copy } from "../../i18n/zh-CN";
import type { useConversation } from "./useConversation";
type Props = { conversation: ReturnType<typeof useConversation> };
export function ConversationView({ conversation: c }: Props) {
  return (
    <div className="conversation-view">
      <div className="conversation-intro">
        <h1>{copy.start}</h1>
        <p>{copy.startHint}</p>
        <p className="connection-note">
          {copy.disconnected}
          {copy.availableDrafts}
        </p>
      </div>
      <section className="composer" aria-labelledby="draft-heading">
        <div className="editor-heading">
          <div>
            <h2 id="draft-heading">{c.active?.title ?? copy.taskDraft}</h2>
            <p>{copy.draftHint}</p>
          </div>
          {c.active && (
            <button
              className="text-button"
              disabled={c.disabled}
              onClick={() => {
                c.setTitle(c.active!.title);
                c.setRenaming(true);
              }}
            >
              <Pencil1Icon />
              {copy.rename}
            </button>
          )}
        </div>
        {c.renaming && (
          <form
            className="rename-form"
            onSubmit={(e) => {
              e.preventDefault();
              c.rename();
            }}
          >
            <label htmlFor="session-title">{copy.sessionTitle}</label>
            <input
              autoFocus
              id="session-title"
              maxLength={LIMITS.title}
              value={c.title}
              disabled={c.pending}
              onChange={(e) => c.setTitle(e.target.value)}
            />
            <button type="submit" disabled={c.disabled || !c.title.trim()}>
              {copy.confirmTitle}
            </button>
            <button
              type="button"
              disabled={c.pending}
              onClick={() => c.setRenaming(false)}
            >
              {copy.cancel}
            </button>
          </form>
        )}
        <label className="sr-only" htmlFor="draft">
          {copy.taskDraft}
        </label>
        <textarea
          id="draft"
          placeholder={
            c.active ? copy.draftPlaceholder : copy.noSessionPlaceholder
          }
          value={c.draft}
          maxLength={LIMITS.draft}
          disabled={c.disabled || !c.active}
          onChange={(e) => c.setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
              e.preventDefault();
              c.save();
            }
          }}
        />
        <div className="editor-footer">
          <span className={c.dirty ? "dirty" : "muted"}>
            {c.active ? (c.dirty ? copy.dirty : copy.saved) : copy.noSession}
            <span className="count">
              {c.draft.length.toLocaleString()} / 20,000
            </span>
          </span>
          <button
            className="primary"
            disabled={c.disabled || !c.active || !c.dirty}
            onClick={c.save}
          >
            {copy.saveDraft}
          </button>
        </div>
      </section>
      <p className="save-note">{copy.saveNote}</p>
      <div className="current-project">
        <span>{copy.currentProject}</span>
        <span className="path">{c.active?.projectPath ?? copy.unlinked}</span>
      </div>
    </div>
  );
}
