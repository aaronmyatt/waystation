import { Cliffy } from "../deps.ts";

import Waystation from "../core/waystation.ts";
import {
  associateWaystationToProject,
  readWaystationFromFS as readWaystation,
  writeBackupToFS,
  writeCurrentToFS,
} from "../utils/mod.ts";

export default async function newCommand() {
  let waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<name:string>")
    .description(
      "Create and name a new Waystation, overwriting the current Waystation",
    )
    .action(async (_, name: string) => {
      await writeBackupToFS(waystation);
      waystation = Waystation(name);
      console.dir(waystation);
      writeCurrentToFS(waystation);
      associateWaystationToProject(waystation);
    });
}
