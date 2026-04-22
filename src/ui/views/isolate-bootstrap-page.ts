import { getUiText } from "../../i18n/index.ts";
import type { IsolateBootstrapMode } from "../../core/services/isolate-bootstrap.ts";
import { renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderIsolateBootstrapPage(
  claudeHomeDir: string,
  seedMode: IsolateBootstrapMode = "import-host",
  importLatestHostSession = false,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);

  return renderPanel(
    {
      title: text.misc.isolateBootstrapReadyTitle,
      tone: "accent",
      body: [
        text.misc.isolateBootstrapReadyLine1,
        seedMode === "clean"
          ? text.prompts.isolateBootstrapCleanLabel
          : text.prompts.isolateBootstrapImportLabel,
        importLatestHostSession
          ? text.prompts.isolateContinuityImportLabel
          : text.prompts.isolateContinuitySkipLabel,
        text.misc.isolateBootstrapReadyLine2(claudeHomeDir),
        text.misc.isolateBootstrapReadyLine3,
      ],
    },
    options,
  );
}
