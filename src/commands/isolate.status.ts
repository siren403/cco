import React from "react";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import { inspectIsolateHome } from "../core/services/isolate-home.ts";
import { resolveProfile } from "../core/services/resolve-profile.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { IsolateStatusInkScreen } from "../ui/ink/isolate-status-ink-screen.ts";

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

    await renderInkHost(
      React.createElement(IsolateStatusInkScreen, {
        profileId,
        health: status.health,
        homeDir: status.homeDir,
        manifestFile: status.manifestFile,
        homeExists: status.homeExists,
        manifestExists: status.manifestExists,
        metadataExists: status.metadataExists,
        metadataState: status.metadataState,
        seedMode: status.manifest?.seedMode,
        sourceConfigDir:
          status.manifest?.sourceConfigDir ??
          profile.isolate?.source.configDir ??
          text.profiles.missingBadge,
        continuitySessionId: profile.isolate?.continuity?.importedSessionId,
        continuityProjectKey: profile.isolate?.continuity?.projectKey,
        continuityImportedAt: profile.isolate?.continuity?.importedAt,
        locale: this.runtime.locale,
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
