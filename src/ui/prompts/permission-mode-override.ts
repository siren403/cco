import { cancel, isCancel, select } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export type PermissionModeOverrideChoice = "compat" | "safe" | "guide";

export async function promptForPermissionModeOverride(
  profileId: string,
): Promise<PermissionModeOverrideChoice> {
  const text = getStaticUiText();
  const value = await select<PermissionModeOverrideChoice>({
    message: text.prompts.permissionOverride(profileId),
    initialValue: "safe",
    options: [
      {
        value: "compat",
        label: text.prompts.permissionOverrideCompatLabel,
        hint: text.prompts.permissionOverrideCompatHint,
      },
      {
        value: "safe",
        label: text.prompts.permissionOverrideSafeLabel,
        hint: text.prompts.permissionOverrideSafeHint,
      },
      {
        value: "guide",
        label: text.prompts.permissionOverrideGuideLabel,
        hint: text.prompts.permissionOverrideGuideHint,
      },
    ],
  });

  if (isCancel(value)) {
    cancel(text.prompts.launchCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.launchCancelled);
  }

  return value as PermissionModeOverrideChoice;
}
