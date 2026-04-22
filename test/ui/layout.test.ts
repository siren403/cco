import { expect, test } from "bun:test";
import {
  joinBlocks,
  renderBadge,
  renderCommandList,
  renderKeyValueList,
  renderPanel,
} from "../../src/ui/layout/primitives.ts";
import { stripAnsi } from "../../src/ui/theme.ts";

test("renderPanel builds a boxed section in plain mode", () => {
  const output = renderPanel({
    title: "Example",
    badge: { label: "ready", tone: "ok" },
    body: ["line one", "line two"],
  });

  expect(output).toContain("┌─ Example [ready]");
  expect(output).toContain("│ line one");
  expect(output).toContain("└");
});

test("renderPanel adds ansi styling in color mode", () => {
  const output = renderPanel(
    {
      title: "Example",
      badge: { label: "warn", tone: "warn" },
      body: "line one",
    },
    { ansiColor: true },
  );

  expect(output).toContain("\u001B[");
  expect(stripAnsi(output)).toContain("Example [warn]");
});

test("command and key-value lists remain readable without color", () => {
  const commands = renderCommandList([
    { command: "cco work", description: "Launch with linked host setup and profile auth." },
  ]);
  const kv = renderKeyValueList([
    { label: "profiles", value: "2" },
    { label: "env-conflicts", value: "none detected", tone: "ok" },
  ]);
  const joined = joinBlocks([commands, kv, renderBadge({ label: "host", tone: "accent" })]);

  expect(joined).toContain("cco work");
  expect(joined).toContain("profiles");
  expect(joined).toContain("[host]");
});
