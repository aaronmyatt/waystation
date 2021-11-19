import * as path from "https://deno.land/std@0.113.0/path/mod.ts";
import { readLines } from "https://deno.land/std@0.113.0/io/mod.ts";

import Waystation from "../waystation.ts";

const USER_OS_HOME = Deno.env.get("HOME");
const WAYSTATION_CONFIG_DIRECTORY = `${USER_OS_HOME}/.waystation`;
const CURRENT_FILE_PATH = `${WAYSTATION_CONFIG_DIRECTORY}/current.json`;

async function* configFiles(dirPath = WAYSTATION_CONFIG_DIRECTORY) {
  for await (const dirEntry of Deno.readDir(dirPath)) {
    yield dirEntry;
  }
}

async function* backupFiles(dirPath = WAYSTATION_CONFIG_DIRECTORY) {
  for await (const dirEntry of configFiles(dirPath)) {
    if (dirEntry.name.includes("current")) continue;
    yield dirEntry;
  }
}

async function recentlyEditedBackupFiles(
  dirPath = WAYSTATION_CONFIG_DIRECTORY,
) {
  const backupFilesArray = [];
  for await (const backupFile of backupFiles(dirPath)) {
    backupFilesArray.push(backupFile);
  }
  const recentFiles = await Promise.all(backupFilesArray
    .map(async (entry) => {
      const realPath = path.join(WAYSTATION_CONFIG_DIRECTORY, entry.name);
      return {
        path: realPath,
        entry,
        fileInfo: await Deno.lstat(realPath),
      };
    }));

  recentFiles
    .sort((a, b) => {
      // force unmodified files to the back of the queue
      const first = new Date(a.fileInfo.mtime || 0);
      const second = new Date(b.fileInfo.mtime || 0);

      // sort descending, latest first
      return second.valueOf() - first.valueOf();
    });

  const rawRecentFiles = await Promise.all(
    recentFiles.slice(0, 10)
      .map(async (file) => await Deno.readTextFile(file.path)),
  );

  return rawRecentFiles.map((rawFile: string) => rawFile);
}

async function readRecentWaystations(): Promise<IWaystation[]> {
  try {
    const rawWaystations = await recentlyEditedBackupFiles();
    return rawWaystations.map((rawFile: string) => {
      try {
        return JSON.parse(rawFile);
      } catch {
        console.log("Skipping none JSON file.");
      }
    });
  } catch {
    // likely the first time running Waystation
    // no prior Waystation's presents
    return [];
  }
}

async function readWaystationFromFS(): Promise<IWaystation> {
  try {
    const rawFile = await Deno.readTextFile(CURRENT_FILE_PATH);
    return JSON.parse(rawFile);
  } catch {
    return Waystation();
  }
}

async function writeWaystationToFS(
  waystation: IWaystation,
  path = CURRENT_FILE_PATH,
): Promise<IWaystation> {
  try {
    const newRawFile = JSON.stringify(waystation);
    await Deno.writeTextFile(path, newRawFile);
    return waystation;
  } catch {
    await Deno.mkdir(WAYSTATION_CONFIG_DIRECTORY);
    return await writeWaystationToFS(waystation, path);
  }
}

async function writeCurrentToFS(waystation: IWaystation) {
  return await writeWaystationToFS(waystation, CURRENT_FILE_PATH);
}

async function writeBackupToFS(waystation: IWaystation) {
  const backupPath = path.join(WAYSTATION_CONFIG_DIRECTORY, waystation.id);
  return await writeWaystationToFS(waystation, backupPath);
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

async function pathContext(
  path: string,
  target: number,
  range = 3,
): Promise<string> {
  const fileReader = await Deno.open(path);
  let index = 0;
  let context = "";

  for await (const line of readLines(fileReader)) {
    if (index <= (target + range)) return context;
    if (index > (target - range) && index <= (target + range)) {
      context = context.concat(line + "\n");
    }
    index++;
  }
  return context;
}

export {
  pathContext,
  readRecentWaystations,
  readWaystationFromFS,
  writeBackupToFS,
  writeCurrentToFS,
  writeWaystationToFS,
};
