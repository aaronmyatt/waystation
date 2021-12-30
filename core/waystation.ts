/// <reference types="../types.d.ts" />

import { events } from "./constants.ts";
import pathHandler from "./pathHandler.ts";
import { zod } from "../deps.ts";

const { z } = zod;

const _generateUniqueId = () => crypto.randomUUID();
const _dispatchCustomEvent = (eventName: string, payload: unknown) => {
  dispatchEvent(new CustomEvent(eventName, { detail: payload }));
};

const DEFAULT_DIR = "~/.waystation/";

export const EmptyWaystation = {
  id: "",
  name: "",
  marks: [],
  configuration: {
    directory: DEFAULT_DIR,
  },
  tags: [],
};

export const EmptyMark = {
  id: "",
  name: "",
  body: "",
  path: "",
  line: 0,
  column: 0,
  resources: [],
};

const EmptyResource = {
  type: "mark",
  id: "",
  name: "",
  body: "",
};

const resourceSchema = z.object({
  type: z.enum(["mark", "note"]),
  id: z.string(),
  name: z.string(),
  body: z.string(),
});

const markSchema = z.object({
  id: z.string(),
  name: z.string(),
  body: z.string(),
  path: z.string(),
  line: z.number().default(0),
  column: z.number().default(0),
  resources: z.array(resourceSchema),
});

export const waystationSchema = z.object({
  id: z.string().default(_generateUniqueId),
  name: z.string(),
  marks: z.array(markSchema),
  configuration: z.object({
    directory: z.string().default(DEFAULT_DIR),
  }),
  tags: z.array(z.string()),
});

export default function Waystation(name = ""): IWaystation {
  const waystation = {
    ...EmptyWaystation,
    name,
    id: _generateUniqueId(),
  };

  return waystationSchema.parse(waystation);
}

Waystation.addMark = (waystation: IWaystation, mark: IMark): IWaystation => {
  const marks: readonly IMark[] = Object.freeze([...waystation.marks, mark]);
  const newWaystation = {
    ...waystation,
    marks,
  };
  return waystationSchema.parse(newWaystation);
};

Waystation.makeMark = (path: string): IMark => {
  const id = _generateUniqueId();
  return markSchema.parse({
    ...EmptyMark,
    id,
    ...pathHandler(path),
  });
};

Waystation.newMark = (waystation: IWaystation, path: string): IWaystation => {
  const mark = Waystation.makeMark(path);
  waystation = Waystation.addMark(waystation, mark);
  _dispatchCustomEvent(events.NEW_MARK, { waystation, mark });
  return waystation;
};

Waystation.replaceMark = (
  waystation: IWaystation,
  index: number,
  newMark: IMark,
): IWaystation => {
  return waystationSchema.parse({
    ...waystation,
    marks: waystation.marks.map((mark, markIndex) => {
      if (markIndex === index) {
        return newMark;
      }
      return mark;
    }),
  });
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
  const newWaystation = Waystation.replaceMark(waystation, index, newMark);
  _dispatchCustomEvent(events.EDIT_MARK, {
    waystation: newWaystation,
    mark: newMark,
  });
  return newWaystation;
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

  const newWaystation = waystationSchema.parse({
    ...waystation,
    marks,
  });

  _dispatchCustomEvent(events.EDIT_WAYSTATION, { waystation: newWaystation });
  return newWaystation;
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

  waystation = waystationSchema.parse({
    ...waystation,
    marks,
  });

  _dispatchCustomEvent(events.EDIT_WAYSTATION, { waystation });
  return waystation;
};

Waystation.markWithPath = (mark: IMark): string => {
  try {
    const parts = [mark.path, mark.line || 0, mark.column || 0];
    return parts.join(":");
  } catch {
    return "";
  }
};

Waystation.lastMark = (waystation: IWaystation): IMark | undefined => {
  const length = waystation.marks.length;
  if (length > 0) return waystation.marks[length - 1];
};

function makeResource(type: ResourceTypes, body: string, name = ""): IResource {
  return resourceSchema.parse({
    ...EmptyResource,
    id: _generateUniqueId(),
    type,
    name,
    body,
  });
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

  const updatedMark = markSchema.parse({
    ...oldMark,
    resources: [
      ...oldMark?.resources || [],
      resource,
    ],
  });
  const index = waystation.marks.findIndex((oldMark) => oldMark.id === mark.id);
  waystation = Waystation.replaceMark(waystation, index, updatedMark);
  _dispatchCustomEvent(events.NEW_RESOURCE, { waystation, resource });
  return waystation;
};

Waystation.removeResourceByName = (
  waystation: IWaystation,
  mark: IMark,
  name: string,
) => {
  const oldMark = waystation.marks.find((oldMark) => oldMark.id === mark.id);
  if (oldMark === undefined) return waystation;

  const updatedMark = markSchema.parse({
    ...oldMark,
    resources: oldMark.resources?.filter((resource) =>
      resource.name !== name
    ) || [],
  });

  const index = waystation.marks.findIndex((oldMark) => oldMark.id === mark.id);
  waystation = Waystation.replaceMark(waystation, index, updatedMark);
  return waystation;
};

Waystation.addTag = (waystation: IWaystation, tag: string): IWaystation => {
  if (!tag) return waystation;
  const tags = waystation.tags || [];
  waystation = waystationSchema.parse({
    ...waystation,
    tags: [
      ...tags,
      tag,
    ],
  });
  _dispatchCustomEvent(events.EDIT_WAYSTATION, { waystation });
  return waystation;
};
