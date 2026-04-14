import { expect, test } from "bun:test";
import type { SessionBinding } from "../../src/core/model/session.ts";
import type { SessionStore } from "../../src/core/ports/session-store.ts";
import {
  ensureSessionBinding,
  isValidSessionId,
} from "../../src/core/services/session-binding.ts";

class MemorySessionStore implements SessionStore {
  private readonly bindings = new Map<string, SessionBinding>();

  async get(projectKey: string, profileId: string): Promise<SessionBinding | null> {
    return this.bindings.get(`${projectKey}::${profileId}`) ?? null;
  }

  async put(binding: SessionBinding): Promise<void> {
    this.bindings.set(`${binding.projectKey}::${binding.profileId}`, binding);
  }
}

test("ensureSessionBinding creates a new UUID when no binding exists", async () => {
  const store = new MemorySessionStore();
  const result = await ensureSessionBinding({
    store,
    projectKey: "d:/workspace/app",
    profileId: "work",
    now: "2026-04-14T00:00:00.000Z",
  });

  expect(result.mode).toBe("new");
  expect(isValidSessionId(result.binding.sessionId)).toBe(true);
});

test("ensureSessionBinding resumes an existing valid binding", async () => {
  const store = new MemorySessionStore();
  await store.put({
    projectKey: "d:/workspace/app",
    profileId: "work",
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    updatedAt: "2026-04-13T00:00:00.000Z",
  });

  const result = await ensureSessionBinding({
    store,
    projectKey: "d:/workspace/app",
    profileId: "work",
    now: "2026-04-14T00:00:00.000Z",
  });

  expect(result.mode).toBe("resume");
  expect(result.binding.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
  expect(result.binding.updatedAt).toBe("2026-04-14T00:00:00.000Z");
});

test("ensureSessionBinding replaces invalid stored session ids", async () => {
  const store = new MemorySessionStore();
  await store.put({
    projectKey: "d:/workspace/app",
    profileId: "work",
    sessionId: "not-a-uuid",
    updatedAt: "2026-04-13T00:00:00.000Z",
  });

  const result = await ensureSessionBinding({
    store,
    projectKey: "d:/workspace/app",
    profileId: "work",
    now: "2026-04-14T00:00:00.000Z",
  });

  expect(result.mode).toBe("new");
  expect(result.binding.sessionId).not.toBe("not-a-uuid");
  expect(isValidSessionId(result.binding.sessionId)).toBe(true);
});

test("ensureSessionBinding creates a fresh session when requested", async () => {
  const store = new MemorySessionStore();
  await store.put({
    projectKey: "d:/workspace/app",
    profileId: "work",
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    updatedAt: "2026-04-13T00:00:00.000Z",
  });

  const result = await ensureSessionBinding({
    store,
    projectKey: "d:/workspace/app",
    profileId: "work",
    now: "2026-04-14T00:00:00.000Z",
    fresh: true,
  });

  expect(result.mode).toBe("new");
  expect(result.binding.sessionId).not.toBe("550e8400-e29b-41d4-a716-446655440000");
});
