import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "../../meta.ts";

export function renderRootHelp(): string {
  return [
    `${APP_NAME} ${APP_VERSION}`,
    APP_DESCRIPTION,
    "",
    "Usage",
    `  ${APP_NAME} [profile] [claude args...]`,
    `  ${APP_NAME} host [claude args...]`,
    `  ${APP_NAME} auth add <profile>`,
    `  ${APP_NAME} auth list`,
    `  ${APP_NAME} auth remove <profile>`,
    `  ${APP_NAME} doctor`,
    "",
    "Profiles",
    "  A profile is a local alias you choose for a Claude setup-token, such as work or backup.",
    "",
    "Examples",
    `  ${APP_NAME} auth add work`,
    `  ${APP_NAME} work`,
    `  ${APP_NAME} work -c`,
    `  ${APP_NAME} host -c`,
    `  ${APP_NAME} auth list`,
  ].join("\n");
}
