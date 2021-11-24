import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markComponents } from "../components/mod.ts";

async function defaultWalkCommand() {
  const waystation = await readWaystation();
  const hasMarks = waystation.marks.length > 0;

  if (!hasMarks) {
    console.log("No marks found.");
    console.log("Use: waystion m '/a/path/of/interst:1'");
    console.log("To add new marks to the current Waystation");
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
