import { expect, test } from "bun:test";
import { resolveInvocation } from "../../src/invocation.ts";

test("plain profile invocation is treated as direct Claude launch", () => {
  expect(resolveInvocation(["work"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: [],
  });

  expect(resolveInvocation(["work", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
  });
});

test("host invocation passes trailing args through to Claude", () => {
  expect(resolveInvocation(["host", "--resume", "abc"])).toEqual({
    mode: "direct-launch",
    profileId: "host",
    claudeArgs: ["--resume", "abc"],
  });
});

test("reserved CLI commands stay on the Stricli path", () => {
  expect(resolveInvocation([])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["auth", "list"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["doctor"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["--help"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["host", "--help"])).toEqual({ mode: "stricli" });
});
