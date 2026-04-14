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
  return joinBlocks([
    renderPanel(
      {
        title: "Problem",
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
            title: data.nextStepTitle ?? "Next Step",
            tone: "accent",
            body: renderCommandList(data.commands, options),
          },
          options,
        )
      : "",
  ]);
}
