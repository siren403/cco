import { DomainError } from "../../core/errors/domain-error.ts";
import { getUiText } from "../../i18n/index.ts";
import { renderErrorPage } from "../views/error-page.ts";
import type { RenderOptions } from "../theme.ts";

export function renderCliError(error: unknown, options: RenderOptions = {}): string {
  const text = getUiText(options.locale);
  if (error instanceof DomainError) {
    const profileId = error.details.profileId;

    switch (error.code) {
      case "PROFILE_NOT_FOUND":
        return renderErrorPage(
          {
            title: text.errors.unknownProfileTitle(profileId ?? "unknown"),
            summary: text.errors.unknownProfileSummary,
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: text.errors.createOverlayDescription,
              },
              {
                command: "cco auth list",
                description: text.errors.inspectProfilesDescription,
              },
            ],
          },
          options,
        );
      case "TOKEN_NOT_FOUND":
        return renderErrorPage(
          {
            title: error.message,
            summary: text.errors.tokenMissingSummary,
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: text.errors.tokenMissingDescription,
              },
            ],
          },
          options,
        );
      case "INVALID_PROFILE_ID":
        return renderErrorPage(
          {
            title: text.errors.invalidProfileTitle,
            tone: "warn",
            commands: [
              {
                command: "cco auth add work",
                description: text.errors.invalidProfileDescription,
              },
            ],
          },
          options,
        );
      case "RESERVED_PROFILE_ID":
        return renderErrorPage(
          {
            title: text.errors.reservedProfileTitle,
            tone: "warn",
            summary: text.errors.reservedProfileSummary,
            commands: [
              {
                command: "cco auth add work",
                description: text.errors.reservedProfileDescription,
              },
            ],
          },
          options,
        );
      case "SETUP_TOKEN_FAILED":
        return renderErrorPage(
          {
            title: text.errors.setupTokenFailedTitle,
            summary: text.errors.exitCodeSummary(
              String(error.details.exitCode ?? "unknown"),
            ),
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: text.errors.setupTokenRetryDescription,
              },
            ],
          },
          options,
        );
      case "TOKEN_VERIFY_FAILED":
        return renderErrorPage(
          {
            title: text.errors.tokenVerifyFailedTitle,
            summary: error.message,
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: text.errors.tokenVerifyRetryDescription,
              },
            ],
          },
          options,
        );
      case "HOST_CONFIG_NOT_SUPPORTED":
        return renderErrorPage(
          {
            title: text.errors.hostConfigNotSupportedTitle,
            summary: text.errors.hostConfigNotSupportedDescription,
            commands: [
              {
                command: "cco auth list",
                description: text.errors.inspectProfilesDescription,
              },
            ],
          },
          options,
        );
      case "INVALID_CONFIG_ASSIGNMENT":
        return renderErrorPage(
          {
            title: text.errors.invalidConfigAssignmentTitle,
            summary: text.errors.invalidConfigAssignmentDescription,
            commands: [
              {
                command:
                  "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
                description: text.errors.invalidConfigAssignmentDescription,
              },
            ],
          },
          options,
        );
      case "UNKNOWN_CONFIG_KEY":
        return renderErrorPage(
          {
            title: text.errors.unknownConfigKeyTitle,
            summary: text.errors.unknownConfigKeyDescription,
            commands: [
              {
                command:
                  "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
                description: text.errors.unknownConfigKeyDescription,
              },
            ],
          },
          options,
        );
      case "INVALID_CONFIG_VALUE":
        return renderErrorPage(
          {
            title: text.errors.invalidConfigValueTitle,
            summary: text.errors.invalidConfigValueDescription,
            commands: [
              {
                command:
                  "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
                description: text.errors.invalidConfigValueDescription,
              },
            ],
          },
          options,
        );
      case "MISPLACED_LAUNCH_FLAG":
        return renderErrorPage(
          {
            title: text.errors.misplacedLaunchFlagTitle(
              String(error.details.flag ?? "--isolate"),
            ),
            tone: "warn",
            summary: text.errors.misplacedLaunchFlagSummary,
            commands: [
              {
                command: `cco ${String(error.details.flag ?? "--isolate")} ${profileId ?? "work"}`,
                description: text.errors.misplacedLaunchFlagDescription(
                  profileId ?? "work",
                  String(error.details.flag ?? "--isolate"),
                ),
              },
            ],
          },
          options,
        );
      case "ISOLATE_MODE_NOT_IMPLEMENTED":
        return renderErrorPage(
          {
            title: text.errors.isolateModeNotImplementedTitle,
            tone: "warn",
            summary: text.errors.isolateModeNotImplementedDescription,
            commands: [
              {
                command: `cco ${profileId ?? "work"}`,
                description: text.rootHelp.quickStartLaunch,
              },
              {
                command: "cco showcase help",
                description: text.errors.previewOnboardingDescription,
              },
            ],
          },
          options,
        );
      case "ISOLATE_SETUP_REQUIRED":
        return renderErrorPage(
          {
            title: text.errors.isolateSetupRequiredTitle,
            tone: "warn",
            summary: text.errors.isolateSetupRequiredSummary,
            commands: [
              {
                command: `cco --isolate ${profileId ?? "work"}`,
                description: text.errors.isolateSetupRequiredDescription(
                  profileId ?? "work",
                ),
              },
            ],
          },
          options,
        );
      case "ISOLATE_LOGIN_FAILED":
        return renderErrorPage(
          {
            title: text.errors.isolateLoginFailedTitle,
            tone: "warn",
            summary: text.errors.exitCodeSummary(
              String(error.details.exitCode ?? "unknown"),
            ),
            commands: [
              {
                command: `cco --isolate ${profileId ?? "work"}`,
                description: text.errors.isolateLoginRetryDescription(
                  profileId ?? "work",
                ),
              },
            ],
          },
          options,
        );
      case "ISOLATE_OVERLAY_ONLY":
        return renderErrorPage(
          {
            title: text.errors.isolateOverlayOnlyTitle,
            tone: "warn",
            summary: text.errors.isolateOverlayOnlySummary,
            commands: [
              {
                command: "cco auth list",
                description: text.errors.inspectProfilesDescription,
              },
            ],
          },
          options,
        );
      case "PROMPT_CANCELLED":
        return renderErrorPage(
          {
            title: error.message,
            tone: "warn",
          },
          options,
        );
      case "INVALID_SHOWCASE_TOPIC":
        return renderErrorPage(
          {
            title: text.errors.unknownShowcaseTopic(
              String(error.details.topic ?? "unknown"),
            ),
            tone: "warn",
            commands: [
              {
                command: "cco showcase all",
                description: text.errors.showcaseAllDescription,
              },
              {
                command: "cco showcase auth",
                description: text.errors.showcaseAuthDescription,
              },
              {
                command: "cco showcase errors",
                description: text.errors.showcaseErrorsDescription,
              },
            ],
          },
          options,
        );
      case "SUBPROCESS_ENV_SCRUB_REQUIRED":
        return renderErrorPage(
          {
            title: text.errors.subprocessEnvScrubRequiredTitle,
            summary: text.errors.subprocessEnvScrubRequiredSummary,
            commands: [
              {
                command:
                  `$env:CLAUDE_CODE_SUBPROCESS_ENV_SCRUB='0'; cco ${profileId ?? "<profile>"} --permission-mode bypassPermissions ...`,
                description: text.errors.subprocessEnvScrubCompatDescription,
              },
              {
                command: `cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p ${profileId ?? "<profile>"}`,
                description: text.errors.subprocessEnvScrubPersistDescription,
              },
            ],
          },
          options,
        );
      default:
        return renderErrorPage(
          {
            title: error.message,
          },
          options,
        );
    }
  }

  if (isErrnoException(error) && error.code === "ENOENT") {
    return renderErrorPage(
      {
        title: text.errors.missingBinaryTitle,
        summary: text.errors.missingBinarySummary,
        commands: [
          {
            command: "cco doctor",
            description: text.errors.doctorDescription,
          },
          {
            command: "cco showcase auth",
            description: text.errors.previewOnboardingDescription,
          },
        ],
      },
      options,
    );
  }

  if (error instanceof Error && error.message) {
    return renderErrorPage(
      {
        title: error.message,
      },
      options,
    );
  }

  return renderErrorPage(
    {
      title: text.errors.unexpectedError,
    },
    options,
  );
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}
