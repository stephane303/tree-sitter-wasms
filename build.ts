import fs from "fs";
import os from "os";
import path from "path";
import util from "util";

import { PromisePool } from "@supercharge/promise-pool";
const findRoot = require("find-root");

import packageInfo from "./package.json";

let hasErrors = false;

async function buildParserWASM(name: string, subPath?: string) {
  const label = subPath ? path.join(name, subPath) : name;
  try {
    console.log(`⏳ Building ${label}`);
    const packagePath = findRoot(require.resolve(name));
    await exec(
      `yarn tree-sitter build-wasm ${
        subPath ? path.join(packagePath, subPath) : packagePath
      }`
    );
    console.log(`✅ Finished building ${label}`);
  } catch (e) {
    console.error(`🔥 Failed to build ${label}:\n`, e);
    hasErrors = true;
  }
}

const outDir = path.join(__dirname, "out");

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

fs.mkdirSync(outDir);

process.chdir(outDir);

const grammars = Object.keys(packageInfo.devDependencies).filter(
  (n) => n.startsWith("tree-sitter-") && n !== "tree-sitter-cli"
);

const exec = util.promisify(require("child_process").exec);
PromisePool.withConcurrency(os.cpus().length)
  .for(grammars)
  .process(async (name) => {
    if (name == "tree-sitter-typescript") {
      await buildParserWASM(name, "typescript");
      await buildParserWASM(name, "tsx");
    } else {
      await buildParserWASM(name);
    }
  })
  .then(() => {
    if (hasErrors) {
      process.exit(1);
    }
  });
