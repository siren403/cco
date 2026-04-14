import { expect, test } from "bun:test";
import {
  requestsBypassPermissions,
  resolveShellSubprocessEnvScrubMode,
} from "../../src/core/services/permission-mode.ts";

test("detects split bypassPermissions args", () => {
  expect(
    requestsBypassPermissions(["--permission-mode", "bypassPermissions", "-c"]),
  ).toBe(true);
});

test("detects inline bypassPermissions args", () => {
  expect(
    requestsBypassPermissions(["--permission-mode=bypassPermissions", "-c"]),
  ).toBe(true);
});

test("detects dangerously-skip-permissions args", () => {
  expect(
    requestsBypassPermissions(["--dangerously-skip-permissions", "-c"]),
  ).toBe(true);
});

test("ignores other permission modes", () => {
  expect(requestsBypassPermissions(["--permission-mode", "default"])).toBe(false);
  expect(requestsBypassPermissions(["-c"])).toBe(false);
});

test("resolves shell subprocess scrub env override", () => {
  expect(resolveShellSubprocessEnvScrubMode({})).toBeUndefined();
  expect(
    resolveShellSubprocessEnvScrubMode({
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
    }),
  ).toBe("0");
  expect(
    resolveShellSubprocessEnvScrubMode({
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "1",
    }),
  ).toBe("1");
  expect(
    resolveShellSubprocessEnvScrubMode({
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "unknown",
    }),
  ).toBeUndefined();
});
