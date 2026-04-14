import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DomainError } from "../../core/errors/domain-error.ts";

interface SessionLockRecord {
  readonly pid: number;
  readonly projectKey: string;
  readonly profileId: string;
  readonly acquiredAt: string;
}

export interface SessionLockHandle {
  readonly key: string;
  release(): Promise<void>;
}

export async function acquireSessionLock(input: {
  readonly locksDir: string;
  readonly pid: number;
  readonly projectKey: string;
  readonly profileId: string;
  readonly now: string;
}): Promise<SessionLockHandle> {
  const key = `${input.projectKey}::${input.profileId}`;
  const lockId = createHash("sha256").update(key).digest("hex");
  const lockDir = join(input.locksDir, lockId);
  const infoPath = join(lockDir, "info.json");

  try {
    await mkdir(lockDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }

    const existing = await readLockRecord(infoPath);
    if (existing && !isProcessAlive(existing.pid)) {
      await rm(lockDir, { force: true, recursive: true });
      return acquireSessionLock(input);
    }

    throw new DomainError(
      "SESSION_LOCKED",
      `Another cco session is already using profile "${input.profileId}" in this project. Open a different profile, wait for the existing session to exit, or add slot support before running parallel same-profile sessions.`,
    );
  }

  const record: SessionLockRecord = {
    pid: input.pid,
    projectKey: input.projectKey,
    profileId: input.profileId,
    acquiredAt: input.now,
  };

  await writeFile(infoPath, JSON.stringify(record, null, 2), "utf8");

  return {
    key,
    async release() {
      await rm(lockDir, { force: true, recursive: true });
    },
  };
}

async function readLockRecord(path: string): Promise<SessionLockRecord | null> {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content) as SessionLockRecord;
  } catch {
    return null;
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") {
      return false;
    }

    return true;
  }
}
