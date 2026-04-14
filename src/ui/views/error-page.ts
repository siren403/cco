import { getUiText } from "../../i18n/index.ts";
import { joinBlocks, renderCommandList, renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export interface ErrorPageData {
  readonly title: string;
  readonly tone?: "danger" | "warn";
  readonly summary?: string;
  readonly details?: readonly string[];
  readonly nextStepTitle?: string;
  readonly commands?: readonly {
    readonly command: string;
    readonly description?: string;
  }[];
}

export function renderErrorPage(
  data: ErrorPageData,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return joinBlocks([
    renderPanel(
      {
        title: text.errors.problemTitle,
        tone: data.tone ?? "danger",
        badge: {
          label: (data.tone ?? "danger") === "warn" ? "attention" : "error",
          tone: data.tone ?? "danger",
        },
        body: [data.title, ...(data.summary ? ["", data.summary] : []), ...(data.details ?? [])],
      },
      options,
    ),
    data.commands && data.commands.length > 0
      ? renderPanel(
          {
            title: data.nextStepTitle ?? text.errors.nextStepTitle,
            tone: "accent",
            body: renderCommandList(data.commands, options),
          },
          options,
        )
      : "",
  ]);
}
