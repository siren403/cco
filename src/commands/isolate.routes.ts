import { buildRouteMap } from "@stricli/core";
import { getStaticUiText } from "../i18n/index.ts";
import { isolateFreshCommand } from "./isolate.fresh.ts";
import { isolateRemoveCommand } from "./isolate.remove.ts";
import { isolateStatusCommand } from "./isolate.status.ts";

const text = getStaticUiText();

export const isolateRoutes = buildRouteMap({
  routes: {
    status: isolateStatusCommand,
    remove: isolateRemoveCommand,
    fresh: isolateFreshCommand,
  },
  docs: {
    brief: text.commandBriefs.isolate,
  },
});
