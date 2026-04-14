import { getUiText } from "../../i18n/index.ts";
import { joinBlocks, renderBulletList, renderPanel } from "../layout/primitives.ts";
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
