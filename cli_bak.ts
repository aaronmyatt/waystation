// import { red, yellow } from "https://deno.land/std@0.111.0/fmt/colors.ts";
import { parse } from "https://deno.land/std@0.111.0/flags/mod.ts";
import { writeAll } from "https://deno.land/std/io/util.ts";

const HELP_MESSAGE = `
waystation 0.0.1
Aaron Myatt <aaronmyatt@gmail.com>

Waystation (way): Build context, take it with you

Use -h for short descriptions and --help for more details.

Project home page: https://github.com/aaronmyatt/waystation

USAGE:
	way [OPTIONS] PATH
	command | way [OPTIONS]

ARGS:
	<PATH>
		A file path including optional line and column references and optional line contents as one would expect from the output of a grep command.
	
	Examples:
		way 'queries/webinar/fetchWebinar.js:17:      timedTexts{'
		grep timedtext . | way

`;
const USER_OS_HOME = Deno.env.get("HOME");
const WAYSTATION_CONFIG_DIRECTORY = `${USER_OS_HOME}/.waystation`;
const CURRENT_FILE_PATH = `${WAYSTATION_CONFIG_DIRECTORY}/current.json`;

async function handleSave(record: string) {
  const rawFile = await Deno.readTextFile(CURRENT_FILE_PATH);
  const currentContent = JSON.parse(rawFile);
  !("marks" in currentContent) && (currentContent.marks = {});
  currentContent.marks[record] = {};
  const newRawFile = JSON.stringify(currentContent);
  await Deno.writeTextFile(CURRENT_FILE_PATH, newRawFile);
}

async function handleList() {
  const rawFile = await Deno.readTextFile(CURRENT_FILE_PATH);
  const currentContent = JSON.parse(rawFile);
  !("marks" in currentContent) && (currentContent.marks = {});
  Object.keys(currentContent.marks).forEach((mark) => {
    console.log(mark);
  });
}

function handleHelp() {
  writeAll(Deno.stdout, new TextEncoder().encode(HELP_MESSAGE));
}

const args = parse(Deno.args);

if (args.help || args.h) {
  handleHelp();
} else if (args.list || args.l) {
  handleList();
} else {
  args._.length > 0 && handleSave(args._[0] as string);
}
