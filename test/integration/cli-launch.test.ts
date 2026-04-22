import { afterEach, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { encodeClaudeProjectKey } from "../../src/core/services/isolate-session-continuity.ts";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

test("overlay launch injects overlay token and preserves host config env", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");

  const result = await runCli(["work", "-c"], sandbox, {
    CLAUDE_CONFIG_DIR: join(sandbox.root, "host-config"),
    ANTHROPIC_API_KEY: "should-be-scrubbed",
  });

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(log.env.CLAUDE_CODE_OAUTH_TOKEN).toBe("overlay-token");
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(join(sandbox.root, "host-config"));
  expect(log.env.ANTHROPIC_API_KEY).toBeNull();
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("1");
});

test("overlay native continue bridges the latest isolate session back into the host store", async () => {
  const sandbox = await createSandbox();
  const repoRoot = resolve(import.meta.dir, "..", "..");
  const projectKey = encodeClaudeProjectKey(repoRoot);
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1", true);
  await seedIsolateProjectSession(
    sandbox.ccoHome,
    "work",
    repoRoot,
    "session-back-123",
  );

  const result = await runCli(["work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(
    await readFile(
      join(
        sandbox.root,
        ".claude",
        "projects",
        projectKey,
        "session-back-123.jsonl",
      ),
      "utf8",
    ),
  ).toContain("\"isolate-backflow\"");
});

test("misplaced isolate launch flag is rejected before Claude is spawned", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");

  const result = await runCli(["work", "--isolate"], sandbox, {});

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("--isolate");
  expect(result.stderr).toContain("cco --isolate work");
});

test("isolate first launch bootstraps host-lite by default", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedHostClaudeConfig(sandbox.root);

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(
    join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"),
  );
  expect(log.env.CLAUDE_CODE_OAUTH_TOKEN).toBeNull();
  expect(
    await readFile(
      join(sandbox.ccoHome, "profiles", "work", "isolate", "claude", "settings.json"),
      "utf8",
    ),
  ).toContain("\"theme\": \"host-default\"");
});

test("isolate native continue on first launch imports the latest host session into the isolate store", async () => {
  const sandbox = await createSandbox();
  const repoRoot = resolve(import.meta.dir, "..", "..");
  const projectKey = encodeClaudeProjectKey(repoRoot);
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedHostClaudeProjectSession(sandbox.root, repoRoot, "session-continue-123");

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(
    await readFile(
      join(
        sandbox.ccoHome,
        "profiles",
        "work",
        "isolate",
        "claude",
        "projects",
        projectKey,
        "session-continue-123.jsonl",
      ),
      "utf8",
    ),
  ).toContain("\"continuity\"");
});

test("isolate launch uses the dedicated Claude home and omits overlay auth env", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedIsolateHome(sandbox.ccoHome, "work");

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {
    CLAUDE_CONFIG_DIR: join(sandbox.root, "host-config"),
  });

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(
    join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"),
  );
  expect(log.env.CLAUDE_CODE_OAUTH_TOKEN).toBeNull();
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBeNull();
});

test("isolate launch does not require the saved overlay token once isolate home exists", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedIsolateHome(sandbox.ccoHome, "work");
  await rm(join(sandbox.ccoHome, "tokens", "work.token"), { force: true });

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(
    join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"),
  );
  expect(log.env.CLAUDE_CODE_OAUTH_TOKEN).toBeNull();
});

test("isolate native continue bridges the latest host session when the isolate home exists but has no local session", async () => {
  const sandbox = await createSandbox();
  const repoRoot = resolve(import.meta.dir, "..", "..");
  const projectKey = encodeClaudeProjectKey(repoRoot);
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedIsolateHome(sandbox.ccoHome, "work");
  await seedHostClaudeProjectSession(sandbox.root, repoRoot, "session-continue-existing");

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["-c"]);
  expect(
    await readFile(
      join(
        sandbox.ccoHome,
        "profiles",
        "work",
        "isolate",
        "claude",
        "projects",
        projectKey,
        "session-continue-existing.jsonl",
      ),
      "utf8",
    ),
  ).toContain("\"continuity\"");
});

test("overlay launch respects per-profile subprocess env policy", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "compat", "overlay-token", "0");

  const result = await runCli(["compat", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
});

