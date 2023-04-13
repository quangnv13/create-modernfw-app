import { PackageManager } from "./helpers/get-pkg-manager";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";
import { installTemplate } from "./templates/index";
import { TemplateMode, TemplateType } from "./templates/types";

import chalk from "chalk";
import path from "path";

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
  typescript,
  tailwind,
  eslint,
  importAlias,
}: {
  appPath: string;
  packageManager: PackageManager;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
  importAlias: string;
}): Promise<void> {
  const mode: TemplateMode = typescript ? "ts" : "js";
  const template: TemplateType = tailwind ? "app-tw" : "app";

  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again.",
    );
    console.error(
      "It is likely you do not have write permissions for this folder.",
    );
    process.exit(1);
  }

  const appName = path.basename(root);
  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";

  const isOnline = !useYarn || (await getOnline());

  console.log(`Creating a new Next.js app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  /**
   * If an example repository is not provided for cloning, proceed
   * by installing from a template.
   */
  await installTemplate({
    appName,
    root,
    template,
    mode,
    packageManager,
    isOnline,
    tailwind,
    eslint,
    importAlias,
  });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  console.log(`${chalk.green("Success!")} Created ${appName} at ${appPath}`);
}
