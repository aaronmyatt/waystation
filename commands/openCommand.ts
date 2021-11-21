import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import {
  readRecentWaystations,
  readWaystationFromFS,
  writeBackupToFS,
  writeCurrentToFS,
} from "../utils/mod.ts";
import { stationSelector } from "../components/mod.ts";

export default function openCommand() {
  return new Command()
    .description(
      "Open previous waystation",
    )
    .action(async () => {
      const waystation = await readWaystationFromFS();
      const backups = await readRecentWaystations(undefined);
      const newWaystation = await stationSelector(backups);
      if (newWaystation) {
        writeCurrentToFS(newWaystation);
        console.log("Updated current Waystation");
      }
      writeBackupToFS(waystation);
    });
}
