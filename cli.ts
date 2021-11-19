import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";

import { readWaystationFromFS as readWaystation } from "./utils/mod.ts";
import {
  renderRecentWaystationList,
  renderWaystation,
} from "./components/mod.ts";

import {
  listCommand,
  markCommand,
  newCommand,
  walkCommand,
  openCommand
} from "./commands/mod.ts";

(async function () {
  await new Command()
    .name("Waystation")
    .version("0.0.1")
    .description('"This is the way" - Mandalorian')
    .action(async () => {
      const waystation = await readWaystation();
      const table = renderWaystation(waystation);
      table.render();
      renderRecentWaystationList().then((table) => table.render());
    })
    .command("new", await newCommand())
    .command("n", await newCommand())
    .command("mark", await markCommand())
    .command("m", await markCommand())
    .command("list", await listCommand())
    .command("l", await listCommand())
    .command("walk", await walkCommand())
    .command("w", await walkCommand())
    .command("open", await openCommand())
    .command("o", await openCommand())
    .parse(Deno.args);
})();
