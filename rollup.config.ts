import multi from "rollup-plugin-multi-input";
import { terser } from "rollup-plugin-terser";
import ts from "@rollup/plugin-typescript";

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
    plugins: [multi(), ts({ declaration: true }), production && terser()],
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
    ],
  },
];
