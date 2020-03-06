import fs from "fs";
import os from "os";
import path from "path";
import util from "util";

import { PromisePool } from "@supercharge/promise-pool";

import packageInfo from "./package.json";

const outDir = path.join(__dirname, "out");

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir);

process.chdir(outDir);

const treeSitterCli = path.join(
  __dirname,
  "node_modules",
  ".bin",
  "tree-sitter"
);

const grammars = Object.keys(packageInfo.devDependencies).filter(
  (n) =>
    n.startsWith("tree-sitter-") &&
    !["tree-sitter-cli", "tree-sitter-typescript"].includes(n)
);
grammars.push(
  ...["typescript", "tsx"].map((n) => path.join("tree-sitter-typescript", n))
);

const exec = util.promisify(require("child_process").exec);

PromisePool.withConcurrency(os.cpus().length)
  .for(grammars)
  .process(async (name) => {
    try {
      console.log(`⏳ Building ${name}`);
      await exec(
        `${treeSitterCli} build-wasm ${path.join("..", "node_modules", name)}`
      );
      console.log(`✅ Finished building ${name}`);
    } catch (e) {
      console.error(`🔥 Failed to build ${name}:\n`, e);
    }
  });
