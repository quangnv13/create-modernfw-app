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

export const SRC_DIR_NAMES = ["app", "pages", "styles"];

export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  mode,
  tailwind,
  eslint,
  importAlias,
}: InstallTemplateArgs) => {
  console.log(chalk.bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, mode);

  const copySource = ["**"];
  if (!eslint) copySource.push("!eslintrc.json");
  if (!tailwind) copySource.push("!tailwind.config.js", "!postcss.config.js");

  await cpy(copySource, root, {
    cwd: templatePath,
    flat: true,
    rename: (name) => {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
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
  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
  };

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
  const dependencies = ["react", "react-dom", "next"];

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
   * Default eslint dependencies.
   */
  if (eslint) {
    dependencies.push("eslint", "eslint-config-next");
  }
  /**
   * Install package.json dependencies if they exist.
   */
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
