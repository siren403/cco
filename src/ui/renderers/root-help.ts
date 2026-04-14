import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "../../meta.ts";
import {
  joinBlocks,
  renderBadge,
  renderBulletList,
  renderCommandList,
  renderPanel,
} from "../layout/primitives.ts";
import { createTheme, type RenderOptions } from "../theme.ts";

export function renderRootHelp(options: RenderOptions = {}): string {
  const theme = createTheme(options);

  return joinBlocks([
    renderPanel(
      {
        title: `${APP_NAME} ${APP_VERSION}`,
        tone: "accent",
        badge: { label: "auth overlay", tone: "accent" },
        body: [
          theme.dim(APP_DESCRIPTION),
          "",
          "Keep the host Claude Code config intact and swap only the child-process auth token per launch.",
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: "Quick Start",
        tone: "ok",
        badge: { label: "primary path", tone: "ok" },
        body: renderCommandList(
          [
            {
              command: `${APP_NAME} auth add work`,
              description: "Create a local alias for an official Claude setup-token.",
            },
            {
              command: `${APP_NAME} work`,
              description: "Launch Claude with the work overlay token while keeping host config intact.",
            },
            {
              command: `${APP_NAME} work -c`,
              description: "Pass Claude's native continue flag through unchanged.",
            },
            {
              command: `${APP_NAME} showcase auth`,
              description: "Preview the onboarding panels without launching Claude.",
            },
          ],
          options,
        ),
      },
      options,
    ),
    renderPanel(
      {
        title: "Command Surface",
        tone: "dim",
        body: [
          renderBulletList(
            [
              `${theme.code(`${APP_NAME} <profile>`)} launches Claude with an overlay token.`,
              `${theme.code(`${APP_NAME} host`)} launches with the host Claude login.`,
              `${theme.code(`${APP_NAME} doctor`)} inspects runtime wiring and env precedence.`,
              `${theme.code(`${APP_NAME} showcase [topic]`)} previews the CLI surface without launching Claude.`,
            ],
            options,
          ),
          "",
          `${renderBadge({ label: "local alias", tone: "accent" }, options)} profiles are names you choose, such as ${theme.code("work")} or ${theme.code("backup")}.`,
        ],
      },
      options,
    ),
  ]);
}
