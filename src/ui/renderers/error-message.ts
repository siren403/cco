import { DomainError } from "../../core/errors/domain-error.ts";
import { renderErrorPage } from "../views/error-page.ts";
import type { RenderOptions } from "../theme.ts";

export function renderCliError(error: unknown, options: RenderOptions = {}): string {
  if (error instanceof DomainError) {
    const profileId = error.details.profileId;

    switch (error.code) {
      case "PROFILE_NOT_FOUND":
        return renderErrorPage(
          {
            title: `Unknown profile: ${profileId ?? "unknown"}`,
            summary: "Create the local alias first, or inspect the saved overlay profiles.",
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: "Create and verify a new overlay profile.",
              },
              {
                command: "cco auth list",
                description: "Inspect the saved host and overlay profiles.",
              },
            ],
          },
          options,
        );
      case "TOKEN_NOT_FOUND":
        return renderErrorPage(
          {
            title: error.message,
            summary: "The local alias exists, but its token file is missing or unreadable.",
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: "Re-run the official setup-token flow and save a fresh token.",
              },
            ],
          },
          options,
        );
      case "INVALID_PROFILE_ID":
        return renderErrorPage(
          {
            title: error.message,
            tone: "warn",
            commands: [
              {
                command: "cco auth add work",
                description: "Use lowercase letters, numbers, hyphens, or underscores only.",
              },
            ],
          },
          options,
        );
      case "RESERVED_PROFILE_ID":
        return renderErrorPage(
          {
            title: error.message,
            tone: "warn",
            summary: "Reserved names map to built-in cco commands and cannot be reused as local aliases.",
            commands: [
              {
                command: "cco auth add work",
                description: "Choose a different local alias for the setup-token.",
              },
            ],
          },
          options,
        );
      case "SETUP_TOKEN_FAILED":
        return renderErrorPage(
          {
            title: "The official `claude setup-token` flow did not complete successfully.",
            summary: `Exit code: ${String(error.details.exitCode ?? "unknown")}`,
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: "Retry the setup-token flow for this local alias.",
              },
            ],
          },
          options,
        );
      case "TOKEN_VERIFY_FAILED":
        return renderErrorPage(
          {
            title: "Token verification failed.",
            summary: error.message,
            commands: [
              {
                command: `cco auth add ${profileId ?? "work"}`,
                description: "Capture a fresh setup-token and verify it again.",
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
            title: error.message,
            tone: "warn",
            commands: [
              {
                command: "cco showcase all",
                description: "Preview the full UI surface.",
              },
              {
                command: "cco showcase auth",
                description: "Preview the token onboarding panels.",
              },
              {
                command: "cco showcase errors",
                description: "Preview the recovery/error states only.",
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
        title: "Could not launch Claude because the binary was not found.",
        summary: "The configured or discovered Claude executable is missing from the current environment.",
        commands: [
          {
            command: "cco doctor",
            description: "Inspect binary resolution, host config, and env precedence.",
          },
          {
            command: "cco showcase auth",
            description: "Preview the onboarding flow without launching Claude.",
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
      title: "Unexpected error.",
    },
    options,
  );
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}
