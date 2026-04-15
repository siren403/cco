import { expect, test } from "bun:test";
import {
  resolveCcoPaths,
  resolvePhysicalHostClaudeConfigDir,
  resolveHostClaudeConfigDir,
  resolveIsolateProfilePaths,
} from "../../src/infra/fs/path-utils.ts";

test("resolveCcoPaths includes profiles directory", () => {
  const fakeHome = "C:\\Users\\test-user";
  const paths = resolveCcoPaths({
    USERPROFILE: fakeHome,
  });

  expect(paths.root).toBe(`${fakeHome}\\.cco`);
  expect(paths.profilesDir).toBe(`${fakeHome}\\.cco\\profiles`);
  expect(paths.profilesFile).toBe(`${fakeHome}\\.cco\\profiles.json`);
});

test("resolveIsolateProfilePaths nests isolate home under the profile directory", () => {
  const fakeHome = "C:\\Users\\test-user";
  const paths = resolveCcoPaths({
    USERPROFILE: fakeHome,
  });

  const isolate = resolveIsolateProfilePaths(paths, "work");

  expect(isolate.root).toBe(`${fakeHome}\\.cco\\profiles\\work\\isolate`);
  expect(isolate.claudeHomeDir).toBe(
    `${fakeHome}\\.cco\\profiles\\work\\isolate\\claude`,
  );
  expect(isolate.manifestFile).toBe(
    `${fakeHome}\\.cco\\profiles\\work\\isolate\\manifest.json`,
  );
});

test("resolveHostClaudeConfigDir uses env override before the default host home", () => {
  expect(
    resolveHostClaudeConfigDir({
      USERPROFILE: "C:\\Users\\test-user",
      CLAUDE_CONFIG_DIR: "D:\\custom\\.claude",
    }),
  ).toBe("D:\\custom\\.claude");

  expect(
    resolveHostClaudeConfigDir({
      USERPROFILE: "C:\\Users\\test-user",
    }),
  ).toBe("C:\\Users\\test-user\\.claude");
});

test("resolvePhysicalHostClaudeConfigDir ignores ambient CLAUDE_CONFIG_DIR", () => {
  expect(
    resolvePhysicalHostClaudeConfigDir({
      USERPROFILE: "C:\\Users\\test-user",
      CLAUDE_CONFIG_DIR: "D:\\custom\\.claude",
    }),
  ).toBe("C:\\Users\\test-user\\.claude");
});
