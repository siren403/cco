import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ensureLinkedClaudeProjectSessionStore,
  encodeClaudeProjectKey,
  findLatestClaudeProjectSession,
  importClaudeProjectSession,
} from "../../src/core/services/isolate-session-continuity.ts";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

test("findLatestClaudeProjectSession picks the newest project session and ignores history", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-session-continuity-"));
  createdDirs.push(root);

  const cwd = join(root, "repo");
  const hostConfigDir = join(root, ".claude");
  const projectKey = encodeClaudeProjectKey(cwd);
  const projectDir = join(hostConfigDir, "projects", projectKey);
  await mkdir(projectDir, { recursive: true });
  await mkdir(cwd, { recursive: true });

  const olderSession = join(projectDir, "session-old.jsonl");
  const newerSession = join(projectDir, "session-new.jsonl");
  await writeFile(join(projectDir, "history.jsonl"), "prompt history\n", "utf8");
  await writeFile(olderSession, "old session\n", "utf8");
  await writeFile(newerSession, "new session\n", "utf8");
  await utimes(olderSession, new Date("2026-04-20T00:00:00.000Z"), new Date("2026-04-20T00:00:00.000Z"));
  await utimes(newerSession, new Date("2026-04-21T00:00:00.000Z"), new Date("2026-04-21T00:00:00.000Z"));

  const latest = await findLatestClaudeProjectSession(hostConfigDir, cwd);

  expect(latest?.sessionId).toBe("session-new");
  expect(latest?.projectKey).toBe(projectKey);
  expect(latest?.sessionFile).toBe(newerSession);
});

test("importClaudeProjectSession copies the selected session into the isolate home", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-session-continuity-"));
  createdDirs.push(root);

  const cwd = join(root, "repo");
  const sourceFile = join(root, "session-123.jsonl");
  const isolateConfigDir = join(root, "isolate", "claude");
  const projectKey = encodeClaudeProjectKey(cwd);
  await mkdir(cwd, { recursive: true });
  await writeFile(sourceFile, "session body\n", "utf8");

  const result = await importClaudeProjectSession({
    isolateConfigDir,
    importedAt: "2026-04-21T01:00:00.000Z",
    session: {
      sessionId: "session-123",
      projectKey,
      sessionFile: sourceFile,
      updatedAt: "2026-04-21T00:00:00.000Z",
    },
  });

  expect(result.sessionId).toBe("session-123");
  expect(result.projectKey).toBe(projectKey);
  expect(result.targetFile).toBe(
    join(isolateConfigDir, "projects", projectKey, "session-123.jsonl"),
  );
  expect(await readFile(result.targetFile, "utf8")).toBe("session body\n");
});

test("ensureLinkedClaudeProjectSessionStore migrates an isolate-local project store into the host store", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-session-continuity-"));
  createdDirs.push(root);

  const cwd = join(root, "repo");
  const hostConfigDir = join(root, ".claude");
  const isolateConfigDir = join(root, ".cco", "profiles", "work", "isolate", "claude");
  const projectKey = encodeClaudeProjectKey(cwd);
  const isolateProjectDir = join(isolateConfigDir, "projects", projectKey);
  const hostProjectDir = join(hostConfigDir, "projects", projectKey);
  await mkdir(isolateProjectDir, { recursive: true });
  await mkdir(cwd, { recursive: true });
  await writeFile(join(isolateProjectDir, "session-local.jsonl"), "local session\n", "utf8");

  const result = await ensureLinkedClaudeProjectSessionStore({
    hostConfigDir,
    isolateConfigDir,
    cwd,
  });

  expect(result.projectKey).toBe(projectKey);
  expect(await readFile(join(hostProjectDir, "session-local.jsonl"), "utf8")).toBe("local session\n");

  await writeFile(join(hostProjectDir, "session-host.jsonl"), "host session\n", "utf8");
  expect(await readFile(join(isolateProjectDir, "session-host.jsonl"), "utf8")).toBe("host session\n");
});
