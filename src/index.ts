const repl = require("node:repl");
const fs = require("fs");
const chokidar = require("chokidar");
const glob = require("glob");

repl.builtinModules = ["@playwright/test"];

import options from "./options";
import loadReplCommands from "./commands/index";
import {
  executeSpecContent,
  extractAllDeclaredVariablesAsString,
  extractPageAction,
  readLineFromFile,
} from "./utils";

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
      const context = await replServer.commands.chromium.action.apply(
        replServer,
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
        const match = cleanedNewTestCode
          ? cleanedNewTestCode[1]
          : newTestCode.replace(/import.*\n/g, "").replace(
              "// stop",
              `
    return exportLexicalScope(${variablesString});
    // stop`,
            );

        const abc = `(async () => { try { ${match} } catch (ex) { console.log(2, ex)} })()`;

        Object.assign(context, lexicalScope);
        await executeSpecContent(context, abc, (newLexicalScope: any) => {
          Object.assign(lexicalScope, newLexicalScope);
        });
      });

      chokidar.watch("./.zed/cursor-position").on("change", async () => {
        const position = fs.readFileSync("./.zed/cursor-position", "utf-8");
        const line = extractPageAction(readLineFromFile(position)!);

        const coda = `const locatx = ${line};
return locatx.evaluateHandle((el) => el);`;

        const selector = await executeSpecContent(context, coda);

        selector.evaluate((element: any) => {
          const style = document.createElement("style");
          style.setAttribute("id", "new-class-style");
          style.innerHTML = `
            .new-class {
              border: 1px solid rgba(255, 0, 0, 0.4) !important;
              background: rgba(255, 0, 0, 0.4) !important;
            }
          `;

          if (document.getElementById("new-class-style")) {
            document.getElementById("new-class-style")?.remove();
          }
          document.head.appendChild(style);

          document.querySelectorAll(".new-class").forEach((element) => {
            element.classList.remove("new-class");
          });
          element.classList.add("new-class");
        });

        // console.log({ coda, selector });

        // context.page.evaluate((sel: string) => {
        //   console.log(sel);
        // }, selector);
      });
    }
  };
  main();
}
