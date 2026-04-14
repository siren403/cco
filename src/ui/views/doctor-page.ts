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
}

export function renderDoctorPage(
  data: DoctorPageData,
  options: RenderOptions = {},
): string {
  const ready = data.conflicts.length === 0;

  return joinBlocks([
    renderPanel(
      {
        title: "Doctor",
        tone: ready ? "ok" : "warn",
        badge: { label: ready ? "ready" : "check env", tone: ready ? "ok" : "warn" },
        body: ready
          ? [
              "Runtime looks ready for host launches and process-local auth overlays.",
              "No conflicting auth environment variables were detected in the current shell.",
            ]
          : [
              "Runtime is launchable, but the current shell has competing auth environment variables.",
              "Review the conflicting variables below before trusting an overlay launch.",
            ],
      },
      options,
    ),
    renderPanel(
      {
        title: "Runtime Snapshot",
        tone: "dim",
        body: renderKeyValueList(
          [
            { label: "claude-binary", value: data.claudeBinary },
            { label: "cco-home", value: data.ccoHome },
            { label: "profiles", value: String(data.profiles) },
            { label: "host-config-dir", value: data.hostConfigDir },
            {
              label: "env-conflicts",
              value: data.conflicts.length > 0 ? data.conflicts.join(", ") : "none detected",
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
            title: "Suggested Next Step",
            tone: "ok",
            body: renderCommandList(
              [
                {
                  command: "cco work",
                  description: "Launch Claude with a saved overlay profile.",
                },
                {
                  command: "cco host -c",
                  description: "Keep the host login and pass Claude's native continue flag through unchanged.",
                },
              ],
              options,
            ),
          },
          options,
        )
      : renderPanel(
          {
            title: "Suggested Cleanup",
            tone: "warn",
            body: renderBulletList(
              [
                "Unset the competing auth variables or start a clean shell.",
                "Run `cco doctor` again to confirm the env snapshot is clean.",
                "Prefer `cco auth add <profile>` plus `cco <profile>` over mixing API and OAuth env vars.",
              ],
              options,
            ),
          },
          options,
        ),
  ]);
}
