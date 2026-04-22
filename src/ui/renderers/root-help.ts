import { getUiText } from "../../i18n/index.ts";
import { APP_NAME, APP_VERSION } from "../../meta.ts";
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
  const text = getUiText(options.locale);

  return joinBlocks([
    renderPanel(
      {
        title: `${APP_NAME} ${APP_VERSION}`,
        tone: "accent",
        badge: { label: text.rootHelp.badge, tone: "accent" },
        body: [
          theme.dim(text.appDescription),
          "",
          text.rootHelp.summary,
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: text.rootHelp.quickStartTitle,
        tone: "ok",
        badge: { label: text.rootHelp.quickStartBadge, tone: "ok" },
        body: renderCommandList(
          [
            {
              command: `${APP_NAME} auth add work`,
              description: text.rootHelp.quickStartAuthAdd,
            },
            {
              command: `${APP_NAME} work`,
              description: text.rootHelp.quickStartLaunch,
            },
            {
              command: `${APP_NAME} work -c`,
              description: text.rootHelp.quickStartContinue,
            },
            {
              command: `${APP_NAME} host`,
              description: text.rootHelp.quickStartHost,
            },
            {
              command: `${APP_NAME} showcase auth`,
              description: text.rootHelp.quickStartShowcase,
            },
          ],
          options,
        ),
      },
      options,
    ),
    renderPanel(
      {
        title: text.rootHelp.commandSurfaceTitle,
        tone: "dim",
        body: [
          renderBulletList(
            [
              `${theme.code(`${APP_NAME} <profile>`)} ${text.rootHelp.commandSurfaceProfile.replace("`cco <profile>`", "")}`.trim(),
              `${theme.code(`${APP_NAME} host`)} ${text.rootHelp.commandSurfaceHost.replace("`cco host`", "")}`.trim(),
              `${theme.code(`${APP_NAME} config get -p work`)} ${text.rootHelp.commandSurfaceConfig.replace("`cco config get -p <profile>`", "")}`.trim(),
              `${theme.code(`${APP_NAME} doctor`)} ${text.rootHelp.commandSurfaceDoctor.replace("`cco doctor`", "")}`.trim(),
              `${theme.code(`${APP_NAME} isolate status work`)} ${text.rootHelp.commandSurfaceIsolate.replace("`cco isolate status/remove/fresh <profile>`", "")}`.trim(),
              `${theme.code(`${APP_NAME} showcase [topic]`)} ${text.rootHelp.commandSurfaceShowcase.replace("`cco showcase [topic]`", "")}`.trim(),
            ],
            options,
          ),
          "",
          `${renderBadge({ label: text.rootHelp.localAliasBadge, tone: "accent" }, options)} ${text.rootHelp.localAliasSummary.replace("`work`", theme.code("work")).replace("`backup`", theme.code("backup"))}`,
        ],
      },
      options,
    ),
  ]);
}
