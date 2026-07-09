import { cancel, isCancel, text } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptForBaseUrl(profileId: string): Promise<string> {
  const uiText = getStaticUiText();
  const value = await text({
    message: uiText.prompts.providerBaseUrl(profileId),
    validate(input) {
      if (!input || !input.trim()) {
        return uiText.prompts.providerBaseUrlRequired;
      }

      return undefined;
    },
  });

  if (isCancel(value)) {
    cancel(uiText.prompts.providerBaseUrlCancelled);
    throw new DomainError("PROMPT_CANCELLED", uiText.prompts.providerBaseUrlCancelled);
  }

  return value.trim();
}
