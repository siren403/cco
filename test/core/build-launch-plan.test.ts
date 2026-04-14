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

test("explicit Claude args are passed through unchanged", () => {
  const plan = buildLaunchPlan({
    profile: HOST_PROFILE,
    binary: "claude",
    cwd: "/tmp/example",
    parentEnv: baseEnv,
    explicitArgs: ["-c", "--verbose"],
  });

  expect(plan.args).toEqual(["-c", "--verbose"]);
});
