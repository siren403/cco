import { getUiText } from "../../i18n/index.ts";
import {
  joinBlocks,
  renderBulletList,
  renderCommandList,
  renderKeyValueList,
  renderPanel,
} from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export interface DoctorPageData {
  readonly claudeBinary: string;
  readonly ccoHome: string;
  readonly profiles: number;
  readonly hostConfigDir: string;
  readonly conflicts: readonly string[];
  readonly launchMode: string;
  readonly bypassPermissionsPolicy: string;
}

export function renderDoctorPage(
  data: DoctorPageData,
  options: RenderOptions = {},
): string {
  const text = getUiText(options.locale);
  const ready = data.conflicts.length === 0;

  return joinBlocks([
    renderPanel(
      {
        title: text.doctor.title,
        tone: ready ? "ok" : "warn",
        badge: {
          label: ready ? text.doctor.readyBadge : text.doctor.checkEnvBadge,
          tone: ready ? "ok" : "warn",
        },
        body: ready
          ? [text.doctor.readyLine1, text.doctor.readyLine2]
          : [text.doctor.conflictLine1, text.doctor.conflictLine2],
      },
      options,
    ),
    renderPanel(
      {
        title: text.doctor.snapshotTitle,
        tone: "dim",
        body: renderKeyValueList(
          [
            { label: "claude-binary", value: data.claudeBinary },
            { label: "cco-home", value: data.ccoHome },
            { label: "profiles", value: String(data.profiles) },
            { label: "host-config-dir", value: data.hostConfigDir },
            {
              label: text.doctor.bypassPolicyLabel,
              value: data.bypassPermissionsPolicy,
            },
            {
              label: "env-conflicts",
              value:
                data.conflicts.length > 0
                  ? data.conflicts.join(", ")
                  : text.doctor.noneDetected,
              tone: data.conflicts.length > 0 ? "warn" : "ok",
            },
            { label: "launch-mode", value: data.launchMode },
          ],
          options,
        ),
      },
      options,
    ),
    ready
      ? renderPanel(
          {
            title: text.doctor.suggestedNextStepTitle,
            tone: "ok",
            body: renderCommandList(
              [
                {
                  command: "cco work",
                  description: text.doctor.launchDescription,
                },
                {
                  command: "cco host -c",
                  description: text.doctor.hostContinueDescription,
                },
              ],
              options,
            ),
          },
          options,
        )
      : renderPanel(
          {
            title: text.doctor.suggestedCleanupTitle,
            tone: "warn",
            body: renderBulletList(
              [
                text.doctor.cleanup1,
                text.doctor.cleanup2,
                text.doctor.cleanup3,
              ],
              options,
            ),
          },
          options,
        ),
  ]);
}
