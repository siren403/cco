import { DomainError } from "../../core/errors/domain-error.ts";
import { HOST_PROFILE, type Profile } from "../../core/model/profile.ts";
import { getUiText } from "../../i18n/index.ts";
import { APP_NAME } from "../../meta.ts";
import { createTheme, type RenderOptions } from "../theme.ts";
import { renderCliError } from "./error-message.ts";
import { renderRootHelp } from "./root-help.ts";
import { renderPanel, renderCommandList } from "../layout/primitives.ts";
import {
  renderAuthAddIntro,
  renderAuthAddSuccess,
} from "../views/auth-add-page.ts";
import { renderDoctorPage } from "../views/doctor-page.ts";
import { renderProfilesPage } from "../views/profiles-page.ts";

export type ShowcaseTopic =
  | "all"
  | "auth"
  | "help"
  | "profiles"
  | "errors"
  | "doctor"
  | "flows";

export function renderShowcase(
  topic: ShowcaseTopic = "all",
  options: RenderOptions = {},
): string {
  const theme = createTheme(options);
  const text = getUiText(options.locale);
  const sections = buildSections(options);
  const visibleSections =
    topic === "all"
      ? sections
      : sections.filter((section) => section.topic === topic);

  return visibleSections
    .map((section) => [
      theme.heading(`=== ${section.title} ===`),
      section.body,
    ].join("\n"))
    .join("\n\n");
}

function buildSections(options: RenderOptions): readonly ShowcaseSection[] {
  const text = getUiText(options.locale);
  return [
    {
      topic: "auth",
      title: text.showcase.authIntro,
      body: renderAuthAddIntro("work", options),
    },
    {
      topic: "auth",
      title: text.showcase.authSuccess,
      body: renderAuthAddSuccess(
        "work",
        text.permissionMode.safeMode,
        "C:\\Users\\you\\.cco\\profiles.json",
        options,
      ),
    },
    {
      topic: "help",
      title: text.showcase.rootHelp,
      body: renderRootHelp(options),
    },
    {
      topic: "profiles",
      title: text.showcase.savedProfiles,
      body: renderSavedProfilesDemo(options),
    },
    {
      topic: "profiles",
      title: text.showcase.firstRun,
      body: renderProfilesPage(
        [HOST_PROFILE],
        new Map<string, boolean>(),
        "C:\\Users\\you\\.cco\\profiles.json",
        options,
      ),
    },
    {
      topic: "errors",
      title: text.showcase.unknownProfileError,
      body: renderCliError(
        new DomainError(
          "PROFILE_NOT_FOUND",
          'Unknown profile "missing-profile". Run "cco auth list" to inspect saved profiles.',
          { profileId: "missing-profile" },
        ),
        options,
      ),
    },
    {
      topic: "errors",
      title: text.showcase.reservedProfileError,
      body: renderCliError(
        new DomainError(
          "RESERVED_PROFILE_ID",
          'Profile id "host" is reserved by cco.',
          { profileId: "host" },
        ),
        options,
      ),
    },
    {
      topic: "errors",
      title: text.showcase.missingBinaryError,
      body: renderCliError({ code: "ENOENT" }, options),
    },
    {
      topic: "doctor",
      title: text.showcase.doctorOutput,
      body: renderDoctorPage(
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
        options,
      ),
    },
    {
      topic: "flows",
      title: text.showcase.commandFlows,
      body: renderPanel(
        {
          title: text.showcase.flowExamples,
          tone: "accent",
          body: renderCommandList(
            [
              {
                command: `${APP_NAME} auth add work`,
                description: text.showcase.flowAddDescription,
              },
              {
                command: `${APP_NAME} work`,
                description: text.showcase.flowLaunchDescription,
              },
              {
                command: `${APP_NAME} work -c`,
                description: text.showcase.flowContinueDescription,
              },
              {
                command: `${APP_NAME} host --resume abc123`,
                description: text.showcase.flowHostDescription,
              },
              {
                command:
                  "$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'; cco work --permission-mode bypassPermissions -c",
                description: text.rootHelp.permissionScrubCompatDescription,
              },
            ],
            options,
          ),
        },
        options,
      ),
    },
  ];
}

function renderSavedProfilesDemo(options: RenderOptions): string {
  const profiles: readonly Profile[] = [
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
  const tokenPresence = new Map<string, boolean>([
    ["work", true],
    ["backup", false],
  ]);

  return renderProfilesPage(
    profiles,
    tokenPresence,
    "C:\\Users\\you\\.cco\\profiles.json",
    options,
  );
}

interface ShowcaseSection {
  readonly topic: Exclude<ShowcaseTopic, "all">;
  readonly title: string;
  readonly body: string;
}
