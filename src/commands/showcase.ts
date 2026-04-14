import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { resolveAnsiColor } from "../ui/theme.ts";
import {
  renderShowcase,
  type ShowcaseTopic,
} from "../ui/renderers/showcase.ts";

const VALID_TOPICS = new Set<ShowcaseTopic>([
  "all",
  "auth",
  "help",
  "profiles",
  "errors",
  "doctor",
  "flows",
]);

const text = getStaticUiText();

export const showcaseCommand = buildCommand<{}, [topic?: string], AppContext>({
  async func(this: AppContext, _flags, topic) {
    const resolvedTopic = resolveTopic(topic);
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    this.process.stdout.write(
      `${renderShowcase(resolvedTopic, {
        ansiColor,
        locale: this.runtime.locale,
      })}\n`,
    );
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.showcaseArgTopic,
          parse: String,
          optional: true,
          placeholder: "topic",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.showcase,
  },
});

function resolveTopic(topic?: string): ShowcaseTopic {
  if (!topic) {
    return "all";
  }

  if (VALID_TOPICS.has(topic as ShowcaseTopic)) {
    return topic as ShowcaseTopic;
  }

  throw new DomainError(
    "INVALID_SHOWCASE_TOPIC",
    text.errors.unknownShowcaseTopic(topic),
    { topic },
  );
}
