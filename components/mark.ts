import {
  keypress,
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.20.0/keypress/mod.ts";
import { ansi, colors } from "https://deno.land/x/cliffy@v0.20.0/ansi/mod.ts";

import Waystation from "../core/waystation.ts";

import { writeCurrentToFS as writeWaystation } from "../utils/mod.ts";

import {
  markEditor,
  markPathEditor,
  renderMark,
  renderResource,
} from "./mod.ts";

async function renderMarkWalk(
  waystation: IWaystation,
  startAt: IMark | undefined = undefined,
) {
  let index = 0;

  if (!!startAt && startAt.path) {
    index = waystation.marks.findIndex((mark) => mark.id === startAt.id);
  }

  while (true) {
    const mark = waystation.marks[index];

    console.log(ansi.cursorTo(0, 0).eraseDown());
    console.log(
      `Mark: ${colors.magenta((index + 1) + "/" + (waystation.marks.length))}`,
    );
    const table = renderMark(mark);
    table.render();
    console.log(
      ` edit:${colors.bold("e")}  up:${colors.bold("p")}  down:${
        colors.bold("n")
      }  next:${colors.bold("space")} `,
    );
    mark.resources && mark.resources.map((resource) => {
      const table = renderResource(resource);
      table.render();
    });

    const press: KeyPressEvent = await keypress();

    if (press.ctrlKey && press.key === "c") {
      break;
    }

    if (press.shiftKey && press.key === "e") {
      await markPathEditor(mark);
      continue;
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

function renderNoMarksWarning() {
  console.log(`
${colors.brightRed("No marks found.")}
To add new marks to the current Waystation
Use: ${colors.bold("waystion m '/a/path/of/interst:1'")}
    `);
}

export default { renderMarkWalk, renderNoMarksWarning };
