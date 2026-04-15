import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptToConfirmIsolateRemove(
  profileId: string,
): Promise<boolean> {
  const text = getStaticUiText();
  const value = await confirm({
    message: text.prompts.confirmIsolateRemove(profileId),
  });

  if (isCancel(value)) {
    cancel(text.prompts.isolateRemoveCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.isolateRemoveCancelled);
  }

  return value;
}
