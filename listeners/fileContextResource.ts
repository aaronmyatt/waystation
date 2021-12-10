import Waystation from "./core/waystation.ts";
import { pathContext } from "./utils/mod.ts";

export default async function fileContextResource(
  waystation: IWaystation,
  mark: IMark,
): Promise<IWaystation> {
  try {
    const context = await pathContext(mark.path, mark.line || 0);
    return Waystation.newResource(
      waystation,
      mark,
      "note",
      context,
      "File Context",
    );
  } catch {
    // file probably doesn't exist, no need to create the resource
    return waystation;
  }
}
