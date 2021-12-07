import { program } from "commander";
import { blue, greenBright, blueBright, green, yellowBright } from "colorette";
import {
  bundleTs,
  buildServer,
  buildClient,
  watch,
  serve,
} from "./commands/build";
import { tryCommand, runCommand } from "./commands/runner";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION = greenBright(require("../package.json").version);
program.version(blue("Lunox Framework ") + "version " + VERSION);
program.description("Laravel-Flavoured NodeJs framework");
program.showHelpAfterError(true);

program
  .command("prod")
  .description("build lunox application for production")
  .action(() => {
    tryCommand("build production", async () => {
      await runCommand("rm -rf dist");
      console.log(blueBright("compiling ts file..."));
      await bundleTs();
      console.log(green("ts file compiled to ./dist folder\n"));
      console.log(blueBright("building server side view components..."));
      await buildServer();
      console.log(green("view are compiled to ./dist/server folder\n"));
      console.log(blueBright("building client side view components..."));
      await buildClient();
      console.log(green("view are compiled to ./dist/client folder\n"));
    });
  });

program
  .command("watch")
  .description("watch lunox application for development")
  .action(() => {
    tryCommand("build development", async () => {
      console.log(blueBright("compiling ts file..."));
      await watch();
    });
  });

program
  .command("serve")
  .description("serve lunox application for production")
  .action(async () => {
    try {
      console.log(blueBright("serving application..."));
      await serve();
    } catch (error) {
      if ((error as unknown as string).includes("ENOENT")) {
        console.log(
          yellowBright(
            "Oops, cannot serving application. Are you forget to build your application?"
          )
        );
      }
    }
  });

program.parse();
