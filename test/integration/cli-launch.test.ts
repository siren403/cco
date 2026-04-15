import { afterEach, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

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

test("misplaced isolate launch flag is rejected before Claude is spawned", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");

  const result = await runCli(["work", "--isolate"], sandbox, {});

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("--isolate");
  expect(result.stderr).toContain("cco --isolate work");
});

test("isolate launch flag before profile reaches the launch layer", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token");

  const result = await runCli(["--isolate", "work", "-c"], sandbox, {});

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("격리 home");
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
  expect(result.stdout).toContain(join(sandbox.ccoHome, "profiles", "work", "isolate", "claude"));
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

test("isolate fresh removes stale isolate before re-entering bootstrap flow", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "work", "overlay-token", "1", true);
  await seedIsolateHome(sandbox.ccoHome, "work");

  const result = await runCli(
    ["isolate", "fresh", "--yes", "work"],
    sandbox,
    {},
  );

  expect(result.exitCode).toBe(1);
  expect(result.stderr).toContain("격리 home");
  expect(await exists(join(sandbox.ccoHome, "profiles", "work", "isolate"))).toBe(false);
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
      STRICLI_SKIP_VERSION_CHECK: "1",
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
