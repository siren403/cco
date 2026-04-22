import { expect, test } from "bun:test";
import { resolveIsolateLaunchArgs } from "../../src/core/services/isolate-launch-args.ts";

test("resolveIsolateLaunchArgs injects --resume when continuity imported and no native continuation arg exists", () => {
  expect(resolveIsolateLaunchArgs(["--verbose"], "session-123")).toEqual([
    "--resume",
    "session-123",
    "--verbose",
  ]);
});

test("resolveIsolateLaunchArgs preserves explicit -c and skips injected resume", () => {
  expect(resolveIsolateLaunchArgs(["-c"], "session-123")).toEqual(["-c"]);
});

test("resolveIsolateLaunchArgs preserves explicit --resume and skips injected resume", () => {
  expect(resolveIsolateLaunchArgs(["--resume", "manual-session"], "session-123")).toEqual([
    "--resume",
    "manual-session",
  ]);
});

test("resolveIsolateLaunchArgs leaves args unchanged when no continuity import exists", () => {
  expect(resolveIsolateLaunchArgs(["-c"], undefined)).toEqual(["-c"]);
  expect(resolveIsolateLaunchArgs(undefined, undefined)).toBeUndefined();
});
