import { buildApplication, buildRouteMap } from "@stricli/core";
import { APP_NAME, APP_VERSION } from "./meta.ts";
import { authRoutes } from "./commands/auth.routes.ts";
import { configRoutes } from "./commands/config.routes.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { hostCommand } from "./commands/host.ts";
import { isolateRoutes } from "./commands/isolate.routes.ts";
import { runCommand } from "./commands/run.ts";
import { showcaseCommand } from "./commands/showcase.ts";
import { uiCommand } from "./commands/ui.ts";
import { getStaticUiText, getStricliText } from "./i18n/index.ts";
import { createStricliMarker } from "./ui/ink/stricli-ink-intercept.ts";

const text = getStaticUiText();

const routes = buildRouteMap({
  routes: {
    run: runCommand,
    host: hostCommand,
    auth: authRoutes,
    config: configRoutes,
    doctor: doctorCommand,
    isolate: isolateRoutes,
    ui: uiCommand,
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
      const stricliText = getStricliText(locale);
      return {
        ...stricliText,
        noCommandRegisteredForInput: ({ input, corrections }) =>
          createStricliMarker("no-command", { input, corrections }),
        noTextAvailableForLocale: ({ requestedLocale, defaultLocale }) =>
          createStricliMarker("no-locale-text", { requestedLocale, defaultLocale }),
        exceptionWhileParsingArguments: (exc) => createStricliMarker("parse-error", exc),
        exceptionWhileLoadingCommandFunction: (exc) =>
          createStricliMarker("load-command-error", exc),
        exceptionWhileLoadingCommandContext: (exc) =>
          createStricliMarker("load-context-error", exc),
        exceptionWhileRunningCommand: (exc) =>
          createStricliMarker("run-command-error", exc),
        commandErrorResult: (err) => createStricliMarker("command-error", err),
      };
    },
  },
});
