import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptToConfirmTeamsRemove(
  profileId: string,
): Promise<boolean> {
  const text = getStaticUiText();
  const value = await confirm({
    message: text.prompts.confirmTeamsRemove(profileId),
  });

  if (isCancel(value)) {
    cancel(text.prompts.teamsRemoveCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.teamsRemoveCancelled);
  }

  return value;
}
