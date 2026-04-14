import { cancel, isCancel, password } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptForToken(profileId: string): Promise<string> {
  const text = getStaticUiText();
  const value = await password({
    message: text.prompts.pasteToken(profileId),
    mask: "*",
    validate(input) {
      if (!input || !input.trim()) {
        return text.prompts.tokenRequired;
      }

      return undefined;
    },
  });

  if (isCancel(value)) {
    cancel(text.prompts.tokenCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.tokenCancelled);
  }

  return value.trim();
}
