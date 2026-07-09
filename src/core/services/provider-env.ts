import type { OverlayProviderConfig } from "../model/profile.ts";

export function buildProviderEnvOverrides(
  provider: OverlayProviderConfig,
  token: string,
): Record<string, string> {
  return {
    ...provider.env,
    ANTHROPIC_BASE_URL: provider.baseUrl,
    ANTHROPIC_AUTH_TOKEN: token,
  };
}