test("non-interactive shell scrub env can override safe mode for bypassPermissions", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(
    ["work", "--permission-mode", "bypassPermissions", "-c"],
    sandbox,
    {
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
    },
  );

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["--permission-mode", "bypassPermissions", "-c"]);
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
});

test("non-interactive shell scrub env also covers dangerously-skip-permissions", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(
    ["work", "--dangerously-skip-permissions", "-c"],
    sandbox,
    {
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
    },
  );

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["--dangerously-skip-permissions", "-c"]);
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
});

test("non-interactive shell scrub env can keep safe mode explicitly", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(
    ["work", "--permission-mode", "bypassPermissions", "-c"],
    sandbox,
    {
      CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "1",
    },
  );

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("1");
});

test("non-interactive safe profile with bypassPermissions errors without explicit policy", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(
    ["work", "--permission-mode", "bypassPermissions", "-c"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("CLAUDE_CODE_SUBPROCESS_ENV_SCRUB");
});

test("host launch omits overlay token and still preserves host config env", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["host", "--resume", "abc123"], sandbox, {
    CLAUDE_CONFIG_DIR: join(sandbox.root, "host-config"),
  });

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["--resume", "abc123"]);
  expect(log.env.CLAUDE_CODE_OAUTH_TOKEN).toBeNull();
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(join(sandbox.root, "host-config"));
});

test("showcase ink renders through Ink host in non-interactive mode", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["showcase", "ink"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("Ink showcase");
  expect(result.stdout).toContain("Responsive preview");
  expect(result.stderr).toBe("");
});

test("auth list renders through Ink host in non-interactive mode", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "0");

  const result = await runCli(["auth", "list"], sandbox, { CCO_LOCALE: "en" });

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("Profiles");
  expect(result.stdout).toContain("host [host] [host login]");
  expect(result.stdout).toContain("work [overlay] [stored] [compat mode]");
  expect(result.stderr).toBe("");
});

test("doctor renders through Ink host in non-interactive mode", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["doctor"], sandbox, {
    CCO_LOCALE: "en",
    ANTHROPIC_AUTH_TOKEN: "",
    ANTHROPIC_API_KEY: "",
  });

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("Doctor");
  expect(result.stdout).toContain("Runtime Snapshot");
  expect(result.stdout).toContain("Suggested ");
  expect(result.stderr).toBe("");
});

test("config get prints saved overlay scrub mode", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "0");

  const result = await runCli(["config", "get", "-p", "work"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB");
  expect(result.stdout).toContain("0 (compat mode)");
});

