import { expect, test } from "bun:test";
import { DomainError } from "../../src/core/errors/domain-error.ts";
import { parseCcswitchConfig } from "../../src/core/services/ccswitch-import.ts";

test("parseCcswitchConfig extracts token, baseUrl, and whitelisted env", () => {
  const result = parseCcswitchConfig({
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      ANTHROPIC_BASE_URL: "https://example.com/api",
      ANTHROPIC_MODEL: "fake-model",
      ANTHROPIC_SMALL_FAST_MODEL: "fake-fast-model",
    },
  });

  expect(result.token).toBe("sk-fake-token");
  expect(result.provider.baseUrl).toBe("https://example.com/api");
  expect(result.provider.env).toEqual({
    ANTHROPIC_MODEL: "fake-model",
    ANTHROPIC_SMALL_FAST_MODEL: "fake-fast-model",
  });
  expect(result.droppedKeys).toEqual([]);
  expect(result.notices).toEqual([]);
});

test("parseCcswitchConfig drops non-whitelisted env keys and records names only", () => {
  const result = parseCcswitchConfig({
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      ANTHROPIC_BASE_URL: "https://example.com/api",
      ANTHROPIC_API_KEY: "sk-should-be-dropped",
      CLAUDE_CONFIG_DIR: "/should/be/dropped",
      CLAUDE_CODE_OAUTH_TOKEN: "should-be-dropped",
      RANDOM_ENV_KEY: "dropped-too",
    },
  });

  expect([...result.droppedKeys].sort()).toEqual(
    ["ANTHROPIC_API_KEY", "CLAUDE_CONFIG_DIR", "CLAUDE_CODE_OAUTH_TOKEN", "RANDOM_ENV_KEY"].sort(),
  );
  expect(result.provider.env).toBeUndefined();
  for (const dropped of result.droppedKeys) {
    expect(JSON.stringify(result)).not.toContain("sk-should-be-dropped");
    expect(JSON.stringify(result)).not.toContain("/should/be/dropped");
    expect(dropped).not.toContain("sk-");
  }
});

test("parseCcswitchConfig maps top-level model to provider.model", () => {
  const result = parseCcswitchConfig({
    model: "top-level-model",
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      ANTHROPIC_BASE_URL: "https://example.com/api",
      ANTHROPIC_MODEL: "env-model",
    },
  });

  expect(result.provider.model).toBe("top-level-model");
  expect(result.provider.env?.ANTHROPIC_MODEL).toBe("env-model");
});

test("parseCcswitchConfig drops skipDangerousModePermissionPrompt and adds a notice", () => {
  const result = parseCcswitchConfig({
    skipDangerousModePermissionPrompt: true,
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      ANTHROPIC_BASE_URL: "https://example.com/api",
    },
  });

  expect(result.droppedKeys).toContain("skipDangerousModePermissionPrompt");
  expect(result.notices.length).toBe(1);
  expect(result.notices[0]).toContain("skipDangerousModePermissionPrompt");
});

test("parseCcswitchConfig throws without leaking values when token is missing", () => {
  let caught: unknown;
  try {
    parseCcswitchConfig({
      env: {
        ANTHROPIC_BASE_URL: "https://example.com/api",
        SOME_SECRET_LOOKING_VALUE: "sk-super-secret-should-not-appear",
      },
    });
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(DomainError);
  const domainError = caught as DomainError;
  expect(domainError.code).toBe("CCSWITCH_IMPORT_MISSING_TOKEN");
  expect(domainError.message).not.toContain("sk-super-secret-should-not-appear");
});

test("parseCcswitchConfig throws without leaking values when baseUrl is missing", () => {
  let caught: unknown;
  try {
    parseCcswitchConfig({
      env: {
        ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      },
    });
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(DomainError);
  const domainError = caught as DomainError;
  expect(domainError.code).toBe("CCSWITCH_IMPORT_MISSING_BASE_URL");
  expect(domainError.message).not.toContain("sk-fake-token");
});

test("parseCcswitchConfig throws when env is missing entirely", () => {
  expect(() => parseCcswitchConfig({})).toThrow(DomainError);
  try {
    parseCcswitchConfig({});
  } catch (error) {
    expect((error as DomainError).code).toBe("CCSWITCH_IMPORT_MISSING_ENV");
  }
});

test("parseCcswitchConfig throws when the raw value is not an object", () => {
  expect(() => parseCcswitchConfig("not-an-object")).toThrow(DomainError);
  expect(() => parseCcswitchConfig(null)).toThrow(DomainError);
  expect(() => parseCcswitchConfig([])).toThrow(DomainError);
});

test("parseCcswitchConfig drops unknown top-level keys", () => {
  const result = parseCcswitchConfig({
    someUnknownTopLevelKey: "value",
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-token",
      ANTHROPIC_BASE_URL: "https://example.com/api",
    },
  });

  expect(result.droppedKeys).toContain("someUnknownTopLevelKey");
});
