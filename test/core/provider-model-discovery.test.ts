import { expect, test } from "bun:test";
import {
  filterSuggestionsToAbsentTiers,
  parseModelIds,
  probeProviderModels,
  suggestTierMappings,
} from "../../src/core/services/provider-model-discovery.ts";

test("parseModelIds extracts ids from the Anthropic response shape", () => {
  const ids = parseModelIds({
    data: [
      { id: "claude-opus-4-8", type: "model" },
      { id: "claude-sonnet-4-8", type: "model" },
    ],
    has_more: false,
  });

  expect(ids).toEqual(["claude-opus-4-8", "claude-sonnet-4-8"]);
});

test("parseModelIds extracts ids from an OpenAI-compatible response shape", () => {
  const ids = parseModelIds({
    object: "list",
    data: [{ id: "gpt-fake-model" }, { id: "gpt-fake-model-mini" }],
  });

  expect(ids).toEqual(["gpt-fake-model", "gpt-fake-model-mini"]);
});

test("parseModelIds returns an empty list for an empty data array", () => {
  expect(parseModelIds({ data: [] })).toEqual([]);
});

test("parseModelIds returns an empty list for malformed or unexpected JSON", () => {
  expect(parseModelIds(null)).toEqual([]);
  expect(parseModelIds(undefined)).toEqual([]);
  expect(parseModelIds("a string")).toEqual([]);
  expect(parseModelIds(42)).toEqual([]);
  expect(parseModelIds({})).toEqual([]);
  expect(parseModelIds({ data: "not-an-array" })).toEqual([]);
  expect(parseModelIds({ data: [{ id: 123 }, { notId: "x" }, null] })).toEqual([]);
});

test("suggestTierMappings matches opus, sonnet, haiku, and fable tiers", () => {
  const mappings = suggestTierMappings([
    "claude-opus-4-8",
    "claude-sonnet-4-8",
    "claude-haiku-4-8",
    "fable-5",
  ]);

  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("claude-opus-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME).toBe("claude-opus-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("claude-sonnet-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_SONNET_MODEL_NAME).toBe("claude-sonnet-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("claude-haiku-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME).toBe("claude-haiku-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_FABLE_MODEL).toBe("fable-5");
  expect(mappings.ANTHROPIC_DEFAULT_FABLE_MODEL_NAME).toBe("fable-5");
});

test("suggestTierMappings prefers the shortest non-suffixed id over a [1M] variant", () => {
  const mappings = suggestTierMappings([
    "claude-opus-4-8[1m]",
    "claude-opus-4-8",
  ]);

  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("claude-opus-4-8");
  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME).toBe("claude-opus-4-8");
});

test("suggestTierMappings uses the suffixed id for MODEL only when it is the sole match", () => {
  const mappings = suggestTierMappings(["claude-opus-4-8[1m]"]);

  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("claude-opus-4-8[1m]");
  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME).toBe("claude-opus-4-8");
});

test("suggestTierMappings omits tiers with no match", () => {
  const mappings = suggestTierMappings(["claude-opus-4-8"]);

  expect(mappings.ANTHROPIC_DEFAULT_OPUS_MODEL).toBeDefined();
  expect(mappings.ANTHROPIC_DEFAULT_SONNET_MODEL).toBeUndefined();
  expect(mappings.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBeUndefined();
  expect(mappings.ANTHROPIC_DEFAULT_FABLE_MODEL).toBeUndefined();
});

test("suggestTierMappings returns an empty object for no matches at all", () => {
  expect(suggestTierMappings([])).toEqual({});
  expect(suggestTierMappings(["gpt-4", "gpt-3.5"])).toEqual({});
});

test("filterSuggestionsToAbsentTiers keeps tiers with no existing representation", () => {
  const suggestions = suggestTierMappings(["claude-opus-4-8", "claude-sonnet-4-8"]);
  const missing = filterSuggestionsToAbsentTiers(suggestions, undefined);

  expect(missing).toEqual(suggestions);
});

test("filterSuggestionsToAbsentTiers drops a whole tier when only one of its two keys already exists", () => {
  const suggestions = suggestTierMappings(["claude-opus-4-8", "claude-sonnet-4-8"]);
  const missing = filterSuggestionsToAbsentTiers(suggestions, {
    ANTHROPIC_DEFAULT_OPUS_MODEL: "file-pinned-opus-model",
  });

  expect(missing.ANTHROPIC_DEFAULT_OPUS_MODEL).toBeUndefined();
  expect(missing.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME).toBeUndefined();
  expect(missing.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("claude-sonnet-4-8");
  expect(missing.ANTHROPIC_DEFAULT_SONNET_MODEL_NAME).toBe("claude-sonnet-4-8");
});

test("filterSuggestionsToAbsentTiers returns an empty object when all tiers are already present", () => {
  const suggestions = suggestTierMappings(["claude-opus-4-8"]);
  const missing = filterSuggestionsToAbsentTiers(suggestions, {
    ANTHROPIC_DEFAULT_OPUS_MODEL_NAME: "file-pinned-opus-model",
  });

  expect(missing).toEqual({});
});

test("probeProviderModels returns ok:false with reason unavailable on a 404", async () => {
  const fetchImpl = (async () =>
    new Response("not found", { status: 404 })) as unknown as typeof fetch;

  const result = await probeProviderModels(
    "https://example.com/api",
    "fake-token",
    fetchImpl,
  );

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.reason).toBe("unavailable");
  }
});

test("probeProviderModels returns ok:false with reason unavailable on timeout/network error", async () => {
  const fetchImpl = (async () => {
    throw new Error("network timeout");
  }) as unknown as typeof fetch;

  const result = await probeProviderModels(
    "https://example.com/api",
    "fake-token",
    fetchImpl,
  );

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.reason).toBe("unavailable");
  }
});

test("probeProviderModels returns ok:false with reason auth on repeated 401s", async () => {
  const fetchImpl = (async () =>
    new Response("unauthorized", { status: 401 })) as unknown as typeof fetch;

  const result = await probeProviderModels(
    "https://example.com/api",
    "fake-token",
    fetchImpl,
  );

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.reason).toBe("auth");
  }
});

test("probeProviderModels falls back from bearer auth to x-api-key and succeeds", async () => {
  const seenHeaders: Array<Record<string, string>> = [];
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    const headers = Object.fromEntries(
      new Headers(init?.headers as Record<string, string>).entries(),
    );
    seenHeaders.push(headers);

    if (headers.authorization) {
      return new Response("unauthorized", { status: 401 });
    }

    return new Response(
      JSON.stringify({ data: [{ id: "claude-opus-4-8" }] }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;

  const result = await probeProviderModels(
    "https://example.com/api",
    "fake-token",
    fetchImpl,
  );

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.modelIds).toEqual(["claude-opus-4-8"]);
  }
  expect(seenHeaders.length).toBe(2);
  expect(seenHeaders[0]?.authorization).toBe("Bearer fake-token");
  expect(seenHeaders[1]?.["x-api-key"]).toBe("fake-token");
});

test("probeProviderModels never includes the token value in any thrown/returned data", async () => {
  const fetchImpl = (async () => {
    throw new Error("boom");
  }) as unknown as typeof fetch;

  const result = await probeProviderModels(
    "https://example.com/api",
    "super-secret-token-value",
    fetchImpl,
  );

  expect(JSON.stringify(result)).not.toContain("super-secret-token-value");
});
