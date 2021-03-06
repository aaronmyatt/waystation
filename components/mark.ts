import {
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.20.0/keypress/mod.ts";
import { Cliffy } from "../deps.ts";
import Waystation from "../core/waystation.ts";

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

    console.log(Cliffy.Ansi.cursorTo(0, 0).eraseDown());
    console.log(
      `Mark: ${
        Cliffy.Colors.magenta((index + 1) + "/" + (waystation.marks.length))
      }`,
    );
    const table = renderMark(mark);
    table.render();
    console.log(
      ` edit:${Cliffy.Colors.bold("e")}  up:${Cliffy.Colors.bold("p")}  down:${
        Cliffy.Colors.bold("n")
      }  next:${Cliffy.Colors.bold("space")}  prev:${
        Cliffy.Colors.bold("backspace")
      } `,
    );
    mark.resources && mark.resources.map((resource) => {
      const table = renderResource(resource);
      table.render();
    });

    const press: KeyPressEvent = await Cliffy.keypress();

    if (press.ctrlKey && press.key === "c") {
      break;
    }

    if (press.shiftKey && press.key === "e") {
      await markPathEditor(mark);
      continue;
    }

    if (press.key === "e" || press.key === "enter") {
      waystation = await markEditor(waystation, mark);
      continue;
    }

    if (press.key === "p") {
      waystation = Waystation.moveMarkUp(waystation, mark);
      index > 0 && index--;
      continue;
    }

    if (press.key === "n") {
      waystation = Waystation.moveMarkDown(waystation, mark);
      (index < (waystation.marks.length - 1)) && index++;
      continue;
    }

    if (
      (press.shiftKey && press.key === "space") ||
      (press.shiftKey && press.key === "tab") || (press.key === "backspace")
    ) {
      if (index > 0) {
        index--;
      } else {
        index = waystation.marks.length - 1;
      }
      continue;
    }
    if (press.key === "space" || press.key === "tab") {
      if (index < waystation.marks.length - 1) {
        index++;
      } else {
        index = 0;
      }
    }
  }
}

function renderNoMarksWarning() {
  console.log(`
${Cliffy.Colors.brightRed("No marks found.")}
To add new marks to the current Waystation
Use: ${Cliffy.Colors.bold("waystion m '/a/path/of/interst:1'")}
    `);
}

export default { renderMarkWalk, renderNoMarksWarning };
