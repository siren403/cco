import { buildRouteMap } from "@stricli/core";
import { getStaticUiText } from "../i18n/index.ts";
import { teamsFreshCommand } from "./teams.fresh.ts";
import { teamsRemoveCommand } from "./teams.remove.ts";
import { teamsStatusCommand } from "./teams.status.ts";

const text = getStaticUiText();

export const teamsRoutes = buildRouteMap({
  routes: {
    status: teamsStatusCommand,
    remove: teamsRemoveCommand,
    fresh: teamsFreshCommand,
  },
  docs: {
    brief: text.commandBriefs.teams,
  },
});
