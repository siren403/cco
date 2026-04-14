import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { acquireSessionLock } from "../../src/infra/fs/session-lock.ts";

test("session locks are keyed by project and profile and can be released", async () => {
  const locksDir = await mkdtemp(join(tmpdir(), "cco-locks-"));

  const lock = await acquireSessionLock({
    locksDir,
    pid: process.pid,
    projectKey: "d:/workspace/app",
    profileId: "work",
    now: "2026-04-14T00:00:00.000Z",
  });

  await expect(
    acquireSessionLock({
      locksDir,
      pid: process.pid,
      projectKey: "d:/workspace/app",
      profileId: "work",
      now: "2026-04-14T00:00:01.000Z",
    }),
  ).rejects.toThrow(/already using profile "work"/);

  await expect(
    acquireSessionLock({
      locksDir,
      pid: process.pid,
      projectKey: "d:/workspace/app",
      profileId: "personal",
      now: "2026-04-14T00:00:01.000Z",
    }),
  ).resolves.toBeDefined();

  await lock.release();

  await expect(
    acquireSessionLock({
      locksDir,
      pid: process.pid,
      projectKey: "d:/workspace/app",
      profileId: "work",
      now: "2026-04-14T00:00:02.000Z",
    }),
  ).resolves.toBeDefined();
});
