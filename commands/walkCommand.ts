import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markComponents } from "../components/mod.ts";

async function defaultWalkCommand() {
  const waystation = await readWaystation();
  const hasMarks = waystation.marks.length > 0;

  if (!hasMarks) {
    markComponents.renderNoMarksWarning();
  }

  await markComponents.renderMarkWalk(waystation);
}

export default function walkCommand() {
  return new Command()
    .description(
      "Explore marks one by one.",
    )
    .action(defaultWalkCommand);
}
