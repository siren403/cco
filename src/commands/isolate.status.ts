import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { inspectIsolateHome } from "../core/services/isolate-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderKeyValueList, renderPanel } from "../ui/layout/primitives.ts";
import { resolveAnsiColor } from "../ui/theme.ts";

const text = getStaticUiText();

export const isolateStatusCommand = buildCommand<{}, [profileId: string], AppContext>({
  async func(this: AppContext, _flags, profileId) {
    const profile = await resolveProfile(this.runtime.profileStore, profileId);
    if (profile.kind !== "overlay") {
      throw new DomainError(
        "ISOLATE_OVERLAY_ONLY",
        "Isolate mode currently supports saved overlay profiles only.",
        { profileId },
      );
    }

    const status = await inspectIsolateHome(this, profile);
    const ansiColor = resolveAnsiColor(this.process.stdout, this.process.env);
    const renderOptions = { ansiColor, locale: this.runtime.locale } as const;

    const panel = renderPanel(
      {
        title: text.misc.isolateStatusTitle,
        tone: status.health === "ready"
          ? "ok"
          : status.health === "missing"
            ? "dim"
            : "warn",
        badge: {
          label: profileId,
          tone: "accent",
        },
        body: [
          renderKeyValueList(
            [
              {
                label: "status",
                value: status.health === "ready"
                  ? text.misc.isolateStatusReadyBadge
                  : status.health === "missing"
                    ? text.misc.isolateStatusMissingBadge
                    : text.misc.isolateStatusBrokenBadge,
              },
              {
                label: "home-dir",
                value: status.homeDir,
              },
              {
                label: "manifest",
                value: status.manifestFile,
              },
              {
                label: "home-present",
                value: status.homeExists
                  ? text.profiles.storedBadge
                  : text.profiles.missingBadge,
              },
              {
                label: "manifest-present",
                value: status.manifestExists
                  ? text.profiles.storedBadge
                  : text.profiles.missingBadge,
              },
              {
                label: "metadata",
                value: status.metadataExists
                  ? status.metadataState ?? text.profiles.storedBadge
                  : text.profiles.missingBadge,
              },
              {
                label: "seed-mode",
                value: status.manifest?.seedMode ?? text.profiles.missingBadge,
              },
              {
                label: "source-config",
                value:
                  status.manifest?.sourceConfigDir ??
                  profile.isolate?.source.configDir ??
                  text.profiles.missingBadge,
              },
            ],
            renderOptions,
          ),
        ],
      },
      renderOptions,
    );

    this.process.stdout.write(`${panel}\n`);
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.isolateArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.isolateStatus,
  },
});
