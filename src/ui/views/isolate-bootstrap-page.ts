import { getUiText } from "../../i18n/index.ts";
import { renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderIsolateBootstrapPage(
  claudeHomeDir: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);

  return renderPanel(
    {
      title: text.misc.isolateBootstrapReadyTitle,
      tone: "accent",
      body: [
        text.misc.isolateBootstrapReadyLine1,
        text.misc.isolateBootstrapReadyLine2(claudeHomeDir),
        text.misc.isolateBootstrapReadyLine3,
      ],
    },
    options,
  );
}
