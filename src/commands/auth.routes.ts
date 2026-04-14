import { buildRouteMap } from "@stricli/core";
import { authAddCommand } from "./auth.add.ts";
import { authListCommand } from "./auth.list.ts";
import { authRemoveCommand } from "./auth.remove.ts";

export const authRoutes = buildRouteMap({
  routes: {
    add: authAddCommand,
    list: authListCommand,
    remove: authRemoveCommand,
  },
  docs: {
    brief: "Manage overlay profile tokens",
  },
});
