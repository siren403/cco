import { cancel, isCancel, select } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export type TeamsBootstrapMode = "import-host" | "clean";

export async function promptForTeamsBootstrapMode(
  profileId: string,
): Promise<TeamsBootstrapMode> {
  const text = getStaticUiText();
  const value = await select({
    message: text.prompts.teamsBootstrap(profileId),
    initialValue: "import-host",
    options: [
      {
        value: "import-host",
        label: text.prompts.teamsBootstrapImportLabel,
        hint: text.prompts.teamsBootstrapImportHint,
      },
      {
        value: "clean",
        label: text.prompts.teamsBootstrapCleanLabel,
        hint: text.prompts.teamsBootstrapCleanHint,
      },
    ],
  });

  if (isCancel(value)) {
    cancel(text.prompts.teamsBootstrapCancelled);
    throw new DomainError(
      "PROMPT_CANCELLED",
      text.prompts.teamsBootstrapCancelled,
    );
  }

  return value as TeamsBootstrapMode;
}
