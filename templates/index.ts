import { install } from "../helpers/install";
import { GetTemplateFileArgs, InstallTemplateArgs } from "./types";

import { Sema } from "async-sema";
import chalk from "chalk";
import cpy from "cpy";
import fs from "fs";
import globOrig from "glob";
import os from "os";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import util from "util";

const glob = util.promisify(globOrig);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({
  template,
  mode,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const installTemplate = async ({
  app,
  appName,
  root,
  packageManager,
  isOnline,
  template,
  mode,
  tailwind,
  eslint,
  lintstaged,
  docker,
  importAlias,
}: InstallTemplateArgs) => {
  console.log(chalk.bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, app, template, mode);

  const copySource = [`${templatePath}/**/*`];
  if (!eslint) copySource.push("!*/{eslintrc}");
  if (!tailwind) copySource.push("/!**tailwind.config", "/!**postcss.config");
  if (!lintstaged) copySource.push("/!**lintstagedrc", "/!**husky");
  if (!docker) copySource.push("/!**Dockerfile", "!/**dockerignore");

  await cpy(copySource, root, {
    cwd: templatePath,
    rename: (name) => {
      console.log(name);
      switch (name) {
        case "gitignore":
        case "dockerignore":
        case "lintstagedrc":
        case "eslintrc": {
          return ".".concat(name);
        }
        default: {
          return name;
        }
      }
    },
  });

  const tsconfigFile = path.join(
    root,
    mode === "js" ? "jsconfig.json" : "tsconfig.json",
  );

  await fs.promises.writeFile(
    tsconfigFile,
    (await fs.promises.readFile(tsconfigFile, "utf8"))
      .replace(`"@/*": ["./*"]`, `"@/*": ["./src/*"]`)
      .replace(`"@/*":`, `"${importAlias}":`),
  );

  // update import alias in any files if not using the default
  if (importAlias !== "@/*") {
    const files = (await glob("**/*", { cwd: root, dot: true })) as string[];
    const writeSema = new Sema(8, { capacity: files.length });
    await Promise.all(
      files.map(async (file) => {
        // We don't want to modify compiler options in [ts/js]config.json
        if (file === "tsconfig.json" || file === "jsconfig.json") return;
        await writeSema.acquire();
        const filePath = path.join(root, file);
        if ((await fs.promises.stat(filePath)).isFile()) {
          await fs.promises.writeFile(
            filePath,
            (
              await fs.promises.readFile(filePath, "utf8")
            ).replace(`@/`, `${importAlias.replace(/\*/g, "")}`),
          );
        }
        await writeSema.release();
      }),
    );
  }

  /**
   * Create a package.json for the new project.
   */
  const packageJsonReactApp = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      start: "react-scripts start",
      build: "react-scripts build",
      test: "react-scripts test",
      eject: "react-scripts eject",
      ...(lintstaged && {
        prepare: "husky install",
      }),
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
  };

  const packageJsonNextApp = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      ...(lintstaged && {
        prepare: "husky install",
      }),
    },
  };

  const packageJson =
    app === "react" ? packageJsonReactApp : packageJsonNextApp;

  /**
   * Write it to disk.
   */
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  /**
   * These flags will be passed to `install()`, which calls the package manager
   * install process.
   */
  const installFlags = { packageManager, isOnline };

  /**
   * Default dependencies.
   */
  const reactDependencies = ["react", "react-dom", "react-scripts"];
  const nextDependencies = ["react", "react-dom", "next"];
  const dependencies = app === "react" ? reactDependencies : nextDependencies;

  /**
   * TypeScript projects will have type definitions and other devDependencies.
   */
  if (mode === "ts") {
    dependencies.push(
      "typescript",
      "@types/react",
      "@types/node",
      "@types/react-dom",
    );
  }

  /**
   * Add Tailwind CSS dependencies.
   */
  if (tailwind) {
    dependencies.push("tailwindcss", "postcss", "autoprefixer");
  }

  /**
   * Add Lint Staged dependencies.
   */
  if (lintstaged) {
    dependencies.push("husky", "lint-staged");
  }

  /**
   * Default eslint dependencies.
   */
  if (eslint) {
    dependencies.push("eslint", "eslint-config-next");
  }
  /**
   * Install package.json dependencies if they exist.
   */
  return;
  if (dependencies.length) {
    console.log();
    console.log("Installing dependencies:");
    for (const dependency of dependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    console.log();

    await install(root, dependencies, installFlags);
  }
};

export * from "./types";
