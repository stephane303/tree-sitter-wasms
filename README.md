# tree-sitter-wasms
Prebuilt WASM binaries for tree-sitter's language parsers. Forked from [https://github.com/Menci/tree-sitter-wasm-prebuilt](https://github.com/Gregoor/tree-sitter-wasms) because I needed a working version of tree-sitter-vue

## Installation

```bash
pnpm add tree-sitter-wasms
# or
yarn add tree-sitter-wasms
# or
npm install tree-sitter-wasms
```

## Usage

```ts
import treeSitterRust from "tree-sitter-wasms/out/tree-sitter-rust.wasm"
parser.setLanguage(treeSitterCpp);
```

## Supported Languages

Check https://unpkg.com/browse/@stephane303/tree-sitter-wasms@latest/out/ to see all supported languages, and manually download the wasm artifacts directly.
