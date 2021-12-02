import { Cliffy } from "../deps.ts";

import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markComponents, markSelector } from "../components/mod.ts";

export default function listCommand() {
  return new Cliffy.Command()
    .description(
      "See all marks in the current Waystation",
    )
    .action(async () => {
      const waystation = await readWaystation();
      const hasMarks = waystation.marks.length > 0;

      if (!hasMarks) {
        markComponents.renderNoMarksWarning();
      }

      while (hasMarks) {
        const mark = await markSelector(waystation);
        await markComponents.renderMarkWalk(waystation, mark);
      }
    });
}
