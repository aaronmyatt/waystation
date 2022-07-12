import { Cliffy } from "../deps.ts";

import Waystation from "../core/waystation.ts";
import {
  projectFiles,
  readWaystationFromFS as readWaystation,
  writeBackupToFS,
  writeCurrentToFS,
} from "../utils/mod.ts";

function printNameAndMark(name: string, mark: IMark) {
  console.log(`
${name}
Mark: ${mark.name}
`);
  console.dir(mark.resources);
}

function isValidUrl(url: string): boolean {
  const protocols = ["http:", "https:"];
  try {
    const Url = new URL(url);
    if (protocols.includes(Url.protocol)) {
      // protocol valid
    } else {
      throw new TypeError(
        `Incorrect protocol (${Url.protocol}) for url: ${url}`,
      );
    }
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
}
``;

async function defaultMarkCommand(
  options: Record<string, string>,
  path: string|undefined,
  name: string|undefined,
) {
  let markName: string|undefined = options.name || name;
  let waystation = await readWaystation();
  if (path) {
    waystation = Waystation.newMark(waystation, path);
  } else {
    const files = await projectFiles();
    markName = await Cliffy.Input.prompt({
      message: "Name this mark",
    });
    console.log(`Name: ${markName}`);
    const file = await Cliffy.Input.prompt({
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

  console.dir(waystation);
}

async function removeMarkCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index:number>")
    .description("Remove a mark")
    .action((_, index = 0) => {
      Waystation.removeMarkByIndex(waystation, Number(index));
    });
}

async function orderMarkCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    // discovered some unfortunate, awkward behaviour when typing
    // numeric arguments like: <index:number> <to:number>
    // 0th arguments like: mark 0 2 end up being nullified
    // perhaps treated as booleans rather than numbers
    // resulting in the second argument taking precidence
    .arguments("<index> <to>")
    .description("Move a mark")
    .action((_, index, to) => {
      Waystation.reorderMarks(
        waystation,
        Number(index),
        Number(to),
      );
    });
}

async function noteResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index> <note:string>")
    .description("Add note resource")
    .action((_, index, note) => {
      const mark = waystation.marks[Number(index)];
      if (mark) {
        const markNotes = mark.resources?.filter((resource) =>
          resource.type === "note"
        ) || [];
        const name = `Note #${markNotes.length + 1 || 1}`;
        const newWaystation = Waystation.newResource(
          waystation,
          mark,
          "note",
          note,
          name,
        );
        printNameAndMark(
          newWaystation.name,
          newWaystation.marks[Number(index)],
        );
      }
    });
}

async function stationResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index> <uuid:string>")
    .description("Add note resource")
    .action(async (_, index, uuid) => {
      const mark = waystation.marks[Number(index)];
      const linkStation = await readWaystation(uuid);
      if (mark) {
        const newWaystation = Waystation.newResource(
          waystation,
          mark,
          "waystation",
          uuid,
          linkStation.name,
        );
        printNameAndMark(
          newWaystation.name,
          newWaystation.marks[Number(index)],
        );
      }
    });
}

async function urlResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index> <url:string>")
    .description("Add url resource")
    .action((_, index, url) => {
      if (isValidUrl(url)) {
        const mark = waystation.marks[Number(index)];
        if (mark) {
          const markUrls = mark.resources?.filter((resource) =>
            resource.type === "url"
          ) || [];
          const name = `Url #${markUrls.length + 1 || 1}`;
          const newWaystation = Waystation.newResource(
            waystation,
            mark,
            "url",
            url,
            name,
          );

          printNameAndMark(
            newWaystation.name,
            newWaystation.marks[Number(index)],
          );
        }
      }
    });
}

async function subwayResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command().description(
    "Create a new Waystation associated to this mark",
  )
    .option("-o, --open", "Create and Open the Sub-Waystation")
    .arguments("<index> [name:string]")
    .action(async (option, index, name = "") => {
      const mark = waystation.marks[Number(index)];
      name = name || `From: ${mark.name}:${waystation.id}`;
      const newWaystation = Waystation(name);
      await writeBackupToFS(newWaystation);
      const updatedWaystation = Waystation.newResource(
        waystation,
        mark,
        "waystation",
        newWaystation.id,
        name,
      );
      printNameAndMark(updatedWaystation.name, updatedWaystation.marks[Number(index)]);
      if (option.open) {
        await writeCurrentToFS(newWaystation);
        console.log(`Current Waystation updated to: ${newWaystation.name}`);
      }
    });
}

export default async function markCommand() {
  return new Cliffy.Command()
    .arguments("[path:string] [name:string]")
    .description(
      "Mark any file, folder or url and save to the current Waystation",
    )
    .option("-n, --name <name>", "mark name")
    .action(defaultMarkCommand)
    .command("station", await stationResourceCommand())
    .command("subway", await subwayResourceCommand())
    .command("note", await noteResourceCommand())
    .command("url", await urlResourceCommand())
    .command("remove", await removeMarkCommand())
    .command("order", await orderMarkCommand())
    .reset();
}
