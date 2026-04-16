import { getStricliText, type AppLocale } from "../../i18n/index.ts";

export interface StricliHelpSectionModel {
  readonly title: string;
  readonly lines: readonly string[];
}

export interface StricliHelpPageModel {
  readonly summary: readonly string[];
  readonly sections: readonly StricliHelpSectionModel[];
}

const SECTION_ORDER = ["usage", "flags", "commands", "arguments", "aliases"] as const;
type SectionKey = (typeof SECTION_ORDER)[number];

export function buildStricliHelpPageModel(
  rawText: string,
  locale: AppLocale,
): StricliHelpPageModel | null {
  const text = getStricliText(locale);
  const headerToKey = new Map<string, SectionKey>([
    [text.headers.usage, "usage"],
    [text.headers.flags, "flags"],
    [text.headers.commands, "commands"],
    [text.headers.arguments, "arguments"],
    [text.headers.aliases, "aliases"],
  ]);

  const lines = rawText.replace(/\r\n/g, "\n").split("\n").map((line) => line.trimEnd());

  const summary: string[] = [];
  const buckets: Record<SectionKey, string[]> = {
    usage: [],
    flags: [],
    commands: [],
    arguments: [],
    aliases: [],
  };

  let activeSection: SectionKey | null = null;
  let sawUsageHeader = false;

  for (const line of lines) {
    const maybeKey = headerToKey.get(line.trim());
    if (maybeKey) {
      activeSection = maybeKey;
      if (maybeKey === "usage") {
        sawUsageHeader = true;
      }
      continue;
    }

    if (activeSection) {
      buckets[activeSection].push(line);
      continue;
    }

    summary.push(line);
  }

  if (!sawUsageHeader) {
    return null;
  }

  const normalizedSummary = trimEmpty(summary);
  const sections = SECTION_ORDER
    .map((key) => ({
      title: headerToKeyEntries(text.headers)[key],
      lines: trimEmpty(buckets[key]),
    }))
    .filter((section) => section.lines.length > 0);

  return {
    summary: normalizedSummary,
    sections,
  };
}

function headerToKeyEntries(headers: ReturnType<typeof getStricliText>["headers"]): Record<SectionKey, string> {
  return {
    usage: headers.usage,
    flags: headers.flags,
    commands: headers.commands,
    arguments: headers.arguments,
    aliases: headers.aliases,
  };
}

function trimEmpty(lines: readonly string[]): string[] {
  const start = lines.findIndex((line) => line.trim().length > 0);
  if (start === -1) {
    return [];
  }

  let end = lines.length - 1;
  while (end >= start && lines[end]?.trim().length === 0) {
    end -= 1;
  }

  return lines.slice(start, end + 1);
}
