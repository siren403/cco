import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonProfileStore } from "../../src/infra/fs/json-profile-store.ts";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

test("concurrent writers do not clobber each other's profiles", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const storeA = new JsonProfileStore(join(root, "profiles.json"));
  const storeB = new JsonProfileStore(join(root, "profiles.json"));

  await Promise.all([
    storeA.put({
      id: "alpha",
      label: "alpha",
      kind: "overlay",
      tokenRef: "alpha",
      createdAt: "2026-04-14T00:00:00.000Z",
      updatedAt: "2026-04-14T00:00:00.000Z",
      env: {
        CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "1",
      },
    }),
    storeB.put({
      id: "beta",
      label: "beta",
      kind: "overlay",
      tokenRef: "beta",
      createdAt: "2026-04-14T00:00:00.000Z",
      updatedAt: "2026-04-14T00:00:00.000Z",
      env: {
        CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
      },
    }),
  ]);

  const profiles = await storeA.list();
  expect(profiles.map((profile) => profile.id)).toEqual(["alpha", "beta"]);
});

test("store normalizes manual env edits from profiles.json", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const filePath = join(root, "profiles.json");
  await writeFile(
    filePath,
    JSON.stringify(
      {
        profiles: [
          {
            id: "compat",
            label: "compat",
            kind: "overlay",
            tokenRef: "compat",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
            env: {
              CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
            },
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  const store = new JsonProfileStore(filePath);
  const profile = await store.get("compat");

  expect(profile?.env?.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe("0");
});

test("store normalizes isolate metadata from profiles.json", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);
  const fakeCcoHome = "C:\\Users\\test-user\\.cco";
  const fakeClaudeHome = "C:\\Users\\test-user\\.claude";

  const filePath = join(root, "profiles.json");
  await writeFile(
    filePath,
    JSON.stringify(
      {
        schemaVersion: 1,
        profiles: [
          {
            id: "work",
            label: "work",
            kind: "overlay",
            tokenRef: "work",
            createdAt: "2026-04-15T00:00:00.000Z",
            updatedAt: "2026-04-15T00:00:00.000Z",
            isolate: {
              enabled: true,
              homeDir: `${fakeCcoHome}\\profiles\\work\\isolate\\claude`,
              state: "ready",
              seedPreset: "host-lite",
              source: {
                kind: "overlay",
                profileId: "work",
                configDir: fakeClaudeHome,
                fingerprint: "sha256:test",
              },
              manifestPath: `${fakeCcoHome}\\profiles\\work\\isolate\\manifest.json`,
              lastSeededAt: "2026-04-15T00:00:00.000Z",
              lastSyncedAt: "2026-04-15T00:00:00.000Z",
              continuity: {
                importedSessionId: "session-123",
                projectKey: "D--workspace--cco",
                importedAt: "2026-04-15T00:01:00.000Z",
              },
            },
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  const store = new JsonProfileStore(filePath);
  const profile = await store.get("work");

  expect(profile?.isolate?.enabled).toBe(true);
  expect(profile?.isolate?.state).toBe("ready");
  expect(profile?.isolate?.seedPreset).toBe("host-lite");
  expect(profile?.isolate?.source.profileId).toBe("work");
  expect(profile?.isolate?.source.configDir).toBe(fakeClaudeHome);
  expect(profile?.isolate?.continuity?.importedSessionId).toBe("session-123");
  expect(profile?.isolate?.continuity?.projectKey).toBe("D--workspace--cco");
});
