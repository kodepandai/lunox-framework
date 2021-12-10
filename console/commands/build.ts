import { runCommand } from "./runner";

const bundleTs = () => runCommand("NODE_ENV=production rollup -c");

const buildServer = () =>
  runCommand(
    "NODE_ENV='production' vite build --outDir dist/server --ssr entry-server.ts"
  );

const buildClient = () =>
  runCommand("NODE_ENV=production vite build --outDir dist/client");

const watch = () =>
  Promise.all([
    runCommand("rollup -cw", true),
    runCommand(
      "nodemon -q -w dist --es-module-specifier-resolution=node dist/index.js",
      true
    ),
  ]);

const serve = () =>
  runCommand(
    "NODE_ENV=production node --es-module-specifier-resolution=node dist/index.js",
    true
  );

export { bundleTs, buildServer, buildClient, watch, serve };
