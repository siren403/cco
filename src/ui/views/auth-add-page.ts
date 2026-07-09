import { getUiText } from "../../i18n/index.ts";
import { joinBlocks, renderCommandList, renderPanel } from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderAuthAddIntro(
  profileId: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return joinBlocks([
    renderPanel(
      {
        title: text.authAdd.introTitle,
        tone: "accent",
        badge: { label: profileId, tone: "accent" },
        body: [
          text.authAdd.introLine1,
          text.authAdd.introLine2,
        ],
      },
      options,
    ),
    renderPanel(
      {
        title: text.authAdd.nextTitle,
        tone: "ok",
        body: renderCommandList(
          [
            {
              command: text.authAdd.nextSetupToken,
              description: text.authAdd.nextSetupTokenDescription,
            },
            {
              command: text.authAdd.nextPasteToken(profileId),
              description: text.authAdd.nextPasteTokenDescription,
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
  modeLabel: string,
  profilesFile: string,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  return renderPanel(
    {
      title: text.authAdd.successTitle,
      tone: "ok",
      badge: { label: profileId, tone: "ok" },
      body: [
        text.authAdd.successRuntimePolicy(modeLabel),
        "",
        text.authAdd.successEnvProtectionNote,
        "",
        renderCommandList(
          [
            {
              command: text.authAdd.successLaunch(profileId),
              description: text.authAdd.successLaunchDescription,
            },
            {
              command: text.authAdd.successContinue(profileId),
              description: text.authAdd.successContinueDescription,
            },
            {
              command: text.authAdd.successList,
              description: text.authAdd.successListDescription,
            },
            {
              command: text.authAdd.successConfigGet(profileId),
              description: text.authAdd.successConfigGetDescription,
            },
            {
              command: profilesFile,
              description: text.authAdd.successEditProfiles,
            },
          ],
          options,
        ),
      ],
    },
    options,
  );
}
