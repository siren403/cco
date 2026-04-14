import { cancel, isCancel, select } from "@clack/prompts";
import type { Profile } from "../../core/model/profile.ts";
import { DomainError } from "../../core/errors/domain-error.ts";

export async function promptForProfile(
  profiles: readonly Profile[],
): Promise<string> {
  const value = await select({
    message: "Pick the Claude profile to launch",
    options: profiles.map((profile) => ({
      value: profile.id,
      label: profile.id,
      hint: profile.kind === "host" ? "host login" : "oauth overlay",
    })),
  });

  if (isCancel(value)) {
    cancel("Launch cancelled.");
    throw new DomainError("PROMPT_CANCELLED", "Launch cancelled.");
  }

  return value;
}
