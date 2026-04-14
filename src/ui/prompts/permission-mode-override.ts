import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptForPermissionModeOverride(
  profileId: string,
): Promise<boolean> {
  const text = getStaticUiText();
  const value = await confirm({
    message: text.prompts.permissionOverride(profileId),
    active: text.prompts.permissionOverrideYes,
    inactive: text.prompts.permissionOverrideNo,
    initialValue: false,
  });

  if (isCancel(value)) {
    cancel(text.prompts.launchCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.launchCancelled);
  }

  return value;
}
