/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
const args = process.argv;
const command = args[2];
import { exec } from "child_process";


if (!command) {
  console.log("No command specified");
  process.exit(1);
}

function deleteHelper(path) {

  if (fs.existsSync(path)) {
    const lstat = fs.lstatSync(path);
    if (lstat.isFile()) {
      fs.unlinkSync(path);
    } else {
      const files = fs.readdirSync(path);
      files.forEach(file => {
        deleteHelper(`${path}/${file}`);
      });
      fs.rmdirSync(path);
    }
  }
}

let commandResult;
const env = {
  NODE_ENV: "production",
};

switch (command) {
  case "clean":
    deleteHelper("dist");
    break;
  case "build":

    switch (process.platform) {
      case "win32":
        commandResult = "npx rollup -c";
        break;

      default:
        commandResult = "NODE_ENV=production npx  rollup -c";
        break;
    }

    exec(commandResult, {...process.env, env }, (_error, _stdout, _stderr) => {
      const codes = fs.readFileSync("./bin/lunox.cjs", "utf-8");

      const codesWithShebang = `#!/usr/bin/env node\n${codes}`;

      fs.writeFileSync("./bin/lunox.cjs", codesWithShebang);

    });



    break;
  case "fix":
    deleteHelper("dist/Types.js");
    break;
  default:
    console.log("Unknown command");
    break;
}