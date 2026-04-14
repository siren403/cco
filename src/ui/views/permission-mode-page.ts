import { getUiText } from "../../i18n/index.ts";
import {
  joinBlocks,
  renderBulletList,
  renderCommandList,
  renderPanel,
} from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderPermissionModeWarning(
  profileId: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return joinBlocks([
    renderPanel(
      {
        title: text.permissionMode.warningTitle,
        tone: "warn",
        badge: { label: profileId, tone: "warn" },
        body: [
          text.permissionMode.warningLine1,
          "",
          text.permissionMode.warningLine2,
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: text.permissionMode.choicesTitle,
        tone: "accent",
        body: renderBulletList(
          [
            text.permissionMode.choiceCompat,
            text.permissionMode.choiceSafe,
            text.permissionMode.choiceGuide,
          ],
          options,
        ),
      },
      options,
    ),
  ]);
}

export function renderPermissionModeDecision(
  mode: "compat" | "safe",
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return renderPanel(
    {
      title: text.permissionMode.launchPolicyTitle,
      tone: mode === "compat" ? "warn" : "ok",
      badge: {
        label:
          mode === "compat"
            ? text.permissionMode.compatMode
            : text.permissionMode.safeMode,
        tone: mode === "compat" ? "warn" : "ok",
      },
      body:
        mode === "compat"
          ? [text.permissionMode.compatLine1, text.permissionMode.compatLine2]
          : [text.permissionMode.safeLine1, text.permissionMode.safeLine2],
    },
    options,
  );
}

export function renderPermissionModeGuidance(
  profileId: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return joinBlocks([
    renderPanel(
      {
        title: text.permissionMode.guidanceTitle,
        tone: "warn",
        badge: { label: profileId, tone: "warn" },
        body: [text.permissionMode.guidanceLine1, text.permissionMode.guidanceLine2],
      },
      options,
    ),
    renderPanel(
      {
        title: text.permissionMode.guidanceNextTitle,
        tone: "accent",
        body: renderCommandList(
          [
            {
              command: `$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'; cco ${profileId} --permission-mode bypassPermissions -c`,
              description: text.permissionMode.guidanceCompatDescription,
            },
            {
              command: `cco ${profileId} -c`,
              description: text.permissionMode.guidanceSafeDescription,
            },
            {
              command: `cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p ${profileId}`,
              description: text.permissionMode.guidancePersistDescription,
            },
          ],
          options,
        ),
      },
      options,
    ),
  ]);
}
