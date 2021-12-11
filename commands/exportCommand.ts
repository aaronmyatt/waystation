import { Cliffy, stdLib } from "../deps.ts";

import { readWaystationFromFS as readWaystation } from "../utils/mod.ts";
import Waystation from "../core/waystation.ts";

const USER_OS_HOME = Deno.env.get("HOME");
const MARKDOWN_CONFIG_DIRECTORY = `${USER_OS_HOME}/.waystation/markdown`;

export default function exportCommand() {
  return new Cliffy.Command()
    // .arguments()
    .description("Export Waystation as Markdown")
    .action(async () => {
      const waystation = await readWaystation();
      const markdown = waystationToMarkdown(waystation);
      try {
        await Deno.writeTextFile(
          stdLib.Path.join(MARKDOWN_CONFIG_DIRECTORY, `${waystation.id}.md`),
          markdown,
        );
      } catch {
        // Probably the first time trying to export markdown, create dir
        await Deno.mkdir(MARKDOWN_CONFIG_DIRECTORY);
        Deno.writeTextFile(
          stdLib.Path.join(MARKDOWN_CONFIG_DIRECTORY, `${waystation.id}.md`),
          markdown,
        );
      }
    });
}

function resourceToMarkdown(resource: IResource): string {
  return `##### ${resource.name}  
\`\`\`
${resource.body}
\`\`\`
`;
}

function markToMarkdown(mark: IMark, index = 0) {
  return `### ${index + 1}) ${mark.name}

\`${Waystation.markWithPath(mark)}\`

> ${mark.body}

${(mark.resources && mark.resources.length) ? "#### Resources" : ""}
${mark.resources && mark.resources.map(resourceToMarkdown).join("\n")}
---
`;
}

function waystationToMarkdown(waystation: IWaystation): string {
  return `# ${waystation.name}

## Marks
${
    waystation
      .marks
      .map(markToMarkdown)
      .join("")
  }

*Tags*
[${waystation.tags.join(",")}]
`;
}
