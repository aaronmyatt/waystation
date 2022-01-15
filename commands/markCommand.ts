import { Cliffy } from "../deps.ts";

import Waystation from "../core/waystation.ts";
import {
  projectFiles,
  readWaystationFromFS as readWaystation,
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
    .arguments("<index:number> <note:string>")
    .description("Add note resource")
    .action((_, index, note) => {
      const mark = waystation.marks[index];
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
        console.log(`
${newWaystation.name}
Mark: ${newWaystation.marks[index].name}
`);
        console.dir(newWaystation.marks[index].resources);
      }
    });
}

async function stationResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index:number> <uuid:string>")
    .description("Add note resource")
    .action(async (_, index, uuid) => {
      const mark = waystation.marks[index];
      const linkStation = await readWaystation(uuid);
      if (mark) {
        const newWaystation = Waystation.newResource(
          waystation,
          mark,
          "waystation",
          uuid,
          linkStation.name,
        );
        console.log(`
${newWaystation.name}
Mark: ${newWaystation.marks[index].name}
`);
        console.dir(newWaystation.marks[index].resources);
      }
    });
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

async function urlResourceCommand() {
  const waystation = await readWaystation();
  return new Cliffy.Command()
    .arguments("<index:number> <url:string>")
    .description("Add url resource")
    .action((_, index, url) => {
      if (isValidUrl(url)) {
        const mark = waystation.marks[index];
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
          console.log(`
${newWaystation.name}
Mark: ${newWaystation.marks[index].name}
`);
          console.dir(newWaystation.marks[index].resources);
        }
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
    .command("note", await noteResourceCommand())
    .command("url", await urlResourceCommand())
    .command("remove", await removeMarkCommand())
    .command("order", await orderMarkCommand());
}
