import React from "react";
import { expect, test } from "bun:test";
import { renderToString } from "ink";
import {
  ControlPanelInkScreen,
  type HostLinkEntryStatus,
} from "../../src/ui/ink/control-panel-ink-screen.ts";

test("control panel renders the live TUI shell", () => {
  const output = renderToString(
    React.createElement(ControlPanelInkScreen, {
      model: {
        profiles: [
          { id: "host", label: "Host", kind: "host" },
          {
            id: "work",
            label: "work",
            kind: "overlay",
            tokenRef: "tokens/work.json",
            createdAt: "2026-04-22T00:00:00.000Z",
            updatedAt: "2026-04-22T00:00:00.000Z",
          },
        ],
        tokenPresence: new Map([["work", true]]),
        isolateStatuses: new Map(),
        hostLinkStatuses: new Map<string, readonly HostLinkEntryStatus[]>([
          [
            "work",
            [
              {
                name: "settings.json",
                sourcePath: ".claude/settings.json",
                targetPath: ".cco/isolate/work/settings.json",
                state: "linked",
              },
            ],
          ],
        ]),
        cwd: "D:\\workspace\\project",
        profilesFile: "profiles.json",
        doctorData: {
          claudeBinary: "claude",
          ccoHome: ".cco",
          profiles: 2,
          hostConfigDir: ".claude",
          conflicts: [],
          launchMode: "host-linked isolate homes",
        },
        locale: "ko",
      },
      onSubmit: () => {},
    }),
  );

  expect(output).toContain("Profile Control Center");
  expect(output).toContain("host-links");
  expect(output).toContain("session");
  expect(output).toContain("[stable]");
  expect(output).toContain("프로필");
  expect(output).toContain("작업");
  expect(output).toContain("프로필 이어가기");
  expect(output).toContain("[!] 격리 fresh");
  expect(output).toContain("work");
});

test("control panel rich mode renders restrained decorative markers", () => {
  const output = renderToString(
    React.createElement(ControlPanelInkScreen, {
      appearance: "rich",
      model: {
        profiles: [
          { id: "host", label: "Host", kind: "host" },
          {
            id: "work",
            label: "work",
            kind: "overlay",
            tokenRef: "tokens/work.json",
            createdAt: "2026-04-22T00:00:00.000Z",
            updatedAt: "2026-04-22T00:00:00.000Z",
          },
        ],
        tokenPresence: new Map([["work", true]]),
        isolateStatuses: new Map(),
        hostLinkStatuses: new Map(),
        cwd: "D:\\workspace\\project",
        profilesFile: "profiles.json",
        doctorData: {
          claudeBinary: "claude",
          ccoHome: ".cco",
          profiles: 2,
          hostConfigDir: ".claude",
          conflicts: [],
          launchMode: "host-linked isolate homes",
        },
        locale: "ko",
      },
      onSubmit: () => {},
    }),
  );

  expect(output).toContain("[rich]");
  expect(output).toContain("› host");
  expect(output).toContain("ACTIVE");
  expect(output).toContain("─ Launch ─");
  expect(output).toContain("▶ 프로필 이어가기");
  expect(output).toContain("─ Danger Zone ─");
  expect(output).toContain("Identity: host");
});
