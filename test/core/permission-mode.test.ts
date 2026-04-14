import { expect, test } from "bun:test";
import {
  requestsBypassPermissions,
  resolveBypassPermissionsPolicy,
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

test("resolves non-interactive bypass policy from env", () => {
  expect(resolveBypassPermissionsPolicy({})).toBe("ask");
  expect(
    resolveBypassPermissionsPolicy({
      CCO_BYPASS_PERMISSIONS_POLICY: "compat",
    }),
  ).toBe("compat");
  expect(
    resolveBypassPermissionsPolicy({
      CCO_BYPASS_PERMISSIONS_POLICY: "safe",
    }),
  ).toBe("safe");
  expect(
    resolveBypassPermissionsPolicy({
      CCO_BYPASS_PERMISSIONS_POLICY: "unknown",
    }),
  ).toBe("ask");
});
