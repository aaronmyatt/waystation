import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.20.0/prompt/mod.ts";

import Waystation from "../core/waystation.ts";
import {
  pathContext,
  projectFiles,
  readWaystationFromFS as readWaystation,
  writeWaystationToFS as writeWaystation,
} from "../utils/mod.ts";

async function defaultMarkCommand(_options: unknown, path: string) {
  let waystation = await readWaystation();
  if (path) {
    waystation = Waystation.newMark(waystation, path);
    await writeWaystation(waystation);
    const mark = Waystation.lastMark(waystation);
    if (mark) {
      const context = await pathContext(mark.path, mark.line || 0);
      waystation = Waystation.newResource(
        waystation,
        mark,
        "note",
        context,
        "File Context",
      );
      writeWaystation(waystation);
    }
    console.dir(waystation);
  } else {
    const files = await projectFiles();
    const name = await Input.prompt({
      message: "Name this mark",
    });
    console.log(`Name: ${name}`)
    const file = await Input.prompt({
      message: "Attach a file path to this mark",
      suggestions: files.map((file) => file.path),
      list: true,
      info: true,
    });
    waystation = Waystation.newMark(waystation, file);
    const mark = Waystation.lastMark(waystation);
    if(mark){
      waystation = Waystation.editMark(waystation, mark, 'name', name)
    }
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
