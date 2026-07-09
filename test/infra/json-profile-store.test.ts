import { afterEach, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

test("provider profile round-trips without tokenRef and keeps provider fields", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const filePath = join(root, "profiles.json");
  const store = new JsonProfileStore(filePath);

  await store.put({
    id: "prov",
    label: "prov",
    kind: "overlay",
    authKind: "provider",
    createdAt: "2026-04-14T00:00:00.000Z",
    updatedAt: "2026-04-14T00:00:00.000Z",
    provider: {
      baseUrl: "https://example.com/api",
      model: "fake-model",
      env: {
        ANTHROPIC_MODEL: "fake-model",
      },
    },
  });

  const profile = await store.get("prov");

  expect(profile?.authKind).toBe("provider");
  expect(profile?.tokenRef).toBeUndefined();
  expect(profile?.provider?.baseUrl).toBe("https://example.com/api");
  expect(profile?.provider?.model).toBe("fake-model");
  expect(profile?.provider?.env?.ANTHROPIC_MODEL).toBe("fake-model");

  const raw = JSON.parse(await readFile(filePath, "utf8")) as {
    profiles: Array<Record<string, unknown>>;
  };
  const rawProfile = raw.profiles.find((item) => item.id === "prov");
  expect(rawProfile).toBeDefined();
  expect(Object.hasOwn(rawProfile ?? {}, "tokenRef")).toBe(false);
});

test("oauth profile without tokenRef is still dropped", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const filePath = join(root, "profiles.json");
  await writeFile(
    filePath,
    JSON.stringify(
      {
        schemaVersion: 1,
        profiles: [
          {
            id: "no-token",
            label: "no-token",
            kind: "overlay",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );

  const store = new JsonProfileStore(filePath);
  const profiles = await store.list();

  expect(profiles).toEqual([]);
});

test("provider profile without baseUrl is dropped", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const filePath = join(root, "profiles.json");
  await writeFile(
    filePath,
    JSON.stringify(
      {
        schemaVersion: 1,
        profiles: [
          {
            id: "no-base-url",
            label: "no-base-url",
            kind: "overlay",
            authKind: "provider",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
            provider: {
              model: "fake-model",
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
  const profiles = await store.list();

  expect(profiles).toEqual([]);
});

test("provider.env disallowed keys are stripped on read while the profile is kept", async () => {
  const root = await mkdtemp(join(tmpdir(), "cco-profiles-"));
  createdDirs.push(root);

  const filePath = join(root, "profiles.json");
  await writeFile(
    filePath,
    JSON.stringify(
      {
        schemaVersion: 1,
        profiles: [
          {
            id: "prov-env",
            label: "prov-env",
            kind: "overlay",
            authKind: "provider",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
            provider: {
              baseUrl: "https://example.com/api",
              env: {
                ANTHROPIC_MODEL: "fake-model",
                ANTHROPIC_AUTH_TOKEN: "fake-token",
                CLAUDE_CONFIG_DIR: "C:\\Users\\test-user\\.claude",
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
  const profile = await store.get("prov-env");

  expect(profile).not.toBeNull();
  expect(profile?.provider?.env?.ANTHROPIC_MODEL).toBe("fake-model");
  expect(profile?.provider?.env?.ANTHROPIC_AUTH_TOKEN).toBeUndefined();
  expect(profile?.provider?.env?.CLAUDE_CONFIG_DIR).toBeUndefined();
});
