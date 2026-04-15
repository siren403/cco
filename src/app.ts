import { buildApplication, buildRouteMap } from "@stricli/core";
import { APP_NAME, APP_VERSION } from "./meta.ts";
import { authRoutes } from "./commands/auth.routes.ts";
import { configRoutes } from "./commands/config.routes.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { hostCommand } from "./commands/host.ts";
import { isolateRoutes } from "./commands/isolate.routes.ts";
import { runCommand } from "./commands/run.ts";
import { showcaseCommand } from "./commands/showcase.ts";
import { getStaticUiText, getStricliText } from "./i18n/index.ts";
import { renderCliError } from "./ui/renderers/error-message.ts";

const text = getStaticUiText();

const routes = buildRouteMap({
  routes: {
    run: runCommand,
    host: hostCommand,
    auth: authRoutes,
    config: configRoutes,
    doctor: doctorCommand,
    isolate: isolateRoutes,
    showcase: showcaseCommand,
  },
  defaultCommand: "run",
  docs: {
    brief: text.appDescription,
    hideRoute: {
      run: true,
    },
  },
});

export const app = buildApplication(routes, {
  name: APP_NAME,
  versionInfo: {
    currentVersion: APP_VERSION,
  },
  localization: {
    defaultLocale: "ko",
    loadText(locale) {
      const appLocale = locale?.toLowerCase().startsWith("en") ? "en" : "ko";
      return {
        ...getStricliText(locale),
        exceptionWhileRunningCommand: (exc, ansiColor) =>
          renderCliError(exc, { ansiColor, locale: appLocale }),
        commandErrorResult: (err, ansiColor) =>
          renderCliError(err, { ansiColor, locale: appLocale }),
      };
    },
  },
});
