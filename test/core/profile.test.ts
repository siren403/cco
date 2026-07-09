import { expect, test } from "bun:test";
import {
  isAllowedProviderEnvKey,
  resolveProfileAuthKind,
} from "../../src/core/model/profile.ts";

test("resolveProfileAuthKind defaults to oauth when authKind is absent", () => {
  expect(resolveProfileAuthKind({ authKind: undefined })).toBe("oauth");
});

test("resolveProfileAuthKind returns provider when authKind is provider", () => {
  expect(resolveProfileAuthKind({ authKind: "provider" })).toBe("provider");
});

test("resolveProfileAuthKind falls back to oauth for unrecognized values", () => {
  expect(
    resolveProfileAuthKind({ authKind: "junk" as unknown as "oauth" }),
  ).toBe("oauth");
});

test("isAllowedProviderEnvKey allows the fixed whitelist keys", () => {
  expect(isAllowedProviderEnvKey("ANTHROPIC_BASE_URL")).toBe(true);
  expect(isAllowedProviderEnvKey("ANTHROPIC_MODEL")).toBe(true);
  expect(isAllowedProviderEnvKey("ANTHROPIC_SMALL_FAST_MODEL")).toBe(true);
});

test("isAllowedProviderEnvKey allows ANTHROPIC_DEFAULT_*_MODEL(_NAME) tier keys", () => {
  expect(isAllowedProviderEnvKey("ANTHROPIC_DEFAULT_OPUS_MODEL")).toBe(true);
  expect(isAllowedProviderEnvKey("ANTHROPIC_DEFAULT_SONNET_MODEL_NAME")).toBe(
    true,
  );
});

test("isAllowedProviderEnvKey denies dangerous or unrelated keys", () => {
  expect(isAllowedProviderEnvKey("CLAUDE_CONFIG_DIR")).toBe(false);
  expect(isAllowedProviderEnvKey("ANTHROPIC_AUTH_TOKEN")).toBe(false);
  expect(isAllowedProviderEnvKey("ANTHROPIC_API_KEY")).toBe(false);
  expect(isAllowedProviderEnvKey("CLAUDE_CODE_OAUTH_TOKEN")).toBe(false);
  expect(isAllowedProviderEnvKey("CLAUDE_CODE_SUBPROCESS_ENV_SCRUB")).toBe(
    false,
  );
  expect(isAllowedProviderEnvKey("RANDOM_ENV_KEY")).toBe(false);
});
