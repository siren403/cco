import { expect, test } from "bun:test";
import { HOST_PROFILE } from "../../src/core/model/profile.ts";
import { renderDoctorPage } from "../../src/ui/views/doctor-page.ts";
import { renderProfilesPage } from "../../src/ui/views/profiles-page.ts";
import { renderRootHelp } from "../../src/ui/renderers/root-help.ts";

test("root help uses panel-based sections", () => {
  const output = renderRootHelp();

  expect(output).toContain("빠른 시작");
  expect(output).toContain("명령 표면");
  expect(output).toContain("인증 오버레이");
  expect(output).toContain("CCO_BYPASS_PERMISSIONS_POLICY");
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
        env: {
          CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: "0",
        },
      },
    ],
    new Map([["work", true]]),
    "/tmp/.cco/profiles.json",
  );

  expect(output).toContain("목록");
  expect(output).toContain("다음 단계");
  expect(output).toContain("[저장됨]");
  expect(output).toContain("[compat mode]");
});

test("doctor page shows runtime snapshot and suggested action", () => {
  const output = renderDoctorPage({
    claudeBinary: "claude",
    ccoHome: "/tmp/.cco",
    profiles: 1,
    hostConfigDir: "/tmp/.claude",
    conflicts: [],
    launchMode: "호스트 구성 + 프로세스 로컬 인증 오버레이",
    bypassPermissionsPolicy: "ask",
  });

  expect(output).toContain("런타임 스냅샷");
  expect(output).toContain("추천 다음 단계");
  expect(output).toContain("[준비됨]");
  expect(output).toContain("bypass-policy");
  expect(output).toContain("ask");
});
