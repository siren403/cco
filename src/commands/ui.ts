import { lstat } from "node:fs/promises";
import { join } from "node:path";
import React from "react";
import { render } from "ink";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import type { OverlayProfile, Profile } from "../core/model/profile.ts";
import {
  inspectIsolateHome,
  removeIsolateHome,
  type IsolateHomeStatus,
} from "../core/services/isolate-home.ts";
import { listProfiles } from "../core/services/list-profiles.ts";
import { resolveShellSubprocessEnvScrubMode } from "../core/services/permission-mode.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { findConflictingAuthEnv } from "../infra/bun/env.ts";
import { resolvePhysicalHostClaudeConfigDir } from "../infra/fs/path-utils.ts";
import {
  ControlPanelInkScreen,
  type HostLinkEntryStatus,
  type ControlPanelModel,
  type ControlPanelOutcome,
} from "../ui/ink/control-panel-ink-screen.ts";
import { promptToConfirmIsolateRemove } from "../ui/prompts/confirm-isolate-remove.ts";
import { launchClaudeForProfile } from "./launch-shared.ts";

const text = getStaticUiText();

const HOST_LINK_ENTRIES = [
  "settings.json",
  "settings.local.json",
  "mcp.json",
  "mcp.local.json",
  "plugins",
  "skills",
  "hooks",
  "commands",
  "statusline.sh",
  "statusline.ps1",
  "statusline.cmd",
  "statusline.bat",
] as const;

const ENTER_ALTERNATE_SCREEN = "\u001B[?1049h";
const EXIT_ALTERNATE_SCREEN = "\u001B[?1049l";
const HIDE_CURSOR = "\u001B[?25l";
const SHOW_CURSOR = "\u001B[?25h";
const CLEAR_TERMINAL = "\u001B[2J\u001B[H";
const RESIZE_REPAINT_DELAY_MS = 20;

interface UiFlags {
  readonly rich?: boolean;
}

export const uiCommand = buildCommand<UiFlags, [], AppContext>({
  async func(this: AppContext, flags) {
    assertInteractiveTerminal(this);

    while (true) {
      const outcome = await renderControlPanel(
        this,
        await loadControlPanelModel(this),
        flags.rich === true ? "rich" : "stable",
      );

      if (!outcome || outcome.kind === "quit") {
        return;
      }

      if (outcome.kind === "reload") {
        continue;
      }

      await runControlPanelOutcome(this, outcome);
      this.process.stdout.write(`${text.controlPanel.returning}\n`);
    }
  },
  parameters: {
    flags: {
      rich: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.uiFlagRich,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: text.commandBriefs.ui,
  },
});

function assertInteractiveTerminal(context: AppContext): void {
  if (!context.process.stdin.isTTY || !context.process.stdout.isTTY) {
    throw new DomainError("UI_TTY_REQUIRED", text.controlPanel.notInteractive);
  }
}

async function loadControlPanelModel(context: AppContext): Promise<ControlPanelModel> {
  const profiles = await listProfiles(context.runtime.profileStore);
  const tokenPresence = new Map<string, boolean>();
  const isolateStatuses = new Map<string, IsolateHomeStatus>();
  const hostLinkStatuses = new Map<string, readonly HostLinkEntryStatus[]>();
  const physicalHostConfigDir = resolvePhysicalHostClaudeConfigDir(context.process.env);

  await Promise.all(
    profiles.map(async (profile) => {
      if (!isOverlayProfile(profile)) {
        return;
      }

      const [token, status] = await Promise.all([
        context.runtime.tokenStore.get(profile.id),
        inspectIsolateHome(context, profile),
      ]);

      tokenPresence.set(profile.id, !!token);
      isolateStatuses.set(profile.id, status);
      hostLinkStatuses.set(
        profile.id,
        await inspectHostLinkEntries(physicalHostConfigDir, status.homeDir),
      );
    }),
  );

  return {
    profiles,
    tokenPresence,
    isolateStatuses,
    hostLinkStatuses,
    profilesFile: context.runtime.paths.profilesFile,
    cwd: context.process.cwd(),
    doctorData: {
      claudeBinary: context.runtime.resolveClaudeBinary(),
      ccoHome: context.runtime.paths.root,
      profiles: profiles.length,
      hostConfigDir:
        context.process.env.CLAUDE_CONFIG_DIR ?? text.doctor.defaultHostConfig,
      conflicts: findConflictingAuthEnv(context.process.env),
      launchMode: text.doctor.launchMode,
      shellSubprocessEnvScrub:
        resolveShellSubprocessEnvScrubMode(context.process.env),
    },
    locale: context.runtime.locale,
  };
}

async function inspectHostLinkEntries(
  sourceConfigDir: string,
  isolateHomeDir: string,
): Promise<readonly HostLinkEntryStatus[]> {
  return await Promise.all(
    HOST_LINK_ENTRIES.map(async (entry) => {
      const sourcePath = join(sourceConfigDir, entry);
      const targetPath = join(isolateHomeDir, entry);
      const [source, target] = await Promise.all([
        inspectPath(sourcePath),
        inspectPath(targetPath),
      ]);

      return {
        name: entry,
        sourcePath,
        targetPath,
        state: resolveHostLinkState(source, target),
      };
    }),
  );
}

async function inspectPath(path: string): Promise<"missing" | "file" | "dir" | "link"> {
  try {
    const info = await lstat(path);
    if (info.isSymbolicLink()) {
      return "link";
    }

    if (info.isDirectory()) {
      return "dir";
    }

    return "file";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "missing";
    }

    throw error;
  }
}

