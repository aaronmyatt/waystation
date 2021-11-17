import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";

import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markSelector  } from "../components/mod.ts";

export default function listCommand() {
  return new Command()
    .description(
      "See all marks in the current Waystation",
    )
    .action(async () => {
      const waystation = await readWaystation();
      const hasMarks = waystation.marks.length > 0;
      if(!hasMarks){
        console.log("No marks found.")
        console.log("Use: waystion m '/a/path/of/interst:1'")
        console.log("To add new marks to the current Waystation")
      }
      while (hasMarks) {
        await markSelector(waystation);
      }
    });
}
