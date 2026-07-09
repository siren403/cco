import { DomainError } from "../errors/domain-error.ts";
import { isAllowedProviderEnvKey, type OverlayProviderConfig } from "../model/profile.ts";

export interface CcswitchImportResult {
  readonly token: string;
  readonly provider: OverlayProviderConfig;
  readonly droppedKeys: readonly string[];
  readonly notices: readonly string[];
}

const SKIP_DANGEROUS_MODE_KEY = "skipDangerousModePermissionPrompt";

export function parseCcswitchConfig(raw: unknown): CcswitchImportResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new DomainError(
      "CCSWITCH_IMPORT_INVALID",
      "ccswitch config must be a JSON object.",
    );
  }

  const root = raw as Record<string, unknown>;
  const envValue = root.env;
  if (!envValue || typeof envValue !== "object" || Array.isArray(envValue)) {
    throw new DomainError(
      "CCSWITCH_IMPORT_MISSING_ENV",
      "ccswitch config is missing an \"env\" object.",
    );
  }

  const env = envValue as Record<string, unknown>;
  const token = env.ANTHROPIC_AUTH_TOKEN;
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new DomainError(
      "CCSWITCH_IMPORT_MISSING_TOKEN",
      "ccswitch config is missing env.ANTHROPIC_AUTH_TOKEN.",
    );
  }

  const baseUrl = env.ANTHROPIC_BASE_URL;
  if (typeof baseUrl !== "string" || baseUrl.trim().length === 0) {
    throw new DomainError(
      "CCSWITCH_IMPORT_MISSING_BASE_URL",
      "ccswitch config is missing env.ANTHROPIC_BASE_URL.",
    );
  }

  const droppedKeys: string[] = [];
  const notices: string[] = [];
  const providerEnv: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (key === "ANTHROPIC_AUTH_TOKEN" || key === "ANTHROPIC_BASE_URL") {
      continue;
    }

    if (typeof value === "string" && isAllowedProviderEnvKey(key)) {
      providerEnv[key] = value;
    } else {
      droppedKeys.push(key);
    }
  }

  let model: string | undefined;
  for (const [key, value] of Object.entries(root)) {
    if (key === "env") {
      continue;
    }

    if (key === "model") {
      if (typeof value === "string" && value.trim().length > 0) {
        model = value;
      } else {
        droppedKeys.push(key);
      }
      continue;
    }

    if (key === SKIP_DANGEROUS_MODE_KEY) {
      droppedKeys.push(key);
      notices.push(
        `"${SKIP_DANGEROUS_MODE_KEY}" was dropped. cco never auto-enables dangerous permission flags.`,
      );
      continue;
    }

    droppedKeys.push(key);
  }

  const provider: OverlayProviderConfig = {
    baseUrl,
    model,
    env: Object.keys(providerEnv).length > 0 ? providerEnv : undefined,
  };

  return {
    token: token.trim(),
    provider,
    droppedKeys,
    notices,
  };
}
