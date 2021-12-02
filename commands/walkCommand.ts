import { Cliffy } from "../deps.ts";
import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markComponents } from "../components/mod.ts";

async function defaultWalkCommand() {
  const waystation = await readWaystation();
  const hasMarks = waystation.marks.length > 0;

  if (!hasMarks) {
    markComponents.renderNoMarksWarning();
  } else {
    await markComponents.renderMarkWalk(waystation);
  }
}

export default function walkCommand() {
  return new Cliffy.Command()
    .description(
      "Explore marks one by one.",
    )
    .action(defaultWalkCommand);
}
