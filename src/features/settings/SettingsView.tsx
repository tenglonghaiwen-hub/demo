import { RadioGroup, Switch, Tabs } from "radix-ui";
import { useEffect, useState } from "react";
import { copy } from "../../i18n/zh-CN";
import { modules } from "../../modules";
import type { Preferences } from "./usePreferences";

type Props = {
  preferences: Preferences;
  error: string;
  onChange: (patch: Partial<Preferences>) => void;
};
export function SettingsView({ preferences, error, onChange }: Props) {
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 1150px)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(max-width: 1150px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <section className="settings-view" aria-label={copy.settings}>
      <h1>{copy.settings}</h1>
      <p className="muted">{copy.settingsIntro}</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <Tabs.Root
        defaultValue="appearance"
        className="settings-tabs"
        orientation={compact ? "horizontal" : "vertical"}
      >
        <Tabs.List className="settings-nav" aria-label={copy.settingsGroups}>
          <Tabs.Trigger value="appearance">{copy.appearance}</Tabs.Trigger>
          {modules
            .filter((m) => ["models", "mcp", "extensions"].includes(m.id))
            .map((m) => (
              <Tabs.Trigger key={m.id} value={m.id}>
                {m.name}
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <Tabs.Content value="appearance" className="settings-content">
          <h2>{copy.appearance}</h2>
          <div className="setting-row">
            <div>
              <h3 id="theme-label">{copy.theme}</h3>
              <p>{copy.themeHint}</p>
            </div>
            <RadioGroup.Root
              className="segmented"
              aria-labelledby="theme-label"
              value={preferences.theme}
              onValueChange={(theme) =>
                onChange({ theme: theme as Preferences["theme"] })
              }
            >
              {(
                [
                  ["system", copy.systemTheme],
                  ["light", copy.lightTheme],
                  ["dark", copy.darkTheme],
                ] as const
              ).map(([value, name]) => (
                <RadioGroup.Item value={value} key={value}>
                  {name}
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
          </div>
          <div className="setting-row">
            <div>
              <h3 id="transparency-label">{copy.transparency}</h3>
              <p>{copy.transparencyHint}</p>
            </div>
            <Switch.Root
              className="switch"
              aria-labelledby="transparency-label"
              checked={preferences.reduceTransparency}
              onCheckedChange={(reduceTransparency) =>
                onChange({ reduceTransparency })
              }
            >
              <Switch.Thumb />
            </Switch.Root>
          </div>
          <div className="setting-row">
            <div>
              <h3 id="motion-label">{copy.motion}</h3>
              <p>{copy.motionHint}</p>
            </div>
            <Switch.Root
              className="switch"
              aria-labelledby="motion-label"
              checked={preferences.reduceMotion}
              onCheckedChange={(reduceMotion) => onChange({ reduceMotion })}
            >
              <Switch.Thumb />
            </Switch.Root>
          </div>
          <p className="hint settings-note">{copy.preferenceHint}</p>
        </Tabs.Content>
        {modules
          .filter((m) => ["models", "mcp", "extensions"].includes(m.id))
          .map((m) => (
            <Tabs.Content key={m.id} value={m.id} className="settings-content">
              <h2>{m.name}</h2>
              <p className="module-description">{m.next}</p>
              <ul className="scope-list">
                {m.scope.map((s) => (
                  <li key={s}>
                    {s}
                    <span>{copy.notConnected}</span>
                  </li>
                ))}
              </ul>
            </Tabs.Content>
          ))}
      </Tabs.Root>
    </section>
  );
}
