import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";

import Waystation from "../waystation.ts";
import {
  readWaystationFromFS as readWaystation,
  writeWaystationToFS as writeWaystation,
} from "../utils/mod.ts";

async function defaultMarkCommand(_options: unknown, path: string) {
  let waystation = await readWaystation();
  if (path) {
    waystation = Waystation.newMark(waystation, path);
    console.dir(waystation);
    writeWaystation(waystation);
  }
}

async function removeMarkCommand() {
  let waystation = await readWaystation();
  return new Command()
    .arguments("<index:number>")
    .description("Remove a mark")
    .action((_, index: number) => {
      waystation = Waystation.removeMarkByIndex(waystation, index);
      writeWaystation(waystation);
    });
}

async function orderMarkCommand() {
  let waystation = await readWaystation();
  return new Command()
    // discovered some unfortunate, awkward behaviour when typing
    // numeric arguments like: <index:number> <to:number>
    // 0th arguments like: mark 0 2 end up being nullified
    // perhaps treated as booleans rather than numbers
    // resulting in the second argument taking precidence
    .arguments("<index> <to>")
    .description("Move a mark")
    .action((_, index, to) => {
      waystation = Waystation.reorderMarks(
        waystation,
        Number(index),
        Number(to),
      );
      writeWaystation(waystation);
    });
}

export default async function markCommand() {
  return new Command()
    .arguments("[path:string]")
    .description(
      "Mark any file, folder or url and save to the current Waystation",
    )
    .action(defaultMarkCommand)
    .command("remove", await removeMarkCommand())
    .command("order", await orderMarkCommand());
}
