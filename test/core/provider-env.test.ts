import { expect, test } from "bun:test";
import { buildProviderEnvOverrides } from "../../src/core/services/provider-env.ts";

test("buildProviderEnvOverrides injects baseUrl and token, no oauth token", () => {
  const overrides = buildProviderEnvOverrides(
    { baseUrl: "https://example.com/api" },
    "fake-token",
  );

  expect(overrides.ANTHROPIC_BASE_URL).toBe("https://example.com/api");
  expect(overrides.ANTHROPIC_AUTH_TOKEN).toBe("fake-token");
  expect(overrides.CLAUDE_CODE_OAUTH_TOKEN).toBeUndefined();
  expect(overrides.CLAUDE_CONFIG_DIR).toBeUndefined();
});

test("buildProviderEnvOverrides places baseUrl/token after provider.env so they win on conflict", () => {
  const overrides = buildProviderEnvOverrides(
    {
      baseUrl: "https://correct.example.com/api",
      env: {
        ANTHROPIC_BASE_URL: "https://stale.example.com/api",
        ANTHROPIC_MODEL: "fake-model",
      },
    },
    "fake-token",
  );

  expect(overrides.ANTHROPIC_BASE_URL).toBe("https://correct.example.com/api");
  expect(overrides.ANTHROPIC_MODEL).toBe("fake-model");
  expect(overrides.ANTHROPIC_AUTH_TOKEN).toBe("fake-token");
});

test("buildProviderEnvOverrides never emits CLAUDE_CODE_OAUTH_TOKEN even if present in provider.env", () => {
  const overrides = buildProviderEnvOverrides(
    {
      baseUrl: "https://example.com/api",
      env: {
        ANTHROPIC_MODEL: "fake-model",
      },
    },
    "fake-token",
  );

  expect(Object.keys(overrides)).not.toContain("CLAUDE_CODE_OAUTH_TOKEN");
  expect(Object.keys(overrides)).not.toContain("CLAUDE_CONFIG_DIR");
});
