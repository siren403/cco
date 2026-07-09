import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import { DomainError } from "../../core/errors/domain-error.ts";
import { HOST_PROFILE, type Profile } from "../../core/model/profile.ts";
import { getUiText, type AppLocale } from "../../i18n/index.ts";
import { APP_NAME } from "../../meta.ts";
import { buildDoctorPageModel } from "../models/doctor-page.ts";
import { buildProfilesPageModel } from "../models/profiles-page.ts";
import { topicVisible, type ShowcaseTopic } from "../models/showcase-page.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel } from "./components/panel.ts";
import { RootHelpInkScreen } from "./root-help-ink-screen.ts";

const h = React.createElement;

export function ShowcaseInkScreen(props: {
  readonly locale: AppLocale;
  readonly topic: ShowcaseTopic;
}): ReactNode {
  const text = getUiText(props.locale);
  const profilesModel = buildProfilesPageModel(
    demoProfiles,
    new Map<string, boolean>([["work", true], ["backup", false]]),
    "C:\\Users\\you\\.cco\\profiles.json",
    props.locale,
  );
  const doctorModel = buildDoctorPageModel(
    {
      claudeBinary: "C:\\Program Files\\Claude\\claude.exe",
      ccoHome: "C:\\Users\\you\\.cco",
      profiles: 2,
      providerProfiles: 1,
      hostConfigDir: "C:\\Users\\you\\.claude",
      conflicts: [],
      launchMode: text.doctor.launchMode,
      shellSubprocessEnvScrub: undefined,
    },
    props.locale,
  );

  return h(
    Box,
    { flexDirection: "column" },
    h(
      InkPanel,
      {
        title: "Showcase",
        tone: "accent",
        badge: props.topic,
        marginBottom: 1,
      },
      h(Text, null, `${APP_NAME} showcase ${props.topic === "all" ? "" : props.topic}`.trim()),
    ),

    ...(topicVisible(props.topic, "auth")
      ? [
          h(
            InkPanel,
            { key: "auth", title: text.showcase.authSuccess, tone: "ok", marginBottom: 1 },
            ...InkCommandList({
              entries: [
                { command: "cco auth add work", description: text.showcase.flowAddDescription },
                { command: "cco work", description: text.showcase.flowLaunchDescription },
              ],
            }),
          ),
        ]
      : []),

    ...(topicVisible(props.topic, "help")
      ? [h(Box, { key: "help", flexDirection: "column" }, h(RootHelpInkScreen, { locale: props.locale }))]
      : []),

    ...(topicVisible(props.topic, "profiles")
      ? [
          h(
            InkPanel,
            { key: "profiles", title: text.showcase.savedProfiles, tone: "accent", marginBottom: 1 },
            ...profilesModel.rows.map((row) =>
              h(
                Text,
                { key: row.profileId },
                `${row.profileId} [${row.kindBadge.label}] [${row.tokenBadge.label}]${row.envBadge ? ` [${row.envBadge.label}]` : ""}${row.lastUsedAt ? ` ${row.lastUsedPrefix ?? ""} ${row.lastUsedAt}` : ""}`,
              ),
            ),
          ),
        ]
      : []),

    ...(topicVisible(props.topic, "errors")
      ? [
          h(
            InkPanel,
            { key: "errors", title: text.showcase.unknownProfileError, tone: "warn", marginBottom: 1 },
            ...InkKeyValueList({
              entries: [
                {
                  label: "PROFILE_NOT_FOUND",
                  value: new DomainError(
                    "PROFILE_NOT_FOUND",
                    'Unknown profile "missing-profile". Run "cco auth list" to inspect saved profiles.',
                    { profileId: "missing-profile" },
                  ).message,
                  tone: "warn",
                },
                {
                  label: "RESERVED_PROFILE_ID",
                  value: new DomainError(
                    "RESERVED_PROFILE_ID",
                    'Profile id "host" is reserved by cco.',
                    { profileId: "host" },
                  ).message,
                  tone: "warn",
                },
                {
                  label: "ENOENT",
                  value: text.errors.missingBinarySummary,
                  tone: "warn",
                },
              ],
            }),
          ),
        ]
      : []),

    ...(topicVisible(props.topic, "doctor")
      ? [
          h(
            InkPanel,
            { key: "doctor", title: text.showcase.doctorOutput, tone: "ok", marginBottom: 1 },
            ...InkKeyValueList({ entries: doctorModel.snapshotEntries }),
          ),
        ]
      : []),

    ...(topicVisible(props.topic, "flows")
      ? [
          h(
            InkPanel,
            { key: "flows", title: text.showcase.commandFlows, tone: "accent", marginBottom: 1 },
            ...InkCommandList({
              entries: [
                { command: `${APP_NAME} auth add work`, description: text.showcase.flowAddDescription },
                { command: `${APP_NAME} work`, description: text.showcase.flowLaunchDescription },
                { command: `${APP_NAME} work -c`, description: text.showcase.flowContinueDescription },
                { command: `${APP_NAME} host --resume abc123`, description: text.showcase.flowHostDescription },
              ],
            }),
          ),
        ]
      : []),

    ...(topicVisible(props.topic, "ink")
      ? [
          h(
            InkPanel,
            { key: "ink", title: "Ink", tone: "accent" },
            ...InkBulletList({
              items: [
                "Ink showcase",
                "Responsive preview",
                "Ink renderer is now the default showcase surface.",
                "Topics: auth/help/profiles/errors/doctor/flows remain available.",
              ],
            }),
          ),
        ]
      : []),
  );
}

const demoProfiles: readonly Profile[] = [
  HOST_PROFILE,
  {
    id: "work",
    label: "work",
    kind: "overlay",
    tokenRef: "work",
    createdAt: "2026-04-14T00:00:00.000Z",
    updatedAt: "2026-04-14T00:00:00.000Z",
    lastUsedAt: "2026-04-14T13:15:00.000Z",
    env: {
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "1",
    },
  },
  {
    id: "backup",
    label: "backup",
    kind: "overlay",
    tokenRef: "backup",
    createdAt: "2026-04-14T00:00:00.000Z",
    updatedAt: "2026-04-14T00:00:00.000Z",
    env: {
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
    },
  },
];
