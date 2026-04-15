import { getUiText } from "../../i18n/index.ts";
import { renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderTeamsBootstrapPage(
  claudeHomeDir: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);

  return renderPanel(
    {
      title: text.misc.teamsBootstrapReadyTitle,
      tone: "accent",
      body: [
        text.misc.teamsBootstrapReadyLine1,
        text.misc.teamsBootstrapReadyLine2(claudeHomeDir),
        text.misc.teamsBootstrapReadyLine3,
      ],
    },
    options,
  );
}
