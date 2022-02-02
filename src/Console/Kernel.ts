import LoadConfiguration from "../Foundation/Bootstrap/LoadConfiguration";
import type { Bootstrapper } from "../Contracts/Foundation/Boostrapper";
import type Application from "../Foundation/Application";
import type { Class } from "../Types";
import LoadEnvirontmentVariabel from "../Foundation/Bootstrap/LoadEnvirontmentVariabel";
import HandleException from "../Foundation/Bootstrap/HandleException";
import RegisterFacades from "../Foundation/Bootstrap/RegisterFacades";
import RegisterProviders from "../Foundation/Bootstrap/RegisterProviders";
import BootProviders from "../Foundation/Bootstrap/BootProviders";
import fs from "fs";
import path from "path";
import type Command from "./Command";
import { Command as CommanderCommand } from "commander";
import { blue } from "colorette";
import { exit } from "process";
import MakeMigrationCommand from "./MakeMigrationCommand";
import type { ObjectOf } from "../Types";
import RunMigrationCommand from "./RunMigrationCommand";
import RollbackMigrationCommand from "./RollbackMigrationCommand";
import ResetMigrationCommand from "./ResetMigrationCommand";
import RefreshMigrationCommand from "./RefreshMigrationCommand";
import MakeSeederCommand from "./MakeSeederCommand";
import RunSeederCommand from "./RunSeederCommand";
import MakeModelCommand from "./MakeModelCommand";
import MakeCommand from "./MakeCommand";
import MakeMiddlewareCommand from "./MakeMiddlewareCommand";
import MakeProviderCommand from "./MakeProviderCommand";
import MakeControllerCommand from "./MakeControllerCommand";

class Kernel {
  protected app: Application;

  protected program: CommanderCommand;

  protected bootstrappers: Class<Bootstrapper>[] = [
    LoadEnvirontmentVariabel,
    LoadConfiguration,
    HandleException,
    RegisterFacades,
    RegisterProviders,
    BootProviders,
  ];

  constructor(app: Application) {
    this.app = app;
    this.program = new CommanderCommand();
  }

  public async handle() {
    const VERSION = JSON.parse(
      fs.readFileSync(get_current_dir(import.meta.url) + "/../package.json", {
        encoding: "utf-8",
      })
    ).version;
    const args = JSON.parse(
      process.env.npm_config_argv as string
    ).original.slice(2);
    await this.app.bootstrapWith(this.bootstrappers);
    await this.builtinCommands();
    await this.commands();
    this.program.version(blue("Lunox Framework ") + "version " + VERSION);
    this.program.description("Laravel-Flavoured NodeJs framework");
    this.program.showHelpAfterError(true);
    this.program.parse(process.argv.slice(0, 2).concat(args));
  }

  /**
   * Register built in commans for the application
   */
  protected async builtinCommands() {
    const commands = [
      MakeCommand,
      MakeControllerCommand,
      MakeMiddlewareCommand,
      MakeMigrationCommand,
      MakeProviderCommand,
      MakeSeederCommand,
      MakeModelCommand,
      RunMigrationCommand,
      RunSeederCommand,
      RollbackMigrationCommand,
      ResetMigrationCommand,
      RefreshMigrationCommand,
    ];
    await Promise.all(
      commands.map((c) => {
        const commandInstance = new c();
        this.registerCommand(commandInstance);
      })
    );
  }
  /**
   * Register the Closure based commands for the application.
   */
  protected async commands() {
    // injected from Application Kernel Console
  }

  protected async load(paths: string) {
    let files: string[] = [];
    const walkDir = async (_path: string) => {
      const _files = fs.readdirSync(_path);
      await Promise.all(
        _files.map(async (f) => {
          if (fs.lstatSync(path.join(_path, f)).isDirectory()) {
            return walkDir(path.join(_path, f));
          }
          files = files.concat(path.join(_path, f));
        })
      );
    };
    // resolve all commands from given path
    walkDir(paths);
    // register all commands to artisan
    await Promise.all(
      files.map(async (f) => {
        const _command = (await import(f)).default as Class<Command>;
        const commandInstance = new _command();
        this.registerCommand(commandInstance);
      })
    );
  }

  protected registerCommand(commandInstance: Command) {
    // get arguments between curly brackets
    const args =
      commandInstance.getSignature().match(/(?<=\{)(.*?)(?=})/g) || [];
    const _program = this.program
      .command(commandInstance.getSignature().split(" ")[0])
      .description(commandInstance.getDescription())
      .action(async () => {
        const argKeys = args
          .filter((a) => !(a.startsWith("--") || a.startsWith("-")))
          .map((a) => a.replace("?", ""));
        const inputArgs = _program.args.reduce((p, c, i) => {
          p[argKeys[i].split(" : ")[0]] = c;
          return p;
        }, {} as ObjectOf<string>);

        commandInstance.setArguments(inputArgs);
        commandInstance.setOptions(_program.opts());
        const exitCode = await commandInstance.handle();
        exit(exitCode);
      });

    // parse arguments and options
    args.forEach((a) => {
      let desc = "";
      if (a.split(" : ").length == 2) {
        desc = a.split(" : ")[1];
        a = a.split(" : ")[0];
      }
      // if argument start with --, make it as option
      if (a.startsWith("--")||a.startsWith("-")) {
        if (a.split("=").length == 2) {
          if (a.split("=")[1] == "") {
            // option with required value
            return _program.option(`${a.split("=")[0]} <value>`, desc);
          }
          // option with optional value
          return _program.option(
            `${a.split("=")[0]} <value>`,
            desc,
            `${a.split("=")[1]}`
          );
        }
        return _program.option(a, desc);
      }
      // if argument have ?, make it as optional argument
      if (a.split("").pop() == "?") {
        return _program.argument(`[${a}]`, desc);
      }
      // else make it as required argument
      return _program.argument(`<${a}>`, desc);
    });
    _program.showHelpAfterError();
  }
}

export default Kernel;
