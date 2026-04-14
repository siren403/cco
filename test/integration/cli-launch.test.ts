import { afterEach, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

test("overlay launch respects per-profile subprocess env policy", async () => {
  const sandbox = await createSandbox();
  await seedOverlayProfile(sandbox.ccoHome, "compat", "overlay-token", "0");

  const result = await runCli(["compat", "-c"], sandbox, {});

  expect(result.exitCode).toBe(0);

  const log = await readFakeClaudeLog(sandbox.logPath);
  expect(log.env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
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
): Promise<void> {
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

async function readFakeClaudeLog(logPath: string): Promise<{
  args: string[];
  env: Record<string, string | null>;
}> {
  return JSON.parse(await readFile(logPath, "utf8"));
}
