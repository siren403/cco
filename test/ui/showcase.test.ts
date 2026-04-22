import { expect, test } from "bun:test";
import { renderShowcase } from "../../src/ui/renderers/showcase.ts";

test("showcase all includes core sections", () => {
  const output = renderShowcase();

  expect(output).toContain("=== 프로필 추가 시작 ===");
  expect(output).toContain("=== 루트 도움말 ===");
  expect(output).toContain("=== 저장된 프로필 ===");
  expect(output).toContain("=== 진단 화면 ===");
  expect(output).toContain("=== 명령 흐름 ===");
  expect(output).toContain("CLAUDE_CODE_SUBPROCESS_ENV_SCRUB");
});

test("showcase auth focuses on onboarding flow", () => {
  const output = renderShowcase("auth");

  expect(output).toContain("=== 프로필 추가 시작 ===");
  expect(output).toContain("프로필 준비 완료");
  expect(output).not.toContain("=== 진단 화면 ===");
});

test("showcase errors focuses on error output only", () => {
  const output = renderShowcase("errors");

  expect(output).toContain("=== 없는 프로필 오류 ===");
  expect(output).toContain("다음 단계");
  expect(output).toContain("저장된 프로필 목록을 확인");
  expect(output).not.toContain("=== 진단 화면 ===");
});
