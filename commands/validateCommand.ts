import { Cliffy } from "../deps.ts";
import { waystationSchema } from "../core/waystation.ts";

export default function exportCommand() {
  return new Cliffy.Command()
    // .arguments()
    .description("Determine whether stdin is a valid waystation schema")
    .arguments("<schema:string>")
    .action((_, schema: string) => {
      try {
        const waystation = JSON.parse(schema);
        const validated = waystationSchema.safeParse(waystation);
        console.dir(JSON.stringify(validated));
      } catch (e) {
        if (e.name === "SyntaxError") {
          console.error("Invalid JSON");
          console.error(e.message);
        }
      }
    });
}
