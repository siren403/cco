import { DomainError } from "../../core/errors/domain-error.ts";
import { HOST_PROFILE, type Profile } from "../../core/model/profile.ts";
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
  return [
    {
      topic: "auth",
      title: "Auth Add Intro",
      body: renderAuthAddIntro("work", options),
    },
    {
      topic: "auth",
      title: "Auth Add Success",
      body: renderAuthAddSuccess("work", options),
    },
    {
      topic: "help",
      title: "Root Help",
      body: renderRootHelp(options),
    },
    {
      topic: "profiles",
      title: "Saved Profiles",
      body: renderSavedProfilesDemo(options),
    },
    {
      topic: "profiles",
      title: "First Run Empty State",
      body: renderProfilesPage([HOST_PROFILE], new Map<string, boolean>(), options),
    },
    {
      topic: "errors",
      title: "Unknown Profile Error",
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
      title: "Reserved Profile Error",
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
      title: "Missing Claude Binary Error",
      body: renderCliError({ code: "ENOENT" }, options),
    },
    {
      topic: "doctor",
      title: "Doctor Output",
      body: renderDoctorPage(
        {
          claudeBinary: "C:\\Program Files\\Claude\\claude.exe",
          ccoHome: "C:\\Users\\you\\.cco",
          profiles: 2,
          hostConfigDir: "C:\\Users\\you\\.claude",
          conflicts: [],
          launchMode: "host config + process-local auth overlay",
        },
        options,
      ),
    },
    {
      topic: "flows",
      title: "Command Flows",
      body: renderPanel(
        {
          title: "Flow Examples",
          tone: "accent",
          body: renderCommandList(
            [
              {
                command: `${APP_NAME} auth add work`,
                description:
                  "Starts the official setup-token flow, then captures and verifies the copied token.",
              },
              {
                command: `${APP_NAME} work`,
                description:
                  "Launches Claude with host config intact and injects only the work OAuth token into the child process.",
              },
              {
                command: `${APP_NAME} work -c`,
                description:
                  "Uses the same auth overlay while passing Claude's native continue flag through unchanged.",
              },
              {
                command: `${APP_NAME} host --resume abc123`,
                description:
                  "Keeps the host login and passes native resume arguments through unchanged.",
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
    },
    {
      id: "backup",
      label: "backup",
      kind: "overlay",
      tokenRef: "backup",
      createdAt: "2026-04-14T00:00:00.000Z",
      updatedAt: "2026-04-14T00:00:00.000Z",
    },
  ];
  const tokenPresence = new Map<string, boolean>([
    ["work", true],
    ["backup", false],
  ]);

  return renderProfilesPage(profiles, tokenPresence, options);
}

interface ShowcaseSection {
  readonly topic: Exclude<ShowcaseTopic, "all">;
  readonly title: string;
  readonly body: string;
}