test("config set updates saved overlay scrub mode", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(
    ["config", "set", "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0", "-p", "work"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("프로필 설정 저장됨");

  const profiles = JSON.parse(
    await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
  ) as {
    profiles: Array<{ env?: { CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?: string } }>;
  };
  expect(
    profiles.profiles[0]?.env?.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB,
  ).toBe("0");
});

test("isolate status reports missing isolate when none is prepared", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1");

  const result = await runCli(["isolate", "status", "work"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("Isolate");
  expect(result.stdout).toContain("missing");

  const normalizedOutput = result.stdout
    .replace(/[│╭╮╰╯─]/g, "")
    .replace(/\s+/g, "");
  const expectedPath = join(
    sandbox.ccoHome,
    "profiles",
    "work",
    "isolate",
    "claude",
  ).replace(/\s+/g, "");

  expect(normalizedOutput).toContain(expectedPath);
});

test("isolate status reports continuity metadata when present", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(
    sandbox.ccoHome,
    "work",
    "overlay-token",
    "1",
    true,
    {
      importedSessionId: "session-123",
      projectKey: "D--workspace--cco",
      importedAt: "2026-04-21T09:00:00.000Z",
    },
  );
  await seedIsolateHome(sandbox.ccoHome, "work");

  const result = await runCli(["isolate", "status", "work"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("session-123");
  expect(result.stdout).toContain("D--workspace--cco");
  expect(result.stdout).toContain("2026-04-21T09:00:00.000Z");
});

test("isolate fresh --clean recreates the isolate home without host-lite seed", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1", true);
  await seedHostClaudeConfig(sandbox.root);

  const result = await runCli(
    ["isolate", "fresh", "--yes", "--clean", "work"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(0);
  expect(await exists(join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"))).toBe(true);
  expect(
    await exists(
      join(sandbox.ccoHome, "profiles", "work", "isolate", "claude", "settings.json"),
    ),
  ).toBe(false);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.env.CLAUDE_CONFIG_DIR).toBe(
    join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"),
  );
});

test("isolate fresh can import the latest host session as a one-time handoff", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");
  await seedHostClaudeProjectSession(sandbox.root, resolve(import.meta.dir, "..", ".."), "session-123");

  const result = await runCli(
    ["isolate", "fresh", "--yes", "--import-latest-host-session", "work"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.args).toEqual(["--resume", "session-123"]);
});

test("isolate remove deletes only the isolate home and clears metadata", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1", true);
  await seedIsolateHome(sandbox.ccoHome, "work");

  const result = await runCli(["isolate", "remove", "work", "--yes"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("격리 실행 환경");
  expect(await exists(join(sandbox.ccoHome, "profiles", "work", "isolate"))).toBe(false);
  expect(await exists(join(sandbox.ccoHome, "tokens", "work.token"))).toBe(true);

  const profiles = JSON.parse(
    await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
  ) as { profiles: Array<{ isolate?: unknown }> };
  expect(profiles.profiles[0]?.isolate).toBeUndefined();
});

test("isolate fresh removes stale isolate and re-enters bootstrap with the default host-lite path", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1", true);
  await seedIsolateHome(sandbox.ccoHome, "work");
  await seedHostClaudeConfig(sandbox.root);

  const result = await runCli(
    ["isolate", "fresh", "--yes", "work"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(0);
  expect(await exists(join(sandbox.ccoHome, "profiles", "work", "isolate"))).toBe(true);
  expect(
    await exists(
      join(sandbox.ccoHome, "profiles", "work", "isolate", "claude", "settings.json"),
    ),
  ).toBe(true);
});

test("auth help renders through Stricli Ink interception", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["auth", "--help"], sandbox, {});

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("사용법");
  expect(result.stdout).toContain("cco auth list");
  expect(result.stdout).toContain("명령");
  expect(result.stderr).toBe("");
});

test("config get parse errors render through Stricli Ink interception", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["config", "get"], sandbox, {});

  expect(result.exitCode).toBe(252);
  expect(result.stderr).toContain("문제 [error]");
  expect(result.stderr).toContain("Expected input for flag --profile");
  expect(result.stdout).toBe("");
});

test("unknown subcommands render through Stricli Ink interception", async () => {
  const sandbox = await createSandbox();

  const result = await runCli(["auth", "lissst"], sandbox, {});

  expect(result.exitCode).toBe(251);
  expect(result.stderr).toContain('입력 "lissst"에 해당하는 명령을 찾지 못했습니다.');
  expect(result.stderr).toContain("cco auth list");
  expect(result.stdout).toBe("");
});

interface Sandbox {
  readonly root: string;
  readonly ccoHome: string;
  readonly logPath: string;
  readonly launcherPath: string;
}

async function createSandbox(): Promise<Sandbox> {
  const root = await mkdtemp(join(tmpdir(), "cco-integration-"));
  createdDirs.push(root);

  const ccoHome = join(root, ".cco");
  const logPath = join(root, "fake-claude-log.json");
  const launcherPath = await createLauncher(root);

  await mkdir(join(ccoHome, "tokens"), { recursive: true });

  return {
    root,
    ccoHome,
    logPath,
    launcherPath,
  };
}

async function seedOverlayProfile(
  ccoHome: string,
  profileId: string,
  token: string,
  subprocessEnvScrub: "0" | "1" = "1",
  withIsolateMetadata = false,
  continuity?: {
    readonly importedSessionId: string;
    readonly projectKey: string;
    readonly importedAt: string;
  },
): Promise<void> {
  const isolateRoot = join(ccoHome, "profiles", profileId, "isolate");
  await writeFile(
    join(ccoHome, "profiles.json"),
    JSON.stringify(
      {
        profiles: [
          {
            id: profileId,
            label: profileId,
            kind: "overlay",
            tokenRef: profileId,
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
            env: {
              CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: subprocessEnvScrub,
            },
            isolate: withIsolateMetadata
              ? {
                  enabled: true,
                  homeDir: join(isolateRoot, "claude"),
                  state: "ready",
                  seedPreset: "host-lite",
                  source: {
                    kind: "overlay",
                    profileId,
                    configDir: join(ccoHome, "..", ".claude"),
                  },
                  manifestPath: join(isolateRoot, "manifest.json"),
                  lastSeededAt: "2026-04-15T00:00:00.000Z",
                  lastSyncedAt: "2026-04-15T00:00:00.000Z",
                  continuity,
                }
              : undefined,
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeFile(join(ccoHome, "tokens", `${profileId}.token`), `${token}\n`, "utf8");
}

async function seedIsolateHome(
  ccoHome: string,
  profileId: string,
): Promise<void> {
  const isolateRoot = join(ccoHome, "profiles", profileId, "isolate");
  await mkdir(join(isolateRoot, "claude"), { recursive: true });
  await writeFile(
    join(isolateRoot, "manifest.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        profileId,
        seedMode: "clean",
        sourceConfigDir: join(ccoHome, "..", ".claude"),
        createdAt: "2026-04-15T00:00:00.000Z",
        updatedAt: "2026-04-15T00:00:00.000Z",
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function runCli(
  args: readonly string[],
  sandbox: Sandbox,
  extraEnv: Record<string, string>,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn({
    cmd: [process.execPath, "run", "./src/cli.ts", "--", ...args],
    cwd: resolve(import.meta.dir, "..", ".."),
    env: {
      ...process.env,
      ...extraEnv,
      CCO_HOME: sandbox.ccoHome,
      CCO_CLAUDE_BIN: sandbox.launcherPath,
      FAKE_CLAUDE_LOG: sandbox.logPath,
      HOME: sandbox.root,
      STRICLI_SKIP_VERSION_CHECK: "1",
      USERPROFILE: sandbox.root,
    },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  return { exitCode, stdout, stderr };
}

async function createLauncher(root: string): Promise<string> {
  const fixturePath = resolve(import.meta.dir, "..", "fixtures", "fake-claude.ts");

  if (process.platform === "win32") {
    const launcherPath = join(root, "fake-claude.cmd");
    const command = `@echo off\r\n"${process.execPath}" "${fixturePath}" %*\r\n`;
    await writeFile(launcherPath, command, "utf8");
    return launcherPath;
  }

  const launcherPath = join(root, "fake-claude");
  const script = `#!/usr/bin/env sh\nexec "${process.execPath}" "${fixturePath}" "$@"\n`;
  await writeFile(launcherPath, script, "utf8");
  await chmod(launcherPath, 0o755);
  return launcherPath;
}

async function seedHostClaudeConfig(root: string): Promise<void> {
  const hostClaudeDir = join(root, ".claude");
  await mkdir(hostClaudeDir, { recursive: true });
  await writeFile(
    join(hostClaudeDir, "settings.json"),
    JSON.stringify({ theme: "host-default" }, null, 2),
    "utf8",
  );
}

async function seedHostClaudeProjectSession(
  root: string,
  cwd: string,
  sessionId: string,
): Promise<void> {
  const projectKey = encodeClaudeProjectKey(cwd);
  const projectDir = join(root, ".claude", "projects", projectKey);
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, `${sessionId}.jsonl`),
    JSON.stringify({ type: "user", text: "continuity" }),
    "utf8",
  );
}

async function seedIsolateProjectSession(
  ccoHome: string,
  profileId: string,
  cwd: string,
  sessionId: string,
): Promise<void> {
  const projectKey = encodeClaudeProjectKey(cwd);
  const projectDir = join(
    ccoHome,
    "profiles",
    profileId,
    "isolate",
    "claude",
    "projects",
    projectKey,
  );
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, `${sessionId}.jsonl`),
    JSON.stringify({ type: "assistant", text: "isolate-backflow" }),
    "utf8",
  );
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readFakeClaudeLog(logPath: string): Promise<{
  args: string[];
  env: Record<string, string | null>;
}> {
  return JSON.parse(await readFile(logPath, "utf8"));
}
