import React from "react";
import { readFile } from "node:fs/promises";
import { buildCommand } from "@stricli/core";
import type { AppContext } from "../context.ts";
import { DomainError } from "../core/errors/domain-error.ts";
import {
  describeSubprocessEnvScrubMode,
  resolveSubprocessEnvScrubMode,
  type OverlayProfile,
  type OverlayProviderConfig,
} from "../core/model/profile.ts";
import { buildLaunchPlan } from "../core/services/build-launch-plan.ts";
import { HOST_PROFILE } from "../core/model/profile.ts";
import { parseCcswitchConfig } from "../core/services/ccswitch-import.ts";
import { assertProfileIdUsable } from "../core/services/profile-id.ts";
import {
  filterSuggestionsToAbsentTiers,
  probeProviderModels,
  suggestTierMappings,
} from "../core/services/provider-model-discovery.ts";
import { getStaticUiText } from "../i18n/index.ts";
import { spawnClaudeCapture, spawnClaudeInteractive } from "../infra/bun/spawn-claude.ts";
import {
  AuthAddIntroInkScreen,
  AuthAddProviderIntroInkScreen,
  AuthAddProviderSuccessInkScreen,
  AuthAddSuccessInkScreen,
} from "../ui/ink/auth-add-ink-screen.ts";
import { renderInkHost } from "../ui/ink/render-ink.ts";
import { promptToConfirmModelMappings } from "../ui/prompts/confirm-model-mappings.ts";
import { promptForBaseUrl } from "../ui/prompts/provider-base-url.ts";
import { promptForToken } from "../ui/prompts/token-entry.ts";

const text = getStaticUiText();

interface AuthAddFlags {
  readonly provider?: boolean;
  readonly from?: string;
}

export const authAddCommand = buildCommand<AuthAddFlags, [profileId: string], AppContext>({
  async func(this: AppContext, flags, profileId) {
    assertProfileIdUsable(profileId);
    const existingProfile = await this.runtime.profileStore.get(profileId);

    if (flags.provider === true) {
      await runProviderAdd(this, profileId, existingProfile, flags.from);
      return;
    }

    await renderInkHost(
      React.createElement(AuthAddIntroInkScreen, {
        profileId,
        locale: this.runtime.locale,
      }),
      {
        stdin: this.process.stdin,
        stdout: this.process.stdout,
        stderr: this.process.stderr,
      },
    );

    this.process.stdout.write("\n");

    const setupPlan = buildLaunchPlan({
      profile: HOST_PROFILE,
      binary: this.runtime.resolveClaudeBinary(),
      cwd: this.process.cwd(),
      parentEnv: this.process.env,
      explicitArgs: ["setup-token"],
    });

    const setupExitCode = await spawnClaudeInteractive(setupPlan);
    if (setupExitCode !== 0) {
      throw new DomainError(
        "SETUP_TOKEN_FAILED",
        `claude setup-token exited with code ${setupExitCode}.`,
        { exitCode: setupExitCode, profileId },
      );
    }

    const token = await promptForToken(profileId);
    await verifyToken(this, profileId, token);

    const now = this.runtime.now().toISOString();
    const subprocessEnvScrub = resolveSubprocessEnvScrubMode(existingProfile ?? undefined);
    const profile: OverlayProfile = {
      id: profileId,
      label: profileId,
      kind: "overlay",
      tokenRef: profileId,
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
      lastUsedAt: existingProfile?.lastUsedAt,
      env: existingProfile?.env,
    };

    await this.runtime.profileStore.put(profile);
    await this.runtime.tokenStore.put(profileId, token);

    await renderInkHost(
      React.createElement(AuthAddSuccessInkScreen, {
        profileId,
        modeLabel: describeSubprocessEnvScrubMode(subprocessEnvScrub),
        profilesFile: this.runtime.paths.profilesFile,
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
    flags: {
      provider: {
        kind: "boolean",
        optional: true,
        brief: text.commandBriefs.authAddFlagProvider,
      },
      from: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: text.commandBriefs.authAddFlagFrom,
        placeholder: "path",
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: text.commandBriefs.authAddArgProfile,
          parse: String,
          placeholder: "profile",
        },
      ],
    },
  },
  docs: {
    brief: text.commandBriefs.authAdd,
  },
});

async function runProviderAdd(
  context: AppContext,
  profileId: string,
  existingProfile: OverlayProfile | null,
  fromPath: string | undefined,
): Promise<void> {
  await renderInkHost(
    React.createElement(AuthAddProviderIntroInkScreen, {
      profileId,
      fromPath,
      locale: context.runtime.locale,
    }),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
    },
  );

  context.process.stdout.write("\n");

  let token: string;
  let provider: OverlayProviderConfig;
  let droppedKeys: readonly string[] = [];
  let notices: readonly string[] = [];

  if (fromPath) {
    const raw = await readCcswitchFile(fromPath);
    const imported = parseCcswitchConfig(raw);
    token = imported.token;
    provider = imported.provider;
    droppedKeys = imported.droppedKeys;
    notices = imported.notices;
  } else {
    const baseUrl = await promptForBaseUrl(profileId);
    token = await promptForToken(profileId);
    provider = { baseUrl };
  }

  provider = await applyDiscoveredModelMappings(context, provider, token);

  const now = context.runtime.now().toISOString();
  const subprocessEnvScrub = resolveSubprocessEnvScrubMode(existingProfile ?? undefined);
  const profile: OverlayProfile = {
    id: profileId,
    label: profileId,
    kind: "overlay",
    authKind: "provider",
    provider,
    createdAt: existingProfile?.createdAt ?? now,
    updatedAt: now,
    lastUsedAt: existingProfile?.lastUsedAt,
    env: existingProfile?.env,
  };

  await context.runtime.profileStore.put(profile);
  await context.runtime.tokenStore.put(profileId, token);

  await renderInkHost(
    React.createElement(AuthAddProviderSuccessInkScreen, {
      profileId,
      modeLabel: describeSubprocessEnvScrubMode(subprocessEnvScrub),
      baseUrl: provider.baseUrl,
      profilesFile: context.runtime.paths.profilesFile,
      droppedKeys,
      notices,
      locale: context.runtime.locale,
    }),
    {
      stdin: context.process.stdin,
      stdout: context.process.stdout,
      stderr: context.process.stderr,
    },
  );
}

