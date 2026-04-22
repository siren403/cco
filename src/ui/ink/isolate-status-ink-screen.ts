import React, { type ReactNode } from "react";
import { Box } from "ink";
import type { AppLocale } from "../../i18n/index.ts";
import { getUiText } from "../../i18n/index.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";

const h = React.createElement;

type Health = "ready" | "missing" | "broken";

export function IsolateStatusInkScreen(props: {
  readonly profileId: string;
  readonly health: Health;
  readonly homeDir: string;
  readonly manifestFile: string;
  readonly homeExists: boolean;
  readonly manifestExists: boolean;
  readonly metadataExists: boolean;
  readonly metadataState?: string;
  readonly seedMode?: string;
  readonly sourceConfigDir: string;
  readonly continuitySessionId?: string;
  readonly continuityProjectKey?: string;
  readonly continuityImportedAt?: string;
  readonly locale: AppLocale;
}): ReactNode {
  const text = getUiText(props.locale);

  const healthTone = props.health === "ready" ? "ok" : props.health === "missing" ? "dim" : "warn";
  const healthLabel = props.health === "ready"
    ? text.misc.isolateStatusReadyBadge
    : props.health === "missing"
      ? text.misc.isolateStatusMissingBadge
      : text.misc.isolateStatusBrokenBadge;

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: text.misc.isolateStatusTitle,
        tone: healthTone,
        badge: props.profileId,
      },
      ...InkKeyValueList({
        entries: [
          { label: "status", value: healthLabel, tone: healthTone },
          { label: "home-dir", value: props.homeDir },
          { label: "manifest", value: props.manifestFile },
          {
            label: "home-present",
            value: props.homeExists ? text.profiles.storedBadge : text.profiles.missingBadge,
            tone: props.homeExists ? "ok" : "warn",
          },
          {
            label: "manifest-present",
            value: props.manifestExists ? text.profiles.storedBadge : text.profiles.missingBadge,
            tone: props.manifestExists ? "ok" : "warn",
          },
          {
            label: "metadata",
            value: props.metadataExists
              ? props.metadataState ?? text.profiles.storedBadge
              : text.profiles.missingBadge,
            tone: props.metadataExists ? "ok" : "warn",
          },
          {
            label: "seed-mode",
            value: props.seedMode ?? text.profiles.missingBadge,
          },
          {
            label: "source-config",
            value: props.sourceConfigDir,
          },
          {
            label: "continuity-session",
            value: props.continuitySessionId ?? text.profiles.missingBadge,
            tone: props.continuitySessionId ? "ok" : "dim",
          },
          {
            label: "continuity-project",
            value: props.continuityProjectKey ?? text.profiles.missingBadge,
            tone: props.continuityProjectKey ? "ok" : "dim",
          },
          {
            label: "continuity-imported-at",
            value: props.continuityImportedAt ?? text.profiles.missingBadge,
            tone: props.continuityImportedAt ? "ok" : "dim",
          },
        ],
      }),
    ),
  );
}
