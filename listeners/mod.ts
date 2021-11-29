import { events } from "../core/constants.ts";
import { writeBackupToFS, writeCurrentToFS } from "../utils/mod.ts";

function writeWaystationOnEdit(){
    addEventListener(events.EDIT_MARK, function (e) {
        const waystation = (e as CustomEvent).detail.waystation;
        writeCurrentToFS(waystation);
        writeBackupToFS(waystation);
    });
}

export default function registerListeners() {
  writeWaystationOnEdit();
}
