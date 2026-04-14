import { randomUUID } from "node:crypto";
import type { SessionBinding } from "../model/session.ts";
import type { SessionStore } from "../ports/session-store.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface EnsureSessionBindingInput {
  readonly store: SessionStore;
  readonly projectKey: string;
  readonly profileId: string;
  readonly now: string;
  readonly fresh?: boolean;
}

export interface EnsuredSessionBinding {
  readonly binding: SessionBinding;
  readonly mode: "new" | "resume";
}

export async function ensureSessionBinding(
  input: EnsureSessionBindingInput,
): Promise<EnsuredSessionBinding> {
  if (!input.fresh) {
    const existing = await input.store.get(input.projectKey, input.profileId);
    if (existing && isValidSessionId(existing.sessionId)) {
      const binding = {
        ...existing,
        updatedAt: input.now,
      } satisfies SessionBinding;
      await input.store.put(binding);
      return {
        binding,
        mode: "resume",
      };
    }
  }

  const binding = {
    projectKey: input.projectKey,
    profileId: input.profileId,
    sessionId: randomUUID(),
    updatedAt: input.now,
  } satisfies SessionBinding;

  await input.store.put(binding);

  return {
    binding,
    mode: "new",
  };
}

export function isValidSessionId(value: string): boolean {
  return UUID_PATTERN.test(value);
}
