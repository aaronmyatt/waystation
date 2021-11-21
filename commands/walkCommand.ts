import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import {
  keypress,
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.20.0/keypress/mod.ts";
import { ansi, colors } from "https://deno.land/x/cliffy@v0.20.0/ansi/mod.ts";

import Waystation from "../core/waystation.ts";
import {
  readWaystationFromFS as readWaystation,
  writeWaystationToFS as writeWaystation,
} from "../utils/mod.ts";
import { markEditor, renderMark } from "../components/mod.ts";

async function defaultWalkCommand() {
  let index = 0;
  let waystation = await readWaystation();
  const hasMarks = waystation.marks.length > 0;

  if (!hasMarks) {
    console.log("No marks found.");
    console.log("Use: waystion m '/a/path/of/interst:1'");
    console.log("To add new marks to the current Waystation");
  }

  while (hasMarks) {
    const mark = waystation.marks[index];
    console.log(ansi.cursorTo(0, 0).eraseDown());
    console.log(
      `Mark: ${colors.magenta((index + 1) + "/" + (waystation.marks.length))}`,
    );
    const table = renderMark(mark);
    table.render();
    console.log(
      ` edit:${colors.bold('e')}  up:${colors.bold('p')}  down:${colors.bold('n')}  next:${colors.bold('space')} `
    );

    const press: KeyPressEvent = await keypress();

    if (press.ctrlKey && press.key === "c") {
      Deno.exit();
    }

    if (press.key === "e") {
      waystation = await markEditor(waystation, mark);
      writeWaystation(waystation);
      continue;
    }

    if (press.key === "p") {
      waystation = Waystation.moveMarkUp(waystation, mark);
      index > 0 && index--;
      writeWaystation(waystation);
      continue;
    }

    if (press.key === "n") {
      waystation = Waystation.moveMarkDown(waystation, mark);
      (index < (waystation.marks.length - 1)) && index++;
      writeWaystation(waystation);
      continue;
    }

    if (index < waystation.marks.length - 1) {
      index++;
    } else {
      index = 0;
    }
  }
}

export default function walkCommand() {
  return new Command()
    .description(
      "Explore marks one by one.",
    )
    .action(defaultWalkCommand);
}
