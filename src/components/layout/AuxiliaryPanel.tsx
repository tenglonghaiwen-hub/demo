import { copy } from "../../i18n/zh-CN";
import { Tabs } from "radix-ui";
import {
  Cross2Icon,
  CodeIcon,
  FileTextIcon,
  VideoIcon,
} from "@radix-ui/react-icons";
import { IconButton } from "../ui/IconButton";
const panels = [
  {
    id: "terminal",
    name: copy.terminal,
    icon: CodeIcon,
    title: copy.terminalEmpty,
    description: copy.terminalHint,
  },
  {
    id: "diff",
    name: copy.diff,
    icon: FileTextIcon,
    title: copy.diffEmpty,
    description: copy.diffHint,
  },
  {
    id: "video",
    name: copy.video,
    icon: VideoIcon,
    title: copy.videoPanel,
    description: copy.videoHint,
  },
];
export function AuxiliaryPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside
      className="auxiliary-panel"
      aria-label={copy.auxiliaryLabel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <Tabs.Root defaultValue="terminal">
        <div className="auxiliary-heading">
          <Tabs.List className="panel-tabs" aria-label={copy.auxiliaryTools}>
            {panels.map((p) => (
              <Tabs.Trigger key={p.id} value={p.id}>
                {p.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <IconButton label={copy.closeAuxiliary} onClick={onClose}>
            <Cross2Icon />
          </IconButton>
        </div>
        {panels.map((p) => (
          <Tabs.Content key={p.id} value={p.id} className="panel-content">
            <p.icon width={24} height={24} />
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <span className="badge">{copy.notConnected}</span>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </aside>
  );
}
