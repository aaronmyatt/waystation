import { Cliffy } from "../deps.ts";

export default function exportCommand() {
  return new Cliffy.Command()
    // .arguments()
    .description("Export Waystation as Markdown")
    .action((_optons) => {
    });
}
