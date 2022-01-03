import { Cliffy } from "../deps.ts";
import {
  readRecentWaystations,
  readWaystationFromFS,
  writeBackupToFS,
  writeCurrentToFS,
} from "../utils/mod.ts";
import { stationSelector } from "../components/mod.ts";

export default function openCommand() {
  return new Cliffy.Command()
    .description(
      "Open previous waystation",
    )
    .arguments("[uid:string]")
    .option(
      "-j, --json",
      "output raw list of available waystations and their ids",
    )
    .action(async (options: Record<string, unknown>, uid?: string) => {
      const backups = await readRecentWaystations(undefined);
      if (options.json) {
        const stationList = backups.map((station) => {
          const { name, id } = station;
          return {
            id,
            name,
          };
        });
        console.log(JSON.stringify(stationList, null, "  "));
      } else {
        const waystation = await readWaystationFromFS();
        const newWaystation = await stationSelector(backups, uid);

        if (newWaystation) {
          writeCurrentToFS(newWaystation);
          console.log("Updated current Waystation");
        }

        writeBackupToFS(waystation);
      }
    });
}
