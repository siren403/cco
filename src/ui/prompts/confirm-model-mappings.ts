import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptToConfirmModelMappings(
  mappings: Readonly<Record<string, string>>,
): Promise<boolean> {
  const text = getStaticUiText();
  const summary = Object.entries(mappings)
    .map(([key, value]) => `  ${key}=${value}`)
    .join("\n");

  const value = await confirm({
    message: text.prompts.confirmModelMappings(summary),
  });

  if (isCancel(value)) {
    cancel(text.prompts.confirmModelMappingsCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.confirmModelMappingsCancelled);
  }

  return value;
}
