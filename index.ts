#!/usr/bin/env node
import { DownloadError, createApp } from "./create-app";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json" assert { type: "json" };

import chalk from "chalk";
import Commander from "commander";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import terminalLink from "terminal-link";
import checkForUpdate from "update-check";

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
    "--next, --next",
    `

  Initialize as a Next project.
`,
  )
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
    "--tw, --tailwind",
    `

  Initialize with Tailwind CSS config. (default)
`,
  )
  .option(
    "--ls, --lint-staged",
    `

Initialize with Lint Staged config. (default)
`,
  )
  .option(
    "--d, --docker",
    `

Initialize with Docker config. (default)
`,
  )
  .option(
    "--es, --eslint",
    `

  Initialize with Eslint config.
`,
  )
  .option(
    "--ia, --import-alias <alias-to-configure>",
    `

  Specify import alias to use (default "@/*").
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

  if (!process.argv.includes("--next")) {
    const app = await prompts({
      onState: onPromptState,
      type: "select",
      name: "value",
      message: "React or Next ?",
      choices: [
        { title: terminalLink("Next", "https://nextjs.org/"), value: "next" },
        { title: terminalLink("React", "https://react.dev/"), value: "react" },
      ],
      initial: 0,
    });

    program.app = app.value;
  }

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const initialProjectName =
      program.app === "react" ? "react-app" : "next-app";
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: initialProjectName,
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
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);
  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;
  /**
   * If the user does not provide the necessary flags, prompt them for whether
   * to use TS or JS.
   */
  const defaults: typeof preferences = {
    typescript: true,
    eslint: true,
    tailwind: true,
    importAlias: "@/*",
    lintstaged: true,
    docker: true,
  };
  const getPrefOrDefault = (field: string) =>
    preferences[field] ?? defaults[field];

  if (!program.typescript && !program.javascript) {
    const styledTypeScript = chalk.hex("#007acc")("TypeScript");
    const { typescript } = await prompts(
      {
        type: "toggle",
        name: "typescript",
        message: `Would you like to use ${styledTypeScript} with this project?`,
        initial: getPrefOrDefault("typescript"),
        active: "Yes",
        inactive: "No",
      },
      {
        /**
         * User inputs Ctrl+C or Ctrl+D to exit the prompt. We should close the
         * process and not write to the file system.
         */
        onCancel: () => {
          console.error("Exiting.");
          process.exit(1);
        },
      },
    );
    /**
     * Depending on the prompt response, set the appropriate program flags.
     */
    program.typescript = Boolean(typescript);
    program.javascript = !Boolean(typescript);
    preferences.typescript = Boolean(typescript);
  }

  if (
    !process.argv.includes("--eslint") &&
    !process.argv.includes("--es")
  ) {
    const styledEslint = chalk.hex("#007acc")("ESLint");
    const { eslint } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "eslint",
      message: `Would you like to use ${styledEslint} with this project?`,
      initial: getPrefOrDefault("eslint"),
      active: "Yes",
      inactive: "No",
    });
    program.eslint = Boolean(eslint);
    preferences.eslint = Boolean(eslint);
  }

  if (
    !process.argv.includes("--tailwind") &&
    !process.argv.includes("--tw")
  ) {
    const tw = chalk.hex("#007acc")("Tailwind CSS");
    const { tailwind } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "tailwind",
      message: `Would you like to use ${tw} with this project?`,
      initial: getPrefOrDefault("tailwind"),
      active: "Yes",
      inactive: "No",
    });
    program.tailwind = Boolean(tailwind);
    preferences.tailwind = Boolean(tailwind);
  }

  if (
    !process.argv.includes("--lint-staged") &&
    !process.argv.includes("--ls")
  ) {
    const lintStagedStyled = chalk.hex("#007acc")("Lint Staged");
    const { lintstaged } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "lintstaged",
      message: `Would you like to use ${lintStagedStyled} with this project?`,
      initial: getPrefOrDefault("lintstaged"),
      active: "Yes",
      inactive: "No",
    });
    program.lintstaged = Boolean(lintstaged);
    preferences.lintstaged = Boolean(lintstaged);
  }

  if (
    !process.argv.includes("--docker") &&
    !process.argv.includes("--d")
  ) {
    const dockerStyled = chalk.hex("#007acc")("Docker");
    const { docker } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "docker",
      message: `Would you like to use ${dockerStyled} with this project?`,
      initial: getPrefOrDefault("docker"),
      active: "Yes",
      inactive: "No",
    });
    program.docker = Boolean(docker);
    preferences.docker = Boolean(docker);
  }

  if (
    program.typescript &&
    program.app === "next" &&
    (typeof program.importAlias !== "string" || !program.importAlias.length)
  ) {
    const styledImportAlias = chalk.hex("#007acc")("import alias");
    const { importAlias } = await prompts({
      onState: onPromptState,
      type: "text",
      name: "importAlias",
      message: `What ${styledImportAlias} would you like configured?`,
      initial: getPrefOrDefault("importAlias"),
      validate: (value) =>
        /.+\/\*/.test(value)
          ? true
          : "Import alias must follow the pattern <prefix>/*",
    });
    program.importAlias = importAlias;
    preferences.importAlias = importAlias;
  }

  try {
    await createApp({
      app: program.app,
      appPath: resolvedProjectPath,
      packageManager,
      typescript: program.typescript,
      tailwind: program.tailwind,
      eslint: program.eslint,
      importAlias: program.importAlias,
      docker: program.docker,
      lintstaged: program.lintstaged,
    });
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason;
    }

    const res = await prompts({
      onState: onPromptState,
      type: "confirm",
      name: "builtin",
      message:
        `Could not download because of a connectivity issue between your machine and GitHub.\n` +
        `Do you want to use the default template instead?`,
      initial: true,
    });
    if (!res.builtin) {
      throw reason;
    }

    await createApp({
      app: program.app,
      appPath: resolvedProjectPath,
      packageManager,
      typescript: program.typescript,
      eslint: program.eslint,
      tailwind: program.tailwind,
      importAlias: program.importAlias,
      docker: program.docker,
      lintstaged: program.lintstaged,
    });
  }
  conf.set("preferences", preferences as unknown as string);
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-modernfw-app"
          : packageManager === "pnpm"
          ? "pnpm add -g create-modernfw-app"
          : "npm i -g create-modernfw-app";

      console.log(
        chalk.yellow.bold("A new version of `create-modernfw-app` is available!") +
          "\n" +
          "You can update by running: " +
          chalk.cyan(updateMessage) +
          "\n",
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(
        chalk.red("Unexpected error. Please report it as a bug:") + "\n",
        reason,
      );
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
