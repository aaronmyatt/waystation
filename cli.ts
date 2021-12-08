import { Cliffy } from "./deps.ts";
import {
  readRecentWaystations,
  readWaystationFromFS as readWaystation,
} from "./utils/mod.ts";
import registerListeners from "./listeners/mod.ts";

import {
  editCommand,
  listCommand,
  markCommand,
  newCommand,
  openCommand,
  tagCommand,
  walkCommand,
} from "./commands/mod.ts";

registerListeners();

(async function () {
  await new Cliffy.Command()
    .name("Waystation")
    .version("0.0.1")
    .description('"This is the way" - Mandalorian')
    .option("-j, --json", "Output Waystation JSON representation")
    .action(async (options: Record<string, unknown>) => {
      const waystation = await readWaystation();
      if (options.json) {
        console.log(JSON.stringify(waystation));
      } else {
        console.dir({
          ...waystation,
          marks: waystation.marks.map((mark) => mark.name || mark.id),
        });
        const recentWaystations = await readRecentWaystations(5);
        console.dir({
          "Recent Stations": recentWaystations.map((station) =>
            station.name || station.id
          ),
        });
      }
    })
    .command("new", await newCommand())
    .command("n", await newCommand())
    .command("mark", await markCommand())
    .command("m", await markCommand())
    .command("list", listCommand())
    .command("l", listCommand())
    .command("walk", walkCommand())
    .command("w", walkCommand())
    .command("open", openCommand())
    .command("o", openCommand())
    .command("tag", tagCommand())
    .command("t", tagCommand())
    .command("edit", editCommand())
    .command("e", editCommand())
    .parse(Deno.args);
})();
