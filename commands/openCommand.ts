import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";

export default function openCommand() {
  return new Command()
    .description(
      "Open previous waystation",
    )
    .action(async () => {
    });
}
