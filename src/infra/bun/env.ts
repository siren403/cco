const SCRUBBED_ENV_KEYS = [
  "CLAUDE_CODE_OAUTH_TOKEN",
  "CLAUDE_CONFIG_DIR",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_VERTEX",
  "CLAUDE_CODE_USE_FOUNDRY",
] as const;

export function buildClaudeEnv(
  parentEnv: NodeJS.ProcessEnv,
  token?: string,
): Record<string, string> {
  const env: Record<string, string> = {};

  for (const [key, value] of Object.entries(parentEnv)) {
    if (typeof value === "string" && value.length > 0) {
      env[key] = value;
    }
  }

  for (const key of SCRUBBED_ENV_KEYS) {
    delete env[key];
  }

  env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB = "1";

  if (token) {
    env.CLAUDE_CODE_OAUTH_TOKEN = token;
  }

  return env;
}

export function findConflictingAuthEnv(
  env: NodeJS.ProcessEnv,
): readonly string[] {
  return SCRUBBED_ENV_KEYS.filter((key) => typeof env[key] === "string");
}
