import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
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
    }),
    storeB.put({
      id: "beta",
      label: "beta",
      kind: "overlay",
      tokenRef: "beta",
      createdAt: "2026-04-14T00:00:00.000Z",
      updatedAt: "2026-04-14T00:00:00.000Z",
    }),
  ]);

  const profiles = await storeA.list();
  expect(profiles.map((profile) => profile.id)).toEqual(["alpha", "beta"]);
});
