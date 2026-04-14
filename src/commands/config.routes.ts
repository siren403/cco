import { buildRouteMap } from "@stricli/core";
import { getStaticUiText } from "../i18n/index.ts";
import { configGetCommand } from "./config.get.ts";
import { configSetCommand } from "./config.set.ts";

const text = getStaticUiText();

export const configRoutes = buildRouteMap({
  routes: {
    get: configGetCommand,
    set: configSetCommand,
  },
  docs: {
    brief: text.commandBriefs.config,
  },
});
