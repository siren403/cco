export function parseModelIds(json: unknown): string[] {
  if (!json || typeof json !== "object") {
    return [];
  }

  const data = (json as Record<string, unknown>).data;
  if (!Array.isArray(data)) {
    return [];
  }

  const ids: string[] = [];
  for (const entry of data) {
    if (entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).id === "string") {
      ids.push((entry as Record<string, unknown>).id as string);
    }
  }

  return ids;
}

const MODEL_TIERS = ["opus", "sonnet", "haiku", "fable"] as const;
type ModelTier = (typeof MODEL_TIERS)[number];

const SUFFIX_PATTERN = /\s*\[[^\]]*\]\s*$/;

export function suggestTierMappings(modelIds: readonly string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const tier of MODEL_TIERS) {
    const match = findTierMatch(tier, modelIds);
    if (!match) {
      continue;
    }

    const tierKey = tier.toUpperCase();
    result[`ANTHROPIC_DEFAULT_${tierKey}_MODEL`] = match.model;
    result[`ANTHROPIC_DEFAULT_${tierKey}_MODEL_NAME`] = match.name;
  }

  return result;
}

function findTierMatch(
  tier: ModelTier,
  modelIds: readonly string[],
): { readonly model: string; readonly name: string } | undefined {
  const matches = modelIds.filter((id) => id.toLowerCase().includes(tier));
  if (matches.length === 0) {
    return undefined;
  }

  const nonSuffixed = matches.filter((id) => !SUFFIX_PATTERN.test(id));
  if (nonSuffixed.length > 0) {
    const shortest = pickShortest(nonSuffixed);
    return { model: shortest, name: shortest };
  }

  const soleMatch = pickShortest(matches);
  return { model: soleMatch, name: stripSuffix(soleMatch) };
}

function stripSuffix(id: string): string {
  return id.replace(SUFFIX_PATTERN, "").trim();
}

function pickShortest(ids: readonly string[]): string {
  return ids.reduce((shortest, candidate) =>
    candidate.length < shortest.length ? candidate : shortest,
  );
}

const TIER_KEY_PATTERN = /^(.*)_MODEL(?:_NAME)?$/;

/**
 * Keeps only the suggested tiers that have no representation at all in
 * `existingEnv` yet. A tier is considered present as soon as either its
 * `_MODEL` or `_MODEL_NAME` key already exists, so imported (`--from`) values
 * always win and partially-set tiers are not silently topped up.
 */
export function filterSuggestionsToAbsentTiers(
  suggestions: Readonly<Record<string, string>>,
  existingEnv: Readonly<Record<string, string>> | undefined,
): Record<string, string> {
  const tierKeys = new Map<string, string[]>();
  for (const key of Object.keys(suggestions)) {
    const tier = key.match(TIER_KEY_PATTERN)?.[1] ?? key;
    const keys = tierKeys.get(tier) ?? [];
    keys.push(key);
    tierKeys.set(tier, keys);
  }

  const result: Record<string, string> = {};
  for (const keys of tierKeys.values()) {
    const alreadyPresent = keys.some((key) => existingEnv && key in existingEnv);
    if (alreadyPresent) {
      continue;
    }

    for (const key of keys) {
      result[key] = suggestions[key]!;
    }
  }

  return result;
}

export type ProviderModelProbeOutcome =
  | { readonly ok: true; readonly modelIds: readonly string[] }
  | { readonly ok: false; readonly reason: "auth" | "unavailable" };

const PROBE_TIMEOUT_MS = 5_000;

export async function probeProviderModels(
  baseUrl: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderModelProbeOutcome> {
  const url = buildModelsUrl(baseUrl);
  const headerAttempts: ReadonlyArray<Record<string, string>> = [
    { Authorization: `Bearer ${token}` },
    { "x-api-key": token, "anthropic-version": "2023-06-01" },
  ];

  let lastStatus: number | undefined;

  for (const headers of headerAttempts) {
    try {
      const response = await fetchImpl(url, {
        headers,
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });

      if (response.ok) {
        const json: unknown = await response.json().catch(() => null);
        return { ok: true, modelIds: parseModelIds(json) };
      }

      lastStatus = response.status;
    } catch {
      // Network error, timeout, or abort: fall through and try the next header shape.
    }
  }

  return {
    ok: false,
    reason: lastStatus === 401 || lastStatus === 403 ? "auth" : "unavailable",
  };
}

function buildModelsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/v1/models`;
}
