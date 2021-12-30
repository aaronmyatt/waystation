import { Cliffy } from "../deps.ts";
import { waystationSchema } from "../core/waystation.ts";
import { writeBackupToFS, writeCurrentToFS } from "../utils/mod.ts";

export default function exportCommand() {
  return new Cliffy.Command()
    // .arguments()
    .description("Update current Waystation from stdin")
    .arguments("<schema:string>")
    .action(async (_, schema: string) => {
      try {
        const waystation = JSON.parse(schema);
        const validated = waystationSchema.parse(waystation);
        await writeBackupToFS(validated);
        writeCurrentToFS(validated);
        console.dir(validated);
      } catch (e) {
        if (e.name === "SyntaxError") {
          console.error("Invalid JSON");
          console.error(e.message);
        }
      }
    });
}
