import { buildCliErrorModel } from "../models/cli-error.ts";
import { renderErrorPage } from "../views/error-page.ts";
import type { RenderOptions } from "../theme.ts";

export function renderCliError(error: unknown, options: RenderOptions = {}): string {
  const model = buildCliErrorModel(error, options.locale ?? "ko");
  return renderErrorPage(model, options);
}
