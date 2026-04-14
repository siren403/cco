import { expect, test } from "bun:test";
import { findConflictingAuthEnv, hasExplicitResumeArgument } from "../../src/infra/bun/env.ts";

test("findConflictingAuthEnv reports only present values", () => {
  const conflicts = findConflictingAuthEnv({
    ANTHROPIC_API_KEY: "1",
    CLAUDE_CONFIG_DIR: "/tmp/test",
    HOME: "/tmp/home",
  });

  expect(conflicts).toContain("ANTHROPIC_API_KEY");
  expect(conflicts).toContain("CLAUDE_CONFIG_DIR");
  expect(conflicts).not.toContain("CLAUDE_CODE_OAUTH_TOKEN");
});

test("hasExplicitResumeArgument detects long and short forms", () => {
  expect(hasExplicitResumeArgument(["--resume", "abc"])).toBe(true);
  expect(hasExplicitResumeArgument(["-r", "abc"])).toBe(true);
  expect(hasExplicitResumeArgument(["--verbose"])).toBe(false);
});
