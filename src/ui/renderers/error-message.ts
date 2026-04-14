import { DomainError } from "../../core/errors/domain-error.ts";

export function renderCliError(error: unknown): string {
  if (error instanceof DomainError) {
    const profileId = error.details.profileId;

    switch (error.code) {
      case "PROFILE_NOT_FOUND":
        return [
          `Unknown profile: ${profileId ?? "unknown"}`,
          "",
          `Create it first:`,
          `  cco auth add ${profileId ?? "work"}`,
          "",
          `List existing profiles:`,
          `  cco auth list`,
        ].join("\n");
      case "TOKEN_NOT_FOUND":
        return [
          error.message,
          "",
          `Recreate the token with:`,
          `  cco auth add ${profileId ?? "work"}`,
        ].join("\n");
      case "INVALID_PROFILE_ID":
        return [
          error.message,
          "",
          `Example:`,
          `  cco auth add work`,
        ].join("\n");
      case "RESERVED_PROFILE_ID":
        return [
          error.message,
          "",
          `Choose another local alias, for example:`,
          `  cco auth add work`,
        ].join("\n");
      case "SETUP_TOKEN_FAILED":
        return [
          `The official \`claude setup-token\` flow did not complete successfully.`,
          `Exit code: ${String(error.details.exitCode ?? "unknown")}`,
          "",
          `Retry the command:`,
          `  cco auth add ${profileId ?? "work"}`,
        ].join("\n");
      case "TOKEN_VERIFY_FAILED":
        return [
          error.message,
          "",
          `Retry the token flow:`,
          `  cco auth add ${profileId ?? "work"}`,
        ].join("\n");
      case "PROMPT_CANCELLED":
        return error.message;
      default:
        return error.message;
    }
  }

  if (isErrnoException(error) && error.code === "ENOENT") {
    return [
      `Could not launch Claude because the binary was not found.`,
      "",
      `Check your setup with:`,
      `  cco doctor`,
    ].join("\n");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected error.";
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}
