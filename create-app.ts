import path from "path";
import { RepoInfo } from "./helpers/examples";
import { PackageManager } from "./helpers/get-pkg-manager";
import { TemplateMode, TemplateType } from "./templates/types";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import chalk from "chalk";
import { installTemplate } from "./templates/index";
export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
  examplePath,
  typescript,
  tailwind,
  eslint,
  importAlias,
}: {
  appPath: string;
  packageManager: PackageManager;
  examplePath?: string;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
  importAlias: string;
}): Promise<void> {
  let repoInfo: RepoInfo | undefined;
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
  const originalDirectory = process.cwd();

  console.log(`Creating a new Next.js app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  const packageJsonPath = path.join(root, "package.json");

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
}
