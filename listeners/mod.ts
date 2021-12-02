import { stdLib } from "../deps.ts";
import Waystation from "../core/waystation.ts";
import { events } from "../core/constants.ts";
import { writeBackupToFS, writeCurrentToFS } from "../utils/mod.ts";
import fileContextResource from "../fileContextResource.ts";

const _fullPath = (filename: string) => stdLib.Path.join(Deno.cwd(), filename);

const ensureMarkPathAbsolute = (mark: IMark) => {
  if (stdLib.Path.isAbsolute(mark.path)) return mark;
  mark.path = _fullPath(mark.path || "");
  return mark;
};

const _writeAndBackup = async (waystation: IWaystation) => {
  await writeCurrentToFS(waystation);
  await writeBackupToFS(waystation);
};

function onEditMark() {
  addEventListener(events.EDIT_MARK, async function (e) {
    let { waystation, mark } = (e as CustomEvent).detail;
    waystation = Waystation.removeResourceByName(
      waystation,
      mark,
      "File Context",
    );
    waystation = await fileContextResource(waystation, mark);
    waystation.marks = waystation.marks.map(ensureMarkPathAbsolute);
    _writeAndBackup(waystation);
  });
}

function onNewMark() {
  addEventListener(events.NEW_MARK, async function (e) {
    let { waystation, mark } = (e as CustomEvent).detail;
    waystation = Waystation.removeResourceByName(
      waystation,
      mark,
      "File Context",
    );
    waystation = await fileContextResource(waystation, mark);
    waystation.marks = waystation.marks.map(ensureMarkPathAbsolute);
    _writeAndBackup(waystation);
  });
}

function onEditResource() {
  addEventListener(events.EDIT_RESOURCE, function (e) {
    const waystation = (e as CustomEvent).detail.waystation;
    _writeAndBackup(waystation);
  });
}

function onNewResource() {
  addEventListener(events.NEW_RESOURCE, function (e) {
    const waystation = (e as CustomEvent).detail.waystation;
    _writeAndBackup(waystation);
  });
}

function onNewWaystation() {
  addEventListener(events.NEW_WAYSTATION, function (e) {
    const waystation = (e as CustomEvent).detail.waystation;
    console.log(waystation);
  });
}

function onEditWaystation() {
  addEventListener(events.EDIT_WAYSTATION, function (e) {
    const waystation = (e as CustomEvent).detail.waystation;
    console.log(waystation);
  });
}

export default function registerListeners() {
  onEditMark();
  onNewMark();
  onEditResource();
  onNewResource();
  onNewWaystation();
  onEditWaystation;
}
