import {
  buildDoctorPageModel,
  type DoctorPageData,
} from "../models/doctor-page.ts";
import {
  joinBlocks,
  renderBulletList,
  renderCommandList,
  renderKeyValueList,
  renderPanel,
} from "../layout/primitives.ts";
import type { RenderOptions } from "../theme.ts";

export function renderDoctorPage(
  data: DoctorPageData,
  options: RenderOptions = {},
): string {
  const model = buildDoctorPageModel(data, options.locale ?? "ko");

  return joinBlocks([
    renderPanel(
      {
        title: model.title,
        tone: model.titleTone,
        badge: {
          label: model.badge,
          tone: model.titleTone,
        },
        body: model.introLines,
      },
      options,
    ),
    renderPanel(
      {
        title: model.snapshotTitle,
        tone: "dim",
        body: renderKeyValueList(model.snapshotEntries, options),
      },
      options,
    ),
    renderPanel(
      {
        title: model.nextStepTitle,
        tone: model.nextStepTone,
        body: model.nextStepCommands
          ? renderCommandList(model.nextStepCommands, options)
          : renderBulletList(model.cleanupBullets ?? [], options),
      },
      options,
    ),
  ]);
}
