import { Cliffy } from "../deps.ts";

import Waystation from "../core/waystation.ts";
import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";

export default function tagCommand() {
  return new Cliffy.Command()
    .arguments("[tag:string]")
    .description("Update current waystation with a tag")
    .action(async (_optons, tag: string | undefined) => {
      let waystation = await readWaystation();
      if (tag) {
        waystation = Waystation.addTag(waystation, tag);
      }
      console.dir({
        "name": waystation.name || waystation.id,
        "tags": waystation.tags,
      });
    });
}
