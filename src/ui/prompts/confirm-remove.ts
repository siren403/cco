import { cancel, confirm, isCancel } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";

export async function promptToConfirmRemove(profileId: string): Promise<boolean> {
  const value = await confirm({
    message: `Remove profile "${profileId}" and delete its stored token?`,
  });

  if (isCancel(value)) {
    cancel("Profile removal cancelled.");
    throw new DomainError("PROMPT_CANCELLED", "Profile removal cancelled.");
  }

  return value;
}
