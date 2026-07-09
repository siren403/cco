import { expect, test } from "bun:test";
import { resolveProviderModelArgs } from "../../src/core/services/provider-model-args.ts";

test("resolveProviderModelArgs prepends --model when a default model is set and none is passed", () => {
  expect(resolveProviderModelArgs([], "fake-model")).toEqual([
    "--model",
    "fake-model",
  ]);
  expect(resolveProviderModelArgs(["-c"], "fake-model")).toEqual([
    "--model",
    "fake-model",
    "-c",
  ]);
});

test("resolveProviderModelArgs leaves args unchanged when the user already passed --model", () => {
  expect(resolveProviderModelArgs(["--model", "user-model"], "fake-model")).toEqual([
    "--model",
    "user-model",
  ]);
});

test("resolveProviderModelArgs leaves args unchanged when the user passed --model=value", () => {
  expect(resolveProviderModelArgs(["--model=user-model"], "fake-model")).toEqual([
    "--model=user-model",
  ]);
});

test("resolveProviderModelArgs returns args unchanged when no default model is configured", () => {
  expect(resolveProviderModelArgs(["-c"], undefined)).toEqual(["-c"]);
});