function resolveHostLinkState(
  source: "missing" | "file" | "dir" | "link",
  target: "missing" | "file" | "dir" | "link",
): HostLinkEntryStatus["state"] {
  if (source === "missing") {
    return "missing-source";
  }

  if (target === "missing") {
    return "missing-target";
  }

  return target === "link" ? "linked" : "present";
}

async function renderControlPanel(
  context: AppContext,
  model: ControlPanelModel,
  appearance: "stable" | "rich",
): Promise<ControlPanelOutcome | undefined> {
  let outcome: ControlPanelOutcome | undefined;
  let repaintEpoch = 0;

  const createScreen = () =>
    React.createElement(ControlPanelInkScreen, {
      model,
      appearance,
      repaintEpoch,
      onSubmit: (nextOutcome) => {
        outcome = nextOutcome;
      },
    });

  context.process.stdout.write(
    `${ENTER_ALTERNATE_SCREEN}${HIDE_CURSOR}${CLEAR_TERMINAL}`,
  );

  const app = render(
    createScreen(),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
      exitOnCtrlC: true,
      alternateScreen: false,
      incrementalRendering: false,
      maxFps: 15,
    },
  );

  let resizeTimer: Timer | undefined;
  const repaintAfterResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {
      repaintEpoch += 1;
      app.clear();
      context.process.stdout.write(CLEAR_TERMINAL);
      app.rerender(createScreen());
    }, RESIZE_REPAINT_DELAY_MS);
  };

  context.process.stdout.on("resize", repaintAfterResize);

  try {
    await app.waitUntilExit();
    return outcome;
  } finally {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    context.process.stdout.off("resize", repaintAfterResize);
    context.process.stdout.write(
      `${CLEAR_TERMINAL}${SHOW_CURSOR}${EXIT_ALTERNATE_SCREEN}`,
    );
  }
}

async function runControlPanelOutcome(
  context: AppContext,
  outcome: ControlPanelOutcome,
): Promise<void> {
  switch (outcome.kind) {
    case "launch":
      await launchClaudeForProfile(context, {
        requestedProfileId: outcome.profileId,
        claudeArgs: outcome.claudeArgs,
      });
      return;
    case "fresh":
      await recreateIsolateAndLaunch(
        context,
        outcome.profileId,
        outcome.clean,
        outcome.confirmed === true,
      );
      return;
    case "reload":
    case "quit":
      return;
  }
}

async function recreateIsolateAndLaunch(
  context: AppContext,
  profileId: string,
  clean: boolean,
  confirmed: boolean,
): Promise<void> {
  const profile = await context.runtime.profileStore.get(profileId);
  if (!profile) {
    throw new DomainError("PROFILE_NOT_FOUND", `Profile "${profileId}" was not found.`);
  }

  const current = await inspectIsolateHome(context, profile);
  if (!confirmed && (current.homeExists || current.metadataExists)) {
    const removalConfirmed = await promptToConfirmIsolateRemove(profile.id);
    if (!removalConfirmed) {
      context.process.stdout.write(`${text.misc.noChangesMade}\n`);
      return;
    }
  }

  await removeIsolateHome(context, profile);
  await launchClaudeForProfile(context, {
    requestedProfileId: profile.id,
    isolate: true,
    isolateBootstrap: {
      seedMode: clean ? "clean" : undefined,
    },
  });
}

function isOverlayProfile(profile: Profile): profile is OverlayProfile {
  return profile.kind === "overlay";
}
