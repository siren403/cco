import { expect, test } from "bun:test";
import { isRootHelpRequest, isRootVersionRequest, resolveInvocation } from "../../src/invocation.ts";

test("plain profile invocation is treated as direct Claude launch", () => {
  expect(resolveInvocation(["work"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: [],
    isolate: true,
  });

  expect(resolveInvocation(["work", "-c"])).toEqual({
    mode: "direct-launch",
    profileId: "work",
    claudeArgs: ["-c"],
    isolate: true,
  });

});

test("host invocation passes trailing args through to Claude", () => {
  expect(resolveInvocation(["host", "--resume", "abc"])).toEqual({
    mode: "direct-launch",
    profileId: "host",
    claudeArgs: ["--resume", "abc"],
    isolate: false,
  });
});

test("removed isolate launch flag is rejected with the new canonical guidance", () => {
  expect(() => resolveInvocation(["--isolate", "work", "-c"])).toThrow(
    "This old cco launch flag was removed. Use `cco <profile>` for profiled runs or `cco isolate ...` for maintenance.",
  );

  expect(() => resolveInvocation(["work", "--isolate"])).toThrow(
    "This old cco launch flag was removed. Use `cco <profile>` for profiled runs or `cco isolate ...` for maintenance.",
  );

  expect(() => resolveInvocation(["--teams", "work"])).toThrow(
    "This old cco launch flag was removed. Use `cco <profile>` for profiled runs or `cco isolate ...` for maintenance.",
  );
});

test("reserved CLI commands stay on the Stricli path", () => {
  expect(resolveInvocation([])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["auth", "list"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["doctor"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["isolate", "status", "work"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["showcase"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["ui"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["--help"])).toEqual({ mode: "stricli" });
  expect(resolveInvocation(["host", "--help"])).toEqual({ mode: "stricli" });
});

test("removed teams command is rejected with migration guidance", () => {
  expect(() => resolveInvocation(["teams"])).toThrow(
    "The experimental `teams` command was removed. Use `cco <profile>` for profiled runs or `cco isolate ...` for maintenance.",
  );
});

test("root help and version requests are detected explicitly", () => {
  expect(isRootHelpRequest(["--help"])).toBe(true);
  expect(isRootHelpRequest(["help"])).toBe(true);
  expect(isRootVersionRequest(["--version"])).toBe(true);
  expect(isRootVersionRequest(["version"])).toBe(true);
});
