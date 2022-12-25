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

const grammars = Object.keys(packageInfo.devDependencies).filter(
  (n) =>
    n.startsWith("tree-sitter-") &&
    !["tree-sitter-cli", "tree-sitter-typescript"].includes(n)
);
grammars.push(
  ...["typescript", "tsx"].map((n) => path.join("tree-sitter-typescript", n))
);

let hasErrors = true;
const exec = util.promisify(require("child_process").exec);
PromisePool.withConcurrency(os.cpus().length * 2)
  .for(grammars)
  .process(async (name) => {
    try {
      console.log(`⏳ Building ${name}`);
      await exec(
        `yarn tree-sitter build-wasm ${path.join("..", "node_modules", name)}`
      );
      console.log(`✅ Finished building ${name}`);
    } catch (e) {
      console.error(`🔥 Failed to build ${name}:\n`, e);
      hasErrors = true;
    }
  })
  .then(() => {
    if (hasErrors) {
      process.exit(1);
    }
  });
