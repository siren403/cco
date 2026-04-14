import { joinBlocks, renderCommandList, renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderAuthAddIntro(
  profileId: string,
  options: RenderOptions = {},
): string {
  return joinBlocks([
    renderPanel(
      {
        title: "Add Overlay Profile",
        tone: "accent",
        badge: { label: profileId, tone: "accent" },
        body: [
          "This flow keeps the host Claude Code config intact.",
          "Only a verified setup-token for this local alias will be stored under cco's local home.",
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: "What Happens Next",
        tone: "ok",
        body: renderCommandList(
          [
            {
              command: "claude setup-token",
              description: "Runs the official Claude token flow in the current terminal/browser context.",
            },
            {
              command: `paste token for ${profileId}`,
              description: "The token is captured with hidden input and verified before it is saved.",
            },
          ],
          options,
        ),
      },
      options,
    ),
  ]);
}

export function renderAuthAddSuccess(
  profileId: string,
  options: RenderOptions = {},
): string {
  return renderPanel(
    {
      title: "Overlay Ready",
      tone: "ok",
      badge: { label: profileId, tone: "ok" },
      body: renderCommandList(
        [
          {
            command: `cco ${profileId}`,
            description: "Launch Claude with this overlay token and the host config.",
          },
          {
            command: `cco ${profileId} -c`,
            description: "Use the same overlay and pass Claude's native continue flag through unchanged.",
          },
          {
            command: "cco auth list",
            description: "Inspect saved profiles and token presence.",
          },
        ],
        options,
      ),
    },
    options,
  );
}
