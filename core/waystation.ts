/// <reference types="../types.d.ts" />

import * as path from "https://deno.land/std@0.113.0/path/mod.ts";

// This makes me feel a little itchy... I was hoping to keep the
// core of Waystatin "clean" with no reliance no IO so that it could
// packaged into a browser compatible module
const _fullPath = (filename: string) => path.join(Deno.cwd(), filename);
const _generateUniqueId = () => crypto.randomUUID();

const DEFAULT_DIR = "~/.waystation/";
const FILE_PATH_REGEX =
  /(?<path>(?:\w|\/|\.)*):(?<line>\d+)(?::(?<column>\d+))?(?::(?<snippet>.*))?/;

export const EmptyWaystation: IWaystation = {
  id: "",
  marks: Object.freeze([]),
  configuration: {
    directory: DEFAULT_DIR,
  },
};

export const EmptyMark: IMark = {
  id: "",
  name: "",
  body: "",
  path: "",
  line: 0,
  column: 0,
  resources: Object.freeze([]),
};

const EmptyResource: IResource = {
  type: "mark",
  id: "",
  name: "",
  body: "",
};

export default function Waystation(name?: string): IWaystation {
  return Object.freeze({
    ...EmptyWaystation,
    name,
    id: _generateUniqueId(),
  });
}

Waystation.addMark = (waystation: IWaystation, mark: IMark): IWaystation => {
  const marks: readonly IMark[] = Object.freeze([...waystation.marks, mark]);
  const newWaystation = {
    ...waystation,
    marks,
  };
  return newWaystation;
};

Waystation.makeMark = (path: string): IMark => {
  const matches = path.match(FILE_PATH_REGEX);
  const id = _generateUniqueId();
  if (matches && matches.length > 0 && matches.groups) {
    return {
      ...EmptyMark,
      id,
      path: _fullPath(matches.groups.path),
      line: Number(matches.groups.line || 0),
      column: Number(matches.groups.column || 0),
      name: matches.groups.snippet || "",
      body: matches.groups.snippet || "",
    };
  }
  return {
    ...EmptyMark,
    id,
    path: _fullPath(path),
  };
};

Waystation.newMark = (waystation: IWaystation, path: string): IWaystation => {
  const mark = Waystation.makeMark(path);
  return Waystation.addMark(waystation, mark);
};

Waystation.replaceMark = (
  waystation: IWaystation,
  index: number,
  newMark: IMark,
): IWaystation => {
  return {
    ...waystation,
    marks: waystation.marks.map((mark, markIndex) => {
      if (markIndex === index) {
        return newMark;
      }
      return mark;
    }),
  };
};

Waystation.editMark = (
  waystation: IWaystation,
  mark: IMark,
  property: string,
  change: unknown,
): IWaystation => {
  const newMark = {
    ...mark,
    [property]: change,
  };
  const index = waystation.marks.findIndex((oldMark) => oldMark.id === mark.id);
  return Waystation.replaceMark(waystation, index, newMark);
};

Waystation.listMarks = (waystation: IWaystation): readonly IMark[] => {
  return waystation.marks;
};

Waystation.reorderMarks = (
  waystation: IWaystation,
  from: number,
  to: number,
): IWaystation => {
  if (to < 0) return waystation;
  if (to > waystation.marks.length - 1) return waystation;

  const marks = waystation.marks.reduce(
    (newMarks: IMark[], current, index, originalMarks) => {
      // reorder called to move the mark to the same position
      // essentially just rebuilds the array!
      if (from === to) {
        newMarks.push(current);
      }

      // bail early so that we don't write the mark to be moved
      // back to the same spot
      if (index === from) {
        return newMarks;
      }

      // keep rebuilding
      if (from < to) {
        newMarks.push(current);
      }

      // this is where the mark is to be repositioned
      if (index === to) {
        newMarks.push(originalMarks[from]);
      }

      // keep rebuilding
      if (from > to) {
        newMarks.push(current);
      }
      return newMarks;
    },
    [],
  );

  return {
    ...waystation,
    marks,
  };
};

Waystation.moveMarkUp = (waystation: IWaystation, mark: IMark) => {
  const markIndex = waystation.marks.findIndex((oldMark) =>
    oldMark.id === mark.id
  );
  return Waystation.reorderMarks(
    waystation,
    markIndex,
    markIndex - 1,
  );
};

Waystation.moveMarkDown = (waystation: IWaystation, mark: IMark) => {
  const markIndex = waystation.marks.findIndex((oldMark) =>
    oldMark.id === mark.id
  );
  return Waystation.reorderMarks(
    waystation,
    markIndex,
    markIndex + 1,
  );
};

Waystation.removeMarkByIndex = (
  waystation: IWaystation,
  index: number,
): IWaystation => {
  const marks = waystation.marks.filter((_mark, markIndex) => {
    return index !== markIndex;
  });

  return {
    ...waystation,
    marks,
  };
};

Waystation.markWithPath = (mark: IMark): string => {
  const parts = [mark.path, mark.line || 0, mark.column || 0];
  return parts.join(":");
};

Waystation.lastMark = (waystation: IWaystation): IMark | undefined => {
  const length = waystation.marks.length;
  if (length > 0) return waystation.marks[length - 1];
};

function makeResource(type: ResourceTypes, body: string, name = ""): IResource {
  return {
    ...EmptyResource,
    id: _generateUniqueId(),
    type,
    name,
    body,
  };
}

Waystation.newResource = (
  waystation: IWaystation,
  mark: IMark,
  type: ResourceTypes,
  body: string,
  name = "",
): IWaystation => {
  const resource = makeResource(type, body, name);
  const oldMark = waystation.marks.find((oldMark) => oldMark.id === mark.id);
  if (!oldMark) return waystation;

  const updatedMark = {
    ...oldMark,
    resources: [
      ...oldMark?.resources || [],
      resource,
    ],
  };
  const index = waystation.marks.findIndex((oldMark) => oldMark.id === mark.id);
  return Waystation.replaceMark(waystation, index, updatedMark);
};
