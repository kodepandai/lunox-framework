import multi from "rollup-plugin-multi-input";
import { terser } from "rollup-plugin-terser";
import ts from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

const production = process.env.NODE_ENV == "production";
export default [
  {
    input: [
      "src/**/index.ts",
      "src/helpers.ts",
      "src/entry-server.ts",
      "src/entry-client.ts",
      "src/Types.ts",
    ],
    output: {
      dir: "dist",
      format: "esm",
    },
    plugins: [
      json(),
      multi(),
      ts({ declaration: true, rootDir: "src" }),
      production && terser(),
    ],
    external: [
      "path",
      "url",
      "fs",
      "dotenv",
      "node-input-validator/cjs/index",
      "http",
      "sirv",
      "polka",
      "vite",
      "cors",
      "@slynova/flydrive",
      "@slynova/flydrive-s3",
      "formidable",
      "commander",
      "colorette",
      "process",
      "child_process",
      "knex",
      "objection",
      "pluralize",
    ],
  },
  {
    input: "console/lunox.ts",
    output: {
      file: "bin/lunox.cjs",
      format: "cjs",
    },
    plugins: [
      json(),
      ts({ outDir: "bin", declaration: false, rootDir: "console" }),
      production && terser(),
    ],
    external: ["commander", "colorette", "child_process"],
  },
];
