import { buildRouteMap } from "@stricli/core";
import { getStaticUiText } from "../i18n/index.ts";
import { authAddCommand } from "./auth.add.ts";
import { authListCommand } from "./auth.list.ts";
import { authRemoveCommand } from "./auth.remove.ts";

const text = getStaticUiText();

export const authRoutes = buildRouteMap({
  routes: {
    add: authAddCommand,
    list: authListCommand,
    remove: authRemoveCommand,
  },
  docs: {
    brief: text.commandBriefs.auth,
  },
});
