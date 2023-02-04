import obPlugin from "@aidenlx/esbuild-plugin-obsidian";
import { inlineWorkerPlugin } from "@obzt/esbuild-plugin-inline-worker";
import { build, context } from "esbuild";
import { lessLoader } from "esbuild-plugin-less";
import { readFile } from "fs/promises";
import { createRequire } from "module";
import { join, resolve } from "path";
// import myPackage from "./package.json" assert { type: "json" };
import semverPrerelease from "semver/functions/prerelease.js";
import PostcssPlugin from "@obzt/components/esbuild-postcss";

const myPackage = JSON.parse(await readFile("./package.json"));
const isPreRelease = semverPrerelease(myPackage.version) !== null;

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/
`;

const require = createRequire(import.meta.url);

const cmExternals = [
  "@codemirror/autocomplete",
  "@codemirror/collab",
  "@codemirror/commands",
  "@codemirror/language",
  "@codemirror/lint",
  "@codemirror/search",
  "@codemirror/state",
  "@codemirror/text",
  "@codemirror/view",
  "@lezer/common",
  "@lezer/lr",
  "@lezer/highlight",
  "@codemirror/closebrackets",
  "@codemirror/comment",
  "@codemirror/fold",
  "@codemirror/gutter",
  "@codemirror/highlight",
  "@codemirror/history",
  "@codemirror/matchbrackets",
  "@codemirror/panel",
  "@codemirror/rangeset",
  "@codemirror/rectangular-selection",
  "@codemirror/stream-parser",
  "@codemirror/tooltip",
];

const isProd = process.env.BUILD === "production";

const preactCompatPlugin = {
  name: "preact-compat",
  setup(build) {
    const preact = join(process.cwd(), "node_modules", "@preact", "compat");
    build.onResolve({ filter: /^(react-dom|react)$/ }, () => {
      return { path: join(preact, "index.mjs") };
    });
    build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => {
      return { path: join(preact, "jsx-runtime.mjs") };
    });
  },
};

/** @type import("esbuild").BuildOptions */
const baseOpts = {
  bundle: true,
  platform: "node",
  format: "cjs",
  mainFields: ["browser", "module", "main"],
  minify: isProd,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.BUILD),
  },
};

/** @type import("esbuild").BuildOptions */
const opts = {
  ...baseOpts,
  logLevel: process.env.BUILD === "development" ? "info" : "silent",
  external: ["obsidian", "electron", "@electron/remote", ...cmExternals],
  mainFields: ["browser", "module", "main"],
  sourcemap: isProd ? false : "inline",
  loader: {
    ".svg": "text",
    ".ejs": "text",
  },
  entryPoints: ["src/zt-main.ts"],
  banner: { js: banner },
  outfile: "build/main.js",
  tsconfig: "tsconfig.build.json",
  plugins: [
    lessLoader(),
    obPlugin({ beta: isPreRelease }),
    preactCompatPlugin,
    inlineWorkerPlugin({
      buildOptions: ({ path }) => ({
        ...baseOpts,
        tsconfig: path.startsWith("@/worker")
          ? resolve("src/worker/tsconfig.json")
          : require.resolve(`${path}/tsconfig`),
        sourcemap: !isProd ? "inline" : false,
      }),
      cachedir: "dist",
      watch: !isProd,
    }),
    PostcssPlugin({}),
  ],
};
try {
  if (!isProd) {
    await (await context(opts)).watch();
  } else {
    await build(opts);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
