const FILE_PATH_REGEX =
  /(?<path>(?:\w|\/|\.)*):(?<line>\d+)(?::(?<column>\d+))?(?::(?<snippet>.*))?/;

export default function pathHandler(pathInput: string) {
  let [name, body, path, line, column] = [pathInput, "", "", 0, 0];
  const match = pathInput.match(FILE_PATH_REGEX);
  if (match && match.groups) {
    name = match.groups.path || pathInput;
    body = match.groups.snippet || match.groups.path;
    path = match.groups.path;
    line = Number(match.groups.line) || 0;
    column = Number(match.groups.column) || 0;
  } else {
    body = pathInput;
    path = pathInput;
  }

  return {
    name,
    body,
    path,
    line,
    column,
  };
}
