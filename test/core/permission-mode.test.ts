import { expect, test } from "bun:test";
import { requestsBypassPermissions } from "../../src/core/services/permission-mode.ts";

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

test("ignores other permission modes", () => {
  expect(requestsBypassPermissions(["--permission-mode", "default"])).toBe(false);
  expect(requestsBypassPermissions(["-c"])).toBe(false);
});
