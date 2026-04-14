import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptToConfirmRemove(profileId: string): Promise<boolean> {
  const text = getStaticUiText();
  const value = await confirm({
    message: text.prompts.confirmRemove(profileId),
  });

  if (isCancel(value)) {
    cancel(text.prompts.removeCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.removeCancelled);
  }

  return value;
}
