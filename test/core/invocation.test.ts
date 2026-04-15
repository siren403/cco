import { expect, test } from "bun:test";
import { isRootHelpRequest, isRootVersionRequest, resolveInvocation } from "../../src/invocation.ts";

test("plain profile invocation is treated as direct Claude launch", () => {
  expect(resolveInvocation(["work"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: [],
    teams: false,
  });

  expect(resolveInvocation(["work", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
    teams: false,
  });
});

test("host invocation passes trailing args through to Claude", () => {
  expect(resolveInvocation(["host", "--resume", "abc"])).toEqual({
    mode: "direct-launch",
    profileId: "host",
    claudeArgs: ["--resume", "abc"],
    teams: false,
  });
});

test("launch flags before profile stay on the direct launch path", () => {
  expect(resolveInvocation(["--isolate", "work", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
    teams: true,
  });

  expect(resolveInvocation(["--teams", "work", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
    teams: true,
  });

  expect(resolveInvocation(["--teams", "work", "--", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
    teams: true,
  });
});

test("launch flags after profile are rejected with a targeted error", () => {
  expect(() => resolveInvocation(["work", "--isolate"])).toThrow(
    '"--isolate" is a cco launch option and must appear before <profile>. Try: cco --isolate work',
  );

  expect(() => resolveInvocation(["work", "--teams"])).toThrow(
    '"--teams" is a cco launch option and must appear before <profile>. Try: cco --teams work',
  );
});

test("reserved CLI commands stay on the Stricli path", () => {
  expect(resolveInvocation([])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["auth", "list"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["doctor"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["isolate", "status", "work"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["teams", "status", "work"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["showcase"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["--help"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["host", "--help"])).toEqual({ mode: "stricli" });
});

test("root help and version requests are detected explicitly", () => {
  expect(isRootHelpRequest(["--help"])).toBe(true);
  expect(isRootHelpRequest(["help"])).toBe(true);
  expect(isRootVersionRequest(["--version"])).toBe(true);
  expect(isRootVersionRequest(["version"])).toBe(true);
});
