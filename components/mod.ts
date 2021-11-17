import {
  Cell,
  Row,
  Table,
} from "https://deno.land/x/cliffy@v0.20.0/table/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.20.0/ansi/colors.ts";
import { Select } from "https://deno.land/x/cliffy@v0.20.0/prompt/mod.ts";

// import { readLines } from "https://deno.land/std@0.113.0/io/mod.ts";

import Waystation, { EmptyMark } from "../waystation.ts";
import { readRecentWaystations } from "../utils/mod.ts";

const tableTitle = (title: string): Row => {
  title = colors.bold.underline.yellow(
    title,
  );
  return new Row(new Cell(title));
};

async function renderRecentWaystationList() {
  const recentWaystations = await readRecentWaystations();
  const stationNames = recentWaystations.map((waystation) => {
    return new Row(new Cell(waystation.name || waystation.id));
  });
  return new Table().body(stationNames);
}

function renderWaystation(waystation: IWaystation) {
  return new Table(
    waystation.name && new Row("Current Waystation") || new Row(""),
    tableTitle(waystation.name || "Current Waystation"),
    new Row(""),
    new Row("Marks:"),
    ...waystation.marks.map((mark, index) => {
      return new Row(new Cell(`#${index + 1} ${mark.name || mark.id}`));
    }),
    new Row(""),
    tableTitle("Recent Stations:"),
  );
}

function renderMark({ id, path, name, body }: IMark): Table {
  return new Table(
    new Row(new Cell("")),
    new Row(
      new Cell(`${(path || id)}
${colors.bold.underline.green(name || "Add a short descriptive name")}`),
    ),
    new Row(
      new Cell(
        colors.blue(
          body ||
            "Describe what this mark is and/or what should be done with it.",
        ),
      ).border(true),
    ),
  );
}

function markTable(
  waystation: IWaystation,
): Table {
  const marks = Waystation.listMarks(waystation);

  const table = marks.map((mark) => {
    return renderMark(mark);
  })
    .reduce((table, mark) => {
      return table.body(mark);
    }, new Table());
  return table;
}

function markTableWithTitle(waystation: IWaystation, title: string) {
  const table = markTable(waystation);
  table.header(tableTitle(title));
  return table;
}

async function markSelector(waystation: IWaystation) {
  const options = waystation.marks.map((mark) => {
    const table = renderMark(mark);
    return { name: table.toString(), value: mark.id };
  });

  const userSelectedMarkId: string = await Select.prompt({
    message: "Pick a Mark",
    options,
  });

  const selectedMark = waystation.marks.find((mark) =>
    mark.id === userSelectedMarkId
  );
  return selectedMark;
}

async function markEditor(
  waystation: IWaystation,
  mark: IMark,
): Promise<IWaystation> {
  const forbiddenKeys = ["id", "resources"];

  const property: string = await Select.prompt({
    message: "Pick a property",
    search: true,
    options: Object.keys(EmptyMark)
      .filter((key) => !forbiddenKeys.includes(key.toLowerCase()))
      .map((key) => {
        return { name: key, value: key };
      }),
  });

  const editorProcess = Deno.run({
    cmd: ["micro", "/tmp/way1"],
  });

  await editorProcess.status();

  const change = await Deno.readTextFile("/tmp/way1");
  const index = waystation.marks.findIndex((oldMark) => oldMark.id === mark.id);
  return Waystation.editMark(waystation, index, property, change);
}

// Very challenging to get the code snippet highlighted.
// I tried:
// - https://deno.land/x/speed_highlight_js@1.0.0
// - Running `bat` as a subprocess and catching the output
// Also looked at: https://deno.land/x/hue@0.0.0-alpha.1
// but hue is even more limited than `speed_highlight_js`

// const syntaxHighlightedContext = async (
//   path: string,
//   target: number,
//   range = 3,
// ) => {
//   const context = await pathContext(path, target, range);
//   const syntaxHighlightedContext = await Deno.run({
//     cmd: ["bat", "-f", "-lts", context],
//     stderr: 'piped', stdout: 'piped'
//   }).output();

//   return new TextDecoder().decode(syntaxHighlightedContext);
// };

// async function pathContext(
//   path: string,
//   target: number,
//   range = 3,
// ): Promise<string> {
//   const fileReader = await Deno.open(path);
//   let index = 0;
//   let context = "";

//   for await (const line of readLines(fileReader)) {
//     if (index > (target - range) && index <= (target + range)) {
//       context = context.concat(line + "\n");
//     }
//     index++
//   }
//   return context;
// };

export {
  markEditor,
  markSelector,
  markTable,
  markTableWithTitle,
  renderMark,
  renderRecentWaystationList,
  renderWaystation,
};
