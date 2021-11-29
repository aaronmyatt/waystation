import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.20.0/prompt/mod.ts";

import Waystation from "../core/waystation.ts";
import {
  pathContext,
  projectFiles,
  readWaystationFromFS as readWaystation,
  writeWaystationToFS as writeWaystation,
} from "../utils/mod.ts";

async function defaultMarkCommand(
  options: Record<string, string>,
  path: string,
  name: string,
) {
  let markName: string = options.name || name;
  let waystation = await readWaystation();
  if (path) {
    waystation = Waystation.newMark(waystation, path);
  } else {
    const files = await projectFiles();
    markName = await Input.prompt({
      message: "Name this mark",
    });
    console.log(`Name: ${markName}`);
    const file = await Input.prompt({
      message: "Attach a file path to this mark",
      suggestions: files.map((file) => file.path),
      list: true,
      info: true,
    });
    waystation = Waystation.newMark(waystation, file);
  }
  const mark = Waystation.lastMark(waystation);
  if ((markName && !!mark)) {
    waystation = Waystation.editMark(waystation, mark, "name", markName);
  }
  if (mark) {
    const context = await pathContext(mark.path, mark.line || 0);
    waystation = Waystation.newResource(
      waystation,
      mark,
      "note",
      context,
      "File Context",
    );
  }
  console.dir(waystation);
}

async function removeMarkCommand() {
  let waystation = await readWaystation();
  return new Command()
    .arguments("<index:number>")
    .description("Remove a mark")
    .action((_, index = 0) => {
      waystation = Waystation.removeMarkByIndex(waystation, Number(index));
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
    .arguments("[path:string] [name:string]")
    .description(
      "Mark any file, folder or url and save to the current Waystation",
    )
    .option("-n, --name <name>", "mark name")
    .action(defaultMarkCommand)
    .command("remove", await removeMarkCommand())
    .command("order", await orderMarkCommand());
}
