import { buildApplication, buildRouteMap } from "@stricli/core";
import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "./meta.ts";
import { authRoutes } from "./commands/auth.routes.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { hostCommand } from "./commands/host.ts";
import { runCommand } from "./commands/run.ts";

const routes = buildRouteMap({
  routes: {
    run: runCommand,
    host: hostCommand,
    auth: authRoutes,
    doctor: doctorCommand,
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
});
