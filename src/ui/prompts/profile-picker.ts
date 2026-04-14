import { cancel, isCancel, select } from "@clack/prompts";
import type { Profile } from "../../core/model/profile.ts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptForProfile(
  profiles: readonly Profile[],
): Promise<string> {
  const text = getStaticUiText();
  const value = await select({
    message: text.prompts.pickProfile,
    options: profiles.map((profile) => ({
      value: profile.id,
      label: profile.id,
      hint: profile.kind === "host" ? text.prompts.hostHint : text.prompts.overlayHint,
    })),
  });

  if (isCancel(value)) {
    cancel(text.prompts.launchCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.launchCancelled);
  }

  return value;
}
