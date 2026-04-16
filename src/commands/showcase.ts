import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { ShowcaseInkScreen } from "../ui/ink/showcase-ink-screen.ts";
import { type ShowcaseTopic } from "../ui/models/showcase-page.ts";

const VALID_TOPICS = new Set<ShowcaseTopic>([
  "all",
  "auth",
  "help",
  "profiles",
  "errors",
  "doctor",
  "flows",
  "ink",
]);

const text = getStaticUiText();

export const showcaseCommand = buildCommand<{}, [topic?: string], AppContext>({
  async func(this: AppContext, _flags, topic) {
    const resolvedTopic = resolveTopic(topic);

    await renderInkHost(
      React.createElement(ShowcaseInkScreen, {
        locale: this.runtime.locale,
        topic: resolvedTopic,
      }),
      {
        stdin: this.process.stdin,
        stdout: this.process.stdout,
        stderr: this.process.stderr,
      },
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
