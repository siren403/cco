import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

test("auth add --provider --from saves a profile without tokenRef and never spawns claude", async () => {
  const sandbox = await createSandbox();
  const fromPath = await writeCcswitchFile(sandbox.root, {
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-provider-token",
      ANTHROPIC_BASE_URL: "http://127.0.0.1:1",
      ANTHROPIC_API_KEY: "sk-should-never-be-imported",
    },
  });

  const result = await runInteractiveCli(
    ["auth", "add", "testprov", "--provider", "--from", fromPath],
    sandbox,
    "\r",
  );

  expect(result.exitCode).toBe(0);
  expect(result.stdout).not.toContain("sk-fake-provider-token");
  expect(result.stdout).not.toContain("sk-should-never-be-imported");
  expect(result.stderr).not.toContain("sk-fake-provider-token");
  expect(result.stdout).toContain("ANTHROPIC_API_KEY");

  const profiles = JSON.parse(
    await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
  ) as {
    profiles: Array<{
      id: string;
      authKind?: string;
      tokenRef?: string;
      provider?: { baseUrl: string };
    }>;
  };
  const saved = profiles.profiles.find((profile) => profile.id === "testprov");
  expect(saved).toBeDefined();
  expect(saved?.authKind).toBe("provider");
  expect(saved?.tokenRef).toBeUndefined();
  expect(saved?.provider?.baseUrl).toBe("http://127.0.0.1:1");
  expect(JSON.stringify(profiles)).not.toContain("sk-fake-provider-token");

  const storedToken = await readFile(
    join(sandbox.ccoHome, "tokens", "testprov.token"),
    "utf8",
  );
  expect(storedToken.trim()).toBe("sk-fake-provider-token");

  await expectPathMissing(sandbox.logPath);
});

test("auth add --provider --from probe warning proceeds with baseUrl+token only", async () => {
  const sandbox = await createSandbox();
  const fromPath = await writeCcswitchFile(sandbox.root, {
    env: {
      ANTHROPIC_AUTH_TOKEN: "sk-fake-provider-token",
      ANTHROPIC_BASE_URL: "http://127.0.0.1:1",
    },
  });

  const result = await runInteractiveCli(
    ["auth", "add", "testprov", "--provider", "--from", fromPath],
    sandbox,
    "\r",
  );

  expect(result.exitCode).toBe(0);
  expect(result.stderr).toContain("Warning:");
  expect(result.stdout).not.toContain("sk-fake-provider-token");
  expect(result.stderr).not.toContain("sk-fake-provider-token");
});

test("auth add --provider --from applies confirmed auto-discovered model mappings", async () => {
  await runMappingConfirmTest();
}, 20000);

