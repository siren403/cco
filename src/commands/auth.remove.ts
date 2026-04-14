import { outro } from "@clack/prompts";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { promptToConfirmRemove } from "../ui/prompts/confirm-remove.ts";

const text = getStaticUiText();

export const authRemoveCommand = buildCommand<{}, [profileId: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    const profile = await resolveProfile(this.runtime.profileStore, profileId);
    if (profile.kind === "host") {
      throw new DomainError("INVALID_PROFILE_ID", text.errors.invalidProfileTitle);
    }

    const confirmed = await promptToConfirmRemove(profileId);
    if (!confirmed) {
      this.process.stdout.write(`${text.misc.noChangesMade}\n`);
      return;
    }

    await this.runtime.profileStore.remove(profileId);
    await this.runtime.tokenStore.remove(profileId);

    outro(text.misc.removedProfile(profileId));
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.authRemoveArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.authRemove,
  },
});
