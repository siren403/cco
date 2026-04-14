import { expect, test } from "bun:test";
import { renderShowcase } from "../../src/ui/renderers/showcase.ts";

test("showcase all includes core sections", () => {
  const output = renderShowcase();

  expect(output).toContain("=== 프로필 추가 시작 ===");
  expect(output).toContain("=== 루트 도움말 ===");
  expect(output).toContain("=== 저장된 프로필 ===");
  expect(output).toContain("=== 진단 화면 ===");
  expect(output).toContain("=== 명령 흐름 ===");
  expect(output).toContain("CCO_BYPASS_PERMISSIONS_POLICY");
});

test("showcase auth focuses on onboarding flow", () => {
  const output = renderShowcase("auth");

  expect(output).toContain("=== 프로필 추가 시작 ===");
  expect(output).toContain("오버레이 준비 완료");
  expect(output).not.toContain("=== 진단 화면 ===");
});

test("showcase errors focuses on error output only", () => {
  const output = renderShowcase("errors");

  expect(output).toContain("=== 없는 프로필 오류 ===");
  expect(output).toContain("다음 단계");
  expect(output).toContain("먼저 로컬 별칭을 만들거나");
  expect(output).not.toContain("=== 진단 화면 ===");
});
