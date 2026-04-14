import { expect, test } from "bun:test";
import { renderShowcase } from "../../src/ui/renderers/showcase.ts";

test("showcase all includes core sections", () => {
  const output = renderShowcase();

  expect(output).toContain("=== Root Help ===");
  expect(output).toContain("=== Saved Profiles ===");
  expect(output).toContain("=== Doctor Output ===");
  expect(output).toContain("=== Command Flows ===");
});

test("showcase errors focuses on error output only", () => {
  const output = renderShowcase("errors");

  expect(output).toContain("=== Unknown Profile Error ===");
  expect(output).toContain("Next Step");
  expect(output).toContain("Create the local alias first");
  expect(output).not.toContain("=== Doctor Output ===");
});
