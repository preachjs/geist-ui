import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";
import fs from "node:fs";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import k from "kleur";
import maxmin from "maxmin";

/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "es",
    },
    external: ["preact", "preact/compat"],
    plugins: [
      typescript(),
      commonjs(),
      nodeResolve({
        browser: true,
      }),
      alias({
        entries: [
          {
            find: "react",
            replacement: "preact/compat",
          },
          {
            find: "react-dom",
            replacement: "preact/compat",
          },
        ],
      }),
      bundleSize(),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].cjs",
    },
    external: ["preact", "preact/compat"],
    plugins: [
      typescript({}),
      commonjs(),
      nodeResolve({
        browser: true,
      }),
      alias({
        entries: [
          {
            find: "react",
            replacement: "preact/compat",
          },
          {
            find: "react-dom",
            replacement: "preact/compat",
          },
        ],
      }),
      bundleSize(),
    ],
  },
  {
    input: "./src/index.ts",
    output: [
      { file: "dist/index.d.ts", format: "es" },
      {
        file: "dist/index.d.cts",
        format: "cjs",
      },
    ],

    plugins: [
      {
        buildEnd() {
          if (fs.existsSync("./dist/tmp")) {
            fs.rmSync("./dist/tmp", { recursive: true });
          }
        },
      },
      dts({
        compilerOptions: {
          baseUrl: ".",
        },
        respectExternal: false,
      }),
      nodeResolve({
        browser: true,
      }),
    ],
  },
];

function bundleSize() {
  return {
    name: "bundle-size",
    generateBundle(options, bundle) {
      for (let filename in bundle) {
        const hasCode = bundle[filename].code;
        if (!hasCode) {
          continue;
        }
        const size = maxmin(hasCode, hasCode, true);
        console.log(
          `Created bundle ${k.cyan(filename)}: ${size.slice(
            size.indexOf(" → ") + 3
          )}`
        );
      }
    },
  };
}
