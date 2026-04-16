import { DomainError } from "../../core/errors/domain-error.ts";
import { getStricliText, getUiText, type AppLocale } from "../../i18n/index.ts";

export interface CliErrorCommand {
  readonly command: string;
  readonly description?: string;
}

export interface CliErrorModel {
  readonly title: string;
  readonly tone?: "danger" | "warn";
  readonly summary?: string;
  readonly details?: readonly string[];
  readonly nextStepTitle?: string;
  readonly commands?: readonly CliErrorCommand[];
}

export interface StricliUnknownCommandData {
  readonly input: string;
  readonly corrections?: readonly string[];
  readonly prefix?: readonly string[];
}

export function buildCliErrorModel(error: unknown, locale: AppLocale): CliErrorModel {
  const text = getUiText(locale);

  if (error instanceof DomainError) {
    const profileId = error.details.profileId;

    switch (error.code) {
      case "PROFILE_NOT_FOUND":
        return {
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
        };
      case "TOKEN_NOT_FOUND":
        return {
          title: error.message,
          summary: text.errors.tokenMissingSummary,
          commands: [
            {
              command: `cco auth add ${profileId ?? "work"}`,
              description: text.errors.tokenMissingDescription,
            },
          ],
        };
      case "INVALID_PROFILE_ID":
        return {
          title: text.errors.invalidProfileTitle,
          tone: "warn",
          commands: [
            {
              command: "cco auth add work",
              description: text.errors.invalidProfileDescription,
            },
          ],
        };
      case "RESERVED_PROFILE_ID":
        return {
          title: text.errors.reservedProfileTitle,
          tone: "warn",
          summary: text.errors.reservedProfileSummary,
          commands: [
            {
              command: "cco auth add work",
              description: text.errors.reservedProfileDescription,
            },
          ],
        };
      case "SETUP_TOKEN_FAILED":
        return {
          title: text.errors.setupTokenFailedTitle,
          summary: text.errors.exitCodeSummary(String(error.details.exitCode ?? "unknown")),
          commands: [
            {
              command: `cco auth add ${profileId ?? "work"}`,
              description: text.errors.setupTokenRetryDescription,
            },
          ],
        };
      case "TOKEN_VERIFY_FAILED":
        return {
          title: text.errors.tokenVerifyFailedTitle,
          summary: error.message,
          commands: [
            {
              command: `cco auth add ${profileId ?? "work"}`,
              description: text.errors.tokenVerifyRetryDescription,
            },
          ],
        };
      case "HOST_CONFIG_NOT_SUPPORTED":
        return {
          title: text.errors.hostConfigNotSupportedTitle,
          summary: text.errors.hostConfigNotSupportedDescription,
          commands: [
            {
              command: "cco auth list",
              description: text.errors.inspectProfilesDescription,
            },
          ],
        };
      case "INVALID_CONFIG_ASSIGNMENT":
        return {
          title: text.errors.invalidConfigAssignmentTitle,
          summary: text.errors.invalidConfigAssignmentDescription,
          commands: [
            {
              command: "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
              description: text.errors.invalidConfigAssignmentDescription,
            },
          ],
        };
      case "UNKNOWN_CONFIG_KEY":
        return {
          title: text.errors.unknownConfigKeyTitle,
          summary: text.errors.unknownConfigKeyDescription,
          commands: [
            {
              command: "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
              description: text.errors.unknownConfigKeyDescription,
            },
          ],
        };
      case "INVALID_CONFIG_VALUE":
        return {
          title: text.errors.invalidConfigValueTitle,
          summary: text.errors.invalidConfigValueDescription,
          commands: [
            {
              command: "cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p work",
              description: text.errors.invalidConfigValueDescription,
            },
          ],
        };
      case "MISPLACED_LAUNCH_FLAG":
        return {
          title: text.errors.misplacedLaunchFlagTitle(String(error.details.flag ?? "--isolate")),
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
        };
      case "ISOLATE_MODE_NOT_IMPLEMENTED":
        return {
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
        };
      case "ISOLATE_SETUP_REQUIRED":
        return {
          title: text.errors.isolateSetupRequiredTitle,
          tone: "warn",
          summary: text.errors.isolateSetupRequiredSummary,
          commands: [
            {
              command: `cco --isolate ${profileId ?? "work"}`,
              description: text.errors.isolateSetupRequiredDescription(profileId ?? "work"),
            },
          ],
        };
      case "ISOLATE_LOGIN_FAILED":
        return {
          title: text.errors.isolateLoginFailedTitle,
          tone: "warn",
          summary: text.errors.exitCodeSummary(String(error.details.exitCode ?? "unknown")),
          commands: [
            {
              command: `cco --isolate ${profileId ?? "work"}`,
              description: text.errors.isolateLoginRetryDescription(profileId ?? "work"),
            },
          ],
        };
      case "ISOLATE_OVERLAY_ONLY":
        return {
          title: text.errors.isolateOverlayOnlyTitle,
          tone: "warn",
          summary: text.errors.isolateOverlayOnlySummary,
          commands: [
            {
              command: "cco auth list",
              description: text.errors.inspectProfilesDescription,
            },
          ],
        };
      case "PROMPT_CANCELLED":
        return {
          title: error.message,
          tone: "warn",
        };
      case "INVALID_SHOWCASE_TOPIC":
        return {
          title: text.errors.unknownShowcaseTopic(String(error.details.topic ?? "unknown")),
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
            {
              command: "cco showcase ink",
              description: text.errors.showcaseInkDescription,
            },
          ],
        };
      case "SUBPROCESS_ENV_SCRUB_REQUIRED":
        return {
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
        };
      default:
        return {
          title: error.message,
        };
    }
  }

  if (isErrnoException(error) && error.code === "ENOENT") {
    return {
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
    };
  }

  if (error instanceof Error && error.message) {
    return {
      title: error.message,
    };
  }

  return {
    title: text.errors.unexpectedError,
  };
}

export function buildStricliUnknownCommandModel(
  data: StricliUnknownCommandData,
  locale: AppLocale,
): CliErrorModel {
  const text = getUiText(locale);
  const stricliText = getStricliText(locale);
  const corrections = (data.corrections ?? []).map((command) =>
    command.replace(/`/g, ""),
  );
  const commandPrefix = data.prefix && data.prefix.length > 0 ? `${data.prefix.join(" ")} ` : "";

  return {
    title:
      locale === "en"
        ? `No command registered for "${data.input}".`
        : `입력 "${data.input}"에 해당하는 명령을 찾지 못했습니다.`,
    tone: "warn",
    summary:
      corrections.length > 0
        ? locale === "en"
          ? "Try one of these commands."
          : "다음 명령을 시도해 보세요."
        : undefined,
    nextStepTitle: text.errors.nextStepTitle,
    commands:
      corrections.length > 0
        ? corrections.map((command) => ({
            command: `cco ${commandPrefix}${command}`,
          }))
        : undefined,
  };
}

export function buildStricliNoLocaleTextModel(
  requestedLocale: string,
  defaultLocale: string,
  locale: AppLocale,
): CliErrorModel {
  const stricliText = getStricliText(locale);

  return {
    title:
      locale === "en" ? "Locale fallback applied." : "로케일 기본값으로 대체되었습니다.",
    tone: "warn",
    summary: stricliText.noTextAvailableForLocale({
      requestedLocale,
      defaultLocale,
      ansiColor: false,
    }),
  };
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}
