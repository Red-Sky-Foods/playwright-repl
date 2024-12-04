import repl from "node:repl";
import fs from "fs";
import chokidar from "chokidar";

// repl.builtinModules = ["@playwright/test"];

import options from "./options";
import loadReplCommands from "./commands/index";
import {
  executeSpecContent,
  extractAllDeclaredVariablesAsString,
  extractPageAction,
  readLineFromFile,
} from "./utils";
import { removeRecordCode, startRecordCode } from "./utils/browser-functions";

const specFile = options.file;
const testCode = fs.readFileSync(specFile, "utf-8");

// remove all import statements from the test code
const cleanedTestCode = testCode.replace(/^import.*$/gm, "// Removed import");

const replServer = repl.start({
  useColors: true,
  prompt: "playwright> ",
});

loadReplCommands(replServer);

replServer.on("exit", () => {
  process.exit();
});

if (cleanedTestCode) {
  const main = async () => {
    if (options.url) {
      const context = await replServer.commands.chromium?.action.apply(
        replServer,
        // @ts-ignore
        [],
      );

      // replace stop by something which will return the lexical scope
      const variablesString =
        extractAllDeclaredVariablesAsString(cleanedTestCode);
      const testCodeWithLexicalScopeExport = cleanedTestCode.replace(
        "// stop",
        `
return exportLexicalScope(${variablesString});
// stop`,
      );
      //

      const lexicalScope = {};

      await executeSpecContent(
        context,
        testCodeWithLexicalScopeExport,
        (newLexicalScope: any) => {
          Object.assign(lexicalScope, newLexicalScope);
        },
      );

      chokidar.watch(specFile).on("change", async (event: any, path: any) => {
        const newTestCode = fs.readFileSync(specFile, "utf-8");
        const cleanedNewTestCode = newTestCode.match(
          /\/\/ start([\s\S]*?)\/\/ stop/,
        );
        let match = cleanedNewTestCode
          ? cleanedNewTestCode[1]
          : newTestCode.replace(/import.*\n/g, "").replace(
              "// stop",
              `
    return exportLexicalScope(${variablesString});
    // stop`,
            );

        if (match.includes("// record")) {
          match = match.replace("// record", startRecordCode);
        } else {
          match = `${removeRecordCode};\n${match}`;
        }

        Object.assign(context!, lexicalScope);
        await executeSpecContent(context, match, (newLexicalScope: any) => {
          Object.assign(lexicalScope, newLexicalScope);
        });
      });

      chokidar.watch("./.zed/cursor-position").on("change", async () => {
        const position = fs.readFileSync("./.zed/cursor-position", "utf-8");
        const action = position?.endsWith("identify\n")
          ? "identify"
          : "execute";

        let line;

        if (action === "identify") {
          // remove the method call, we are only interested in executing the selector itself, not the method, to identify the element
          line = extractPageAction(readLineFromFile(position)!);
        } else {
          line = readLineFromFile(position);
        }

        const selector = await executeSpecContent(context, `return ${line};`);

        if (action === "identify") {
          try {
            selector.evaluate((element: any) => {
              const style = document.createElement("style");
              style.setAttribute(
                "id",
                "playwright-repl-identify-selector-style",
              );
              style.innerHTML = `.playwright-repl-identify-selector {
  border: 1px solid rgba(255, 0, 0, 0.4) !important;
  background: rgba(255, 0, 0, 0.4) !important;
}`;

              if (
                !document.getElementById(
                  "playwright-repl-identify-selector-style",
                )
              ) {
                document.head.appendChild(style);
              }

              document
                .querySelectorAll(".playwright-repl-identify-selector")
                .forEach((element) => {
                  element.classList.remove("playwright-repl-identify-selector");
                });
              element.classList.add("playwright-repl-identify-selector");
            });
          } catch (ex) {
            console.error("identify action");
            console.error(ex);
          }
        }
      });
    }
  };
  main();
}
