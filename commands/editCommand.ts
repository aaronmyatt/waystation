import { Cliffy } from "../deps.ts";
import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import { markEditor, waystationEditor } from "../components/mod.ts";

export default function editCommand() {
  return new Cliffy.Command()
    .arguments("[markIndex:number]")
    .description("Update current waystation with a tag")
    .action(async (_optons, markIndex: number) => {
      let waystation = await readWaystation();
      console.log({
        markIndex,
      });
      if (Number(markIndex) >= 0) {
        await markEditor(waystation, waystation.marks[markIndex]);
      } else {
        waystation = await waystationEditor(waystation);
        console.dir(waystation);
      }
    });
}
