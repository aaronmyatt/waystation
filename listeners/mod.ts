import Waystation from "../core/waystation.ts";
import { events } from "../core/constants.ts";
import { writeBackupToFS, writeCurrentToFS } from "../utils/mod.ts";
import fileContextResource from "../fileContextResource.ts";

const _writeAndBackup = (waystation: IWaystation) => {
  writeCurrentToFS(waystation);
  writeBackupToFS(waystation);
};

function onEditMark() {
  addEventListener(events.EDIT_MARK, function (e) {
    let { waystation, mark } = (e as CustomEvent).detail;
    waystation = Waystation.removeResourceByName(waystation, mark, "File Context")
    fileContextResource(waystation, mark).then(waystation => {
      _writeAndBackup(waystation);
    });
  });
}

function onNewMark() {
  addEventListener(events.NEW_MARK, function (e) {
    const waystation = (e as CustomEvent).detail.waystation;
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
  onEditWaystation
}
