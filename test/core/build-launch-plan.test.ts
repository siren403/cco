import { expect, test } from "bun:test";
import { buildLaunchPlan } from "../../src/core/services/build-launch-plan.ts";
import { HOST_PROFILE } from "../../src/core/model/profile.ts";

const baseEnv = {
  HOME: "/tmp/example",
  CLAUDE_CONFIG_DIR: "/tmp/override",
  ANTHROPIC_API_KEY: "api-key",
  ANTHROPIC_AUTH_TOKEN: "auth-token",
  CLAUDE_CODE_OAUTH_TOKEN: "old-token",
} satisfies NodeJS.ProcessEnv;

test("overlay launch injects token and scrubs conflicting auth env", () => {
  const plan = buildLaunchPlan({
    profile: {
      id: "work",
      label: "work",
      kind: "overlay",
      tokenRef: "work",
      createdAt: "",
      updatedAt: "",
    },
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    token: "new-token",
  });

  expect(plan.env.CLAUDE_CODE_OAUTH_TOKEN).toBe("new-token");
  expect(plan.env.ANTHROPIC_API_KEY).toBeUndefined();
  expect(plan.env.ANTHROPIC_AUTH_TOKEN).toBeUndefined();
  expect(plan.env.CLAUDE_CONFIG_DIR).toBeUndefined();
  expect(plan.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("1");
});

test("host launch does not inject oauth token", () => {
  const plan = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
  });

  expect(plan.env.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
  expect(plan.binary).toBe("claude");
});

test("resume flag is injected only when absent", () => {
  const plan = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    resumeSessionId: "session-123",
  });

  expect(plan.args).toEqual(["--resume", "session-123"]);

  const explicit = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    resumeSessionId: "session-123",
    explicitArgs: ["--resume", "manual-session"],
  });

  expect(explicit.args).toEqual(["--resume", "manual-session"]);
});

test("new session ids are injected when no explicit session argument is present", () => {
  const plan = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
  });

  expect(plan.args).toEqual([
    "--session-id",
    "550e8400-e29b-41d4-a716-446655440000",
  ]);

  const explicit = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    explicitArgs: ["--session-id", "12345678-1234-4234-8234-1234567890ab"],
  });

  expect(explicit.args).toEqual([
    "--session-id",
    "12345678-1234-4234-8234-1234567890ab",
  ]);
});
