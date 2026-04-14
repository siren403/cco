import { buildApplication, buildRouteMap, text_en } from "@stricli/core";
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "./meta.ts";
import { authRoutes } from "./commands/auth.routes.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { hostCommand } from "./commands/host.ts";
import { runCommand } from "./commands/run.ts";
import { showcaseCommand } from "./commands/showcase.ts";
import { renderCliError } from "./ui/renderers/error-message.ts";

const routes = buildRouteMap({
  routes: {
    run: runCommand,
    host: hostCommand,
    auth: authRoutes,
    doctor: doctorCommand,
    showcase: showcaseCommand,
  },
  defaultCommand: "run",
  docs: {
    brief: APP_DESCRIPTION,
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
    loadText() {
      return {
        ...text_en,
        exceptionWhileRunningCommand: (exc, ansiColor) =>
          renderCliError(exc, { ansiColor }),
        commandErrorResult: (err, ansiColor) =>
          renderCliError(err, { ansiColor }),
      };
    },
  },
});
