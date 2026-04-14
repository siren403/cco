import { cancel, isCancel, select } from "@clack/prompts";
import type { OverlayProfile } from "../../core/model/profile.ts";
import {
  DEFAULT_SUBPROCESS_ENV_SCRUB,
  resolveSubprocessEnvScrubMode,
  type SubprocessEnvScrubMode,
} from "../../core/model/profile.ts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export async function promptForProfileEnvMode(
  profileId: string,
  existingProfile?: OverlayProfile | null,
): Promise<SubprocessEnvScrubMode> {
  const text = getStaticUiText();
  const value = await select({
    message: text.prompts.profileEnvPolicy(profileId),
    initialValue:
      existingProfile == null
        ? DEFAULT_SUBPROCESS_ENV_SCRUB
        : resolveSubprocessEnvScrubMode(existingProfile),
    options: [
      {
        value: "1",
        label: text.prompts.profileEnvSafeLabel,
        hint: text.prompts.profileEnvSafeHint,
      },
      {
        value: "0",
        label: text.prompts.profileEnvCompatLabel,
        hint: text.prompts.profileEnvCompatHint,
      },
    ],
  });

  if (isCancel(value)) {
    cancel(text.prompts.profileEnvCancelled);
    throw new DomainError("PROMPT_CANCELLED", text.prompts.profileEnvCancelled);
  }

  return value;
}
