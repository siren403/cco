import { expect, test } from "bun:test";
import { HOST_PROFILE } from "../../src/core/model/profile.ts";
import { renderDoctorPage } from "../../src/ui/views/doctor-page.ts";
import { renderProfilesPage } from "../../src/ui/views/profiles-page.ts";
import { renderRootHelp } from "../../src/ui/renderers/root-help.ts";

test("root help uses panel-based sections", () => {
  const output = renderRootHelp();

  expect(output).toContain("Quick Start");
  expect(output).toContain("Command Surface");
  expect(output).toContain("auth overlay");
});

test("profiles page shows inventory and next step", () => {
  const output = renderProfilesPage(
    [
      HOST_PROFILE,
      {
        id: "work",
        label: "work",
        kind: "overlay",
        tokenRef: "work",
        createdAt: "2026-04-14T00:00:00.000Z",
        updatedAt: "2026-04-14T00:00:00.000Z",
      },
    ],
    new Map([["work", true]]),
  );

  expect(output).toContain("Inventory");
  expect(output).toContain("Next Step");
  expect(output).toContain("[stored]");
});

test("doctor page shows runtime snapshot and suggested action", () => {
  const output = renderDoctorPage({
    claudeBinary: "claude",
    ccoHome: "/tmp/.cco",
    profiles: 1,
    hostConfigDir: "/tmp/.claude",
    conflicts: [],
    launchMode: "host config + process-local auth overlay",
  });

  expect(output).toContain("Runtime Snapshot");
  expect(output).toContain("Suggested Next Step");
  expect(output).toContain("[ready]");
});
