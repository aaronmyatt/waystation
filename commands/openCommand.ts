import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { readRecentWaystations, readWaystationFromFS, writeCurrentToFS, writeBackupToFS } from '../utils/mod.ts';
import { stationSelector } from '../components/mod.ts';

export default function openCommand() {
  return new Command()
    .description(
      "Open previous waystation",
    )
    .action(async () => {
      const waystation = await readWaystationFromFS();
      const backups = await readRecentWaystations(undefined);
      const newWaystation = await stationSelector(backups);
      if(newWaystation){
        writeCurrentToFS(waystation);
        console.log('Updated current active Waystation');
      }
      writeBackupToFS(waystation);
    });
}