async function runMappingConfirmTest(): Promise<void> {
  const sandbox = await createSandbox();
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/v1/models") {
        return new Response(
          JSON.stringify({ data: [{ id: "claude-opus-4-8" }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      return new Response("not found", { status: 404 });
    },
  });

  try {
    const fromPath = await writeCcswitchFile(sandbox.root, {
      env: {
        ANTHROPIC_AUTH_TOKEN: "sk-fake-provider-token",
        ANTHROPIC_BASE_URL: `http://127.0.0.1:${server.port}`,
      },
    });

    const result = await runInteractiveCliWithSteps(
      ["auth", "add", "testprov", "--provider", "--from", fromPath],
      sandbox,
      [
        { keystroke: "\r" },
        { keystroke: "\r", waitForStdout: "Fill in these env mappings" },
      ],
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ANTHROPIC_DEFAULT_OPUS_MODEL");

    const profiles = JSON.parse(
      await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
    ) as {
      profiles: Array<{ provider?: { env?: Record<string, string> } }>;
    };
    expect(profiles.profiles[0]?.provider?.env?.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe(
      "claude-opus-4-8",
    );
    expect(profiles.profiles[0]?.provider?.env?.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME).toBe(
      "claude-opus-4-8",
    );
  } finally {
    server.stop(true);
  }
}

test("auth add --provider --from keeps file-provided tier env values over probe suggestions", async () => {
  await runFilePinnedTierTest();
}, 20000);

async function runFilePinnedTierTest(): Promise<void> {
  const sandbox = await createSandbox();
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/v1/models") {
        return new Response(
          JSON.stringify({ data: [{ id: "claude-opus-4-8" }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      return new Response("not found", { status: 404 });
    },
  });

  try {
    const fromPath = await writeCcswitchFile(sandbox.root, {
      env: {
        ANTHROPIC_AUTH_TOKEN: "sk-fake-provider-token",
        ANTHROPIC_BASE_URL: `http://127.0.0.1:${server.port}`,
        ANTHROPIC_DEFAULT_OPUS_MODEL: "file-pinned-opus-model",
      },
    });

    const result = await runInteractiveCli(
      ["auth", "add", "testprov", "--provider", "--from", fromPath],
      sandbox,
      "\r",
    );

    expect(result.exitCode).toBe(0);

    const profiles = JSON.parse(
      await readFile(join(sandbox.ccoHome, "profiles.json"), "utf8"),
    ) as {
      profiles: Array<{ provider?: { env?: Record<string, string> } }>;
    };
    expect(profiles.profiles[0]?.provider?.env?.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe(
      "file-pinned-opus-model",
    );
  } finally {
    server.stop(true);
  }
}

test("auth add --provider --from rejects a ccswitch file missing the token without leaking other values", async () => {
  const sandbox = await createSandbox();
  const fromPath = await writeCcswitchFile(sandbox.root, {
    env: {
      ANTHROPIC_BASE_URL: "http://127.0.0.1:1",
    },
  });

  const result = await runInteractiveCli(
    ["auth", "add", "testprov", "--provider", "--from", fromPath],
    sandbox,
    "",
  );

  expect(result.exitCode).not.toBe(0);
  expect(result.stderr).toContain("ANTHROPIC_AUTH_TOKEN");
});

interface Sandbox {
  readonly root: string;
  readonly ccoHome: string;
  readonly logPath: string;
}

async function createSandbox(): Promise<Sandbox> {
  const root = await mkdtemp(join(tmpdir(), "cco-auth-provider-"));
  createdDirs.push(root);

  const ccoHome = join(root, ".cco");
  const logPath = join(root, "fake-claude-log.json");
  await mkdir(join(ccoHome, "tokens"), { recursive: true });

  return { root, ccoHome, logPath };
}

async function writeCcswitchFile(root: string, config: unknown): Promise<string> {
  const path = join(root, "ccswitch.json");
  await writeFile(path, JSON.stringify(config, null, 2), "utf8");
  return path;
}

async function runInteractiveCli(
  args: readonly string[],
  sandbox: Sandbox,
  stdinInput: string | readonly string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return runInteractiveCliWithSteps(
    args,
    sandbox,
    (typeof stdinInput === "string" ? [stdinInput] : stdinInput)
      .filter((keystroke) => keystroke.length > 0)
      .map((keystroke) => ({ keystroke })),
  );
}

interface InteractiveStep {
  readonly keystroke: string;
  /**
   * If set, wait until this text appears in the process's stdout so far
   * before sending the keystroke. This mirrors real human timing: a person
   * only answers a prompt after seeing it rendered. Sending keystrokes on a
   * fixed delay instead of waiting for the actual prompt text is flaky,
   * since prompts that follow network I/O (e.g. the /v1/models probe) do
   * not render on a predictable schedule.
   */
  readonly waitForStdout?: string;
}

async function runInteractiveCliWithSteps(
  args: readonly string[],
  sandbox: Sandbox,
  steps: readonly InteractiveStep[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn({
    cmd: [process.execPath, "run", "./src/cli.ts", "--", ...args],
    cwd: join(import.meta.dir, "..", ".."),
    env: {
      ...process.env,
      CCO_HOME: sandbox.ccoHome,
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
  // ReadableStreamDefaultReader only supports one in-flight read() call at a
  // time. Keep a single pending read and race a timeout against it just to
  // re-check the loop condition periodically, without ever issuing a second
  // overlapping read() (which silently corrupts/drops chunks).
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

  // Drain any remaining stdout after the last keystroke. Reuse a pending
  // read left over from pumpUntil's timeout instead of issuing a second
  // overlapping read() call.
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

async function expectPathMissing(path: string): Promise<void> {
  const file = Bun.file(path);
  expect(await file.exists()).toBe(false);
}
