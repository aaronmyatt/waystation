import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";

import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markSelector } from "../components/mod.ts";

export default function listCommand() {
  return new Command()
    .description(
      "See all marks in the current Waystation",
    )
    .action(async () => {
      const waystation = await readWaystation();
      while (true) {
        await markSelector(waystation);
      }
    });
}