async function readCcswitchFile(fromPath: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await readFile(fromPath, "utf8");
  } catch {
    throw new DomainError(
      "CCSWITCH_IMPORT_FILE_READ_FAILED",
      `Could not read the import file at "${fromPath}".`,
      {},
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new DomainError(
      "CCSWITCH_IMPORT_FILE_READ_FAILED",
      `Could not parse the import file at "${fromPath}" as JSON.`,
      {},
    );
  }
}

async function applyDiscoveredModelMappings(
  context: AppContext,
  provider: OverlayProviderConfig,
  token: string,
): Promise<OverlayProviderConfig> {
  const probe = await probeProviderModels(provider.baseUrl, token);

  if (!probe.ok) {
    const warnLine =
      probe.reason === "auth"
        ? text.authAdd.providerProbeAuthWarn
        : text.authAdd.providerProbeUnavailableWarn;
    context.process.stderr.write(`${warnLine}\n`);
    return provider;
  }

  context.process.stdout.write(`${text.authAdd.providerProbeSuccess(probe.modelIds.length)}\n`);

  const suggestions = suggestTierMappings(probe.modelIds);
  const missing = filterSuggestionsToAbsentTiers(suggestions, provider.env);

  if (Object.keys(missing).length === 0) {
    return provider;
  }

  const confirmed = await promptToConfirmModelMappings(missing);
  if (!confirmed) {
    context.process.stdout.write(`${text.authAdd.providerMappingsSkipped}\n`);
    return provider;
  }

  context.process.stdout.write(
    `${text.authAdd.providerMappingsApplied(Object.keys(missing).join(", "))}\n`,
  );

  return {
    ...provider,
    env: { ...(provider.env ?? {}), ...missing },
  };
}

function parseClaudeApiError(
  ...outputs: readonly string[]
): { readonly status: number; readonly message?: string } | undefined {
  for (const output of outputs) {
    try {
      const value = JSON.parse(output) as Record<string, unknown>;
      if (typeof value.api_error_status === "number") {
        return {
          status: value.api_error_status,
          message: typeof value.result === "string" ? value.result : undefined,
        };
      }
    } catch {
      // Not Claude's JSON result envelope; keep the existing generic error path.
    }
  }

  return undefined;
}

async function verifyToken(
  context: AppContext,
  profileId: string,
  token: string,
): Promise<void> {
  const verifyPlan = buildLaunchPlan({
    profile: {
      id: "verify",
      label: "verify",
      kind: "overlay",
      tokenRef: "verify",
      createdAt: "",
      updatedAt: "",
    },
    binary: context.runtime.resolveClaudeBinary(),
    cwd: context.process.cwd(),
    parentEnv: context.process.env,
    token,
    explicitArgs: ["-p", "reply with OK only", "--output-format", "json"],
  });

  const result = await spawnClaudeCapture(verifyPlan);
  if (result.exitCode !== 0) {
    const apiError = parseClaudeApiError(result.stdout, result.stderr);
    if (apiError) {
      throw new DomainError(
        "TOKEN_VERIFY_API_ERROR",
        apiError.message ?? `Claude API returned HTTP ${apiError.status}.`,
        { apiStatus: apiError.status, profileId },
      );
    }

    throw new DomainError(
      "TOKEN_VERIFY_FAILED",
      `Token verification failed.\n${result.stderr.trim() || result.stdout.trim()}`,
      { profileId },
    );
  }

  JSON.parse(result.stdout);
}
