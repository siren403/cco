import { cancel, isCancel, password } from "@clack/prompts";
import { DomainError } from "../../core/errors/domain-error.ts";

export async function promptForToken(profileId: string): Promise<string> {
  const value = await password({
    message: `Paste the verified setup token for "${profileId}"`,
    mask: "*",
    validate(input) {
      if (!input || !input.trim()) {
        return "Token is required.";
      }

      return undefined;
    },
  });

  if (isCancel(value)) {
    cancel("Token capture cancelled.");
    throw new DomainError("PROMPT_CANCELLED", "Token capture cancelled.");
  }

  return value.trim();
}
