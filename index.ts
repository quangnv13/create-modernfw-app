#!/usr/bin/env node
import chalk from "chalk";
import Commander from "commander";
import packageJson from "./package.json" assert { type: "json" };
import { getPkgManager } from "./helpers/get-pkg-manager";
import prompts from "prompts";
import { validateNpmName } from "./helpers/validate-pkg";
import path from "path";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--ts, --typescript",
    `

  Initialize as a TypeScript project. (default)
`,
  )
  .option(
    "--js, --javascript",
    `

  Initialize as a JavaScript project.
`,
  )
  .option(
    "--tailwind",
    `

  Initialize with Tailwind CSS config. (default)
`,
  )
  .option(
    "--eslint",
    `

  Initialize with eslint config.
`,
  )
  .option(
    "--experimental-app",
    `

  Initialize as a \`app/\` directory project.
`,
  )
  .option(
    "--src-dir",
    `

  Initialize inside a \`src/\` directory.
`,
  )
  .option(
    "--import-alias <alias-to-configure>",
    `

  Specify import alias to use (default "@/*").
`,
  )
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the app using npm
`,
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the app using pnpm
`,
  )
  .option(
    "-e, --example [name]|[github-url]",
    `

  An example to bootstrap the app with. You can use an example name
  from the official Next.js repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`,
  )
  .option(
    "--example-path <path-to-example>",
    `

  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`,
  )
  .option(
    "--reset-preferences",
    `

  Explicitly tell the CLI to reset any stored preferences
`,
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.useNpm
  ? "npm"
  : !!program.usePnpm
  ? "pnpm"
  : getPkgManager();

async function run(): Promise<void> {
  const conf = new Map([["projectName", "create-next-app"]]);
  if (program.resetPreferences) {
    conf.clear();
    console.log(`Preferences reset successfully`);
    return;
  }

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name: string) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          "<project-directory>",
        )}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("my-next-app")}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);

  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`,
      )} because of npm naming restrictions:`,
    );

    problems!.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
}

run();
