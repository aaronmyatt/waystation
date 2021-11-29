import {
  Cell,
  Row,
  Table,
} from "https://deno.land/x/cliffy@v0.20.0/table/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.20.0/ansi/colors.ts";
import { Select } from "https://deno.land/x/cliffy@v0.20.0/prompt/mod.ts";

import Waystation from "../core/waystation.ts";
import { readRecentWaystations } from "../utils/mod.ts";
import markComponents from "./mark.ts";

const EDITOR = Deno.env.get("EDITOR") || "nano";

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
      return new Row(
        new Cell(
          `#${index + 1} ${
            mark.name || Waystation.markWithPath(mark) || mark.id
          }`,
        ),
      );
    }),
    new Row(""),
    tableTitle("Recent Stations:"),
  );
}

function renderMark(mark: IMark): Table {
  return new Table(
    new Row(new Cell("")),
    new Row(
      new Cell(`${(Waystation.markWithPath(mark) || mark.id)}
${colors.bold.green(mark.name || "Add a short descriptive name")}`),
    ),
    new Row(
      new Cell(
        colors.bold(
          mark.body ||
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
  const TEMP_FILE = `/tmp/waystation-${Date.now()}`;
  const forbiddenKeys = ["id", "resources"];

  const property = await Select.prompt({
    message: "Pick a property",
    search: true,
    options: Object.keys(mark)
      .filter((key) => !forbiddenKeys.includes(key.toLowerCase()))
      .map((key) => {
        return { name: key, value: key };
      }),
  }) as "name" | "body" | "path" | "line" | "column";

  await Deno.writeTextFile(TEMP_FILE, String(mark[property]));

  const editorProcess = Deno.run({
    cmd: [EDITOR, "--wait", TEMP_FILE],
  });

  await editorProcess.status();

  const change = await Deno.readTextFile(TEMP_FILE).then((text) => text.trim());
  Deno.remove(TEMP_FILE);
  return Waystation.editMark(waystation, mark, property, change);
}

async function markPathEditor(mark: IMark): Promise<void> {
  const editorProcess = Deno.run({
    cmd: [EDITOR, "--goto", Waystation.markWithPath(mark)],
  });

  await editorProcess.status();
}

function renderResource(resource: IResource): Table {
  return new Table(
    new Row(new Cell("")),
    new Row(
      new Cell(
        `${colors.brightBlue(resource.type)}:  ${resource.name || resource.id || ""}`,
      ),
    ),
     new Row(
      new Cell(
        (resource.body && colors.bold(
          resource.body,
        )) || "",
      ),
    ),
  );
}

async function stationSelector(waystations: IWaystation[]) {
  const options = waystations.map((station) => {
    return { name: station.name, value: station.id };
  });

  const userSelectedStationId: string = await Select.prompt({
    message: "Pick a Station",
    options,
  });

  const selectedStation = waystations.find((station) =>
    station.id === userSelectedStationId
  );
  return selectedStation;
}

export {
  markComponents as markComponents,
  markEditor,
  markPathEditor,
  markSelector,
  markTable,
  markTableWithTitle,
  renderMark,
  renderRecentWaystationList,
  renderResource,
  renderWaystation,
  stationSelector,
};
