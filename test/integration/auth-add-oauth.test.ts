import { afterEach, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

test("auth add (oauth) saves a profile without prompting for env mode and without a stored env override", async () => {
  const sandbox = await createSandbox();

  const result = await runInteractiveCliWithSteps(
    ["auth", "add", "testoauth"],
    sandbox,
    [{ keystroke: "fake-oauth-token\r", waitForStdout: "Paste the verified setup token" }],
  );

  expect(result.exitCode).toBe(0);
  expect(result.stdout).not.toContain("Subprocess auth env policy");
  expect(result.stdout).not.toContain("keep auth env visible");
  expect(result.stdout).toContain("Subprocess auth env protection is ON by default");

  const profiles = JSON.parse(
    await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
  ) as {
    profiles: Array<{
      id: string;
      tokenRef?: string;
      env?: { CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?: string };
    }>;
  };
  const saved = profiles.profiles.find((profile) => profile.id === "testoauth");
  expect(saved).toBeDefined();
  expect(saved?.tokenRef).toBe("testoauth");
  expect(saved?.env).toBeUndefined();

  const storedToken = await readFile(
    join(sandbox.ccoHome, "tokens", "testoauth.token"),
    "utf8",
  );
  expect(storedToken.trim()).toBe("fake-oauth-token");
});

test("auth add (oauth) re-adding an existing profile preserves its stored env policy", async () => {
  const sandbox = await createSandbox();
  await writeFile(
    join(sandbox.ccoHome, "profiles.json"),
    JSON.stringify(
      {
        profiles: [
          {
            id: "testoauth",
            label: "testoauth",
            kind: "overlay",
            tokenRef: "testoauth",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
            env: { CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0" },
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  const result = await runInteractiveCliWithSteps(
    ["auth", "add", "testoauth"],
    sandbox,
    [{ keystroke: "fake-oauth-token-2\r", waitForStdout: "Paste the verified setup token" }],
  );

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("Saved runtime policy: compat mode.");

  const profiles = JSON.parse(
    await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
  ) as {
    profiles: Array<{ env?: { CLAUDE_CODE_SUBPROCESS_ENV_SCRUB?: string } }>;
  };
  expect(profiles.profiles[0]?.env?.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
});

test("auth add reports Claude API limits separately from invalid tokens", async () => {
  const sandbox = await createSandbox();

  const result = await runInteractiveCliWithSteps(
    ["auth", "add", "limited"],
    sandbox,
    [{ keystroke: "fake-api-error-429\r", waitForStdout: "Paste the verified setup token" }],
  );

  const output = `${result.stdout}\n${result.stderr}`;
  expect(result.exitCode).toBe(1);
  expect(output).toContain("You have reached a Claude usage or rate limit.");
  expect(output).toContain("HTTP 429: You've hit your limit · resets 9pm (Asia/Seoul)");
  expect(output).not.toContain("Token verification failed.");
  expect(output).not.toContain('"api_error_status"');
});

interface Sandbox {
  readonly root: string;
  readonly ccoHome: string;
  readonly logPath: string;
  readonly launcherPath: string;
}

async function createSandbox(): Promise<Sandbox> {
  const root = await mkdtemp(join(tmpdir(), "cco-auth-oauth-"));
  createdDirs.push(root);

  const ccoHome = join(root, ".cco");
  const logPath = join(root, "fake-claude-log.json");
  const launcherPath = await createLauncher(root);
  await mkdir(join(ccoHome, "tokens"), { recursive: true });

  return { root, ccoHome, logPath, launcherPath };
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

interface InteractiveStep {
  readonly keystroke: string;
  readonly waitForStdout?: string;
}

async function runInteractiveCliWithSteps(
  args: readonly string[],
  sandbox: Sandbox,
  steps: readonly InteractiveStep[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn({
    cmd: [process.execPath, "run", "./src/cli.ts", "--", ...args],
    cwd: resolve(import.meta.dir, "..", ".."),
    env: {
      ...process.env,
      CCO_HOME: sandbox.ccoHome,
      CCO_CLAUDE_BIN: sandbox.launcherPath,
      CCO_LOCALE: "en",
      FAKE_CLAUDE_LOG: sandbox.logPath,
      HOME: sandbox.root,
      STRICLI_SKIP_VERSION_CHECK: "1",
      USERPROFILE: sandbox.root,
    },
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitedPromise = proc.exited;
  const reader = proc.stdout.getReader();
  const decoder = new TextDecoder();
  let collectedStdout = "";
  let streamDone = false;
  let pendingRead: Promise<{ value?: Uint8Array; done: boolean }> | null = null;

  async function pumpUntil(marker: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (!streamDone && !collectedStdout.includes(marker)) {
      if (Date.now() > deadline) {
        return;
      }

      if (!pendingRead) {
        pendingRead = reader.read();
      }

      const timedOut = Symbol("timeout");
      const result = await Promise.race([
        pendingRead,
        new Promise<typeof timedOut>((resolve) => setTimeout(() => resolve(timedOut), 25)),
      ]);

      if (result === timedOut) {
        continue;
      }

      pendingRead = null;
      if (result.value) {
        collectedStdout += decoder.decode(result.value);
      }
      if (result.done) {
        streamDone = true;
      }
    }
  }

  for (const step of steps) {
    if (step.waitForStdout !== undefined) {
      await pumpUntil(step.waitForStdout, 10_000);
    }
    proc.stdin.write(step.keystroke);
  }

  await proc.stdin.end();

  while (!streamDone) {
    const result = await (pendingRead ?? reader.read());
    pendingRead = null;
    if (result.value) {
      collectedStdout += decoder.decode(result.value);
    }
    if (result.done) {
      streamDone = true;
    }
  }

  const [exitCode, stderr] = await Promise.all([
    exitedPromise,
    new Response(proc.stderr).text(),
  ]);

  return { exitCode, stdout: collectedStdout, stderr };
}
