import { greenBright, red, yellowBright } from "colorette";
import { spawn } from "child_process";
const runCommand = (command: string, watch = false) => {
  const child = spawn(command, {
    shell: true,
  });

  let stdout = "";
  let stderr = "";

  return new Promise<void>((ok, fail) => {
    child.stderr.setEncoding("utf-8");
    child.stdout.setEncoding("utf-8");
    child.stdout.on("data", (data) => {
      if (watch) {
        console.log(greenBright(data));
      }
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      if (watch) {
        console.log(yellowBright(data));
      }
      stderr += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(yellowBright(stdout));
        ok();
      } else {
        console.log(red(stderr));
        console.log(red(`artisan command exited with code ${code}`));
        fail(stderr);
      }
    });

    child.on("error", fail);
  });
};

const tryCommand = async (name: string, run: () => Promise<void>) => {
  try {
    await run();
  } catch (error) {
    console.log(red(name + " failed"));
  }
};

export { runCommand, tryCommand };
