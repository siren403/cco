import { cancel, isCancel, select } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";
import { getStaticUiText } from "../../i18n/index.ts";

export type IsolateBootstrapMode = "import-host" | "clean";

export async function promptForIsolateBootstrapMode(
  profileId: string,
): Promise<IsolateBootstrapMode> {
  const text = getStaticUiText();
  const value = await select({
    message: text.prompts.isolateBootstrap(profileId),
    initialValue: "import-host",
    options: [
      {
        value: "import-host",
        label: text.prompts.isolateBootstrapImportLabel,
        hint: text.prompts.isolateBootstrapImportHint,
      },
      {
        value: "clean",
        label: text.prompts.isolateBootstrapCleanLabel,
        hint: text.prompts.isolateBootstrapCleanHint,
      },
    ],
  });

  if (isCancel(value)) {
    cancel(text.prompts.isolateBootstrapCancelled);
    throw new DomainError(
      "PROMPT_CANCELLED",
      text.prompts.isolateBootstrapCancelled,
    );
  }

  return value as IsolateBootstrapMode;
}
