import { existsSync } from "node:fs";
import { join } from "node:path";

export function resolveClaudeBinary(env: NodeJS.ProcessEnv): string {
  if (env.CCO_CLAUDE_BIN) {
    return env.CCO_CLAUDE_BIN;
  }

  const detected = Bun.which("claude");
  if (detected) {
    return detected;
  }

  const localAppData = env.LOCALAPPDATA;
  if (localAppData) {
    const windowsClaude = join(localAppData, "Programs", "Claude", "claude.exe");
    if (existsSync(windowsClaude)) {
      return windowsClaude;
    }
  }

  return "claude";
}
